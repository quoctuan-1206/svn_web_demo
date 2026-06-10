import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Quaternion,
  TextureLoader,
  TubeGeometry,
  Vector3,
} from "three";

const GLOBE_MASK = "/images/3der.png";
const SPHERE_RADIUS = 0.92;

const GLOBE_LOCATIONS = [
  { id: "hcm", label: "TP.HCM", lat: 10.8231, lon: 106.6297 },
  { id: "penang", label: "Penang", lat: 5.4141, lon: 100.3288 },
];

function latLonToVector3(lat, lon, radius) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function isLandPixel(r, g, b) {
  const sum = r + g + b;
  if (sum < 40 || sum > 740) return false;
  return b > r + 18 && b > g + 8 && b > 90;
}

function sampleDotPositions(image, radius) {
  try {
    const canvas = document.createElement("canvas");
    const w = 360;
    const h = 180;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || !image?.naturalWidth) return null;

    ctx.drawImage(image, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    const verts = [];
    const latStep = 4;
    const lonStep = 4;

    for (let lat = -84; lat <= 84; lat += latStep) {
      for (let lon = -180; lon < 180; lon += lonStep) {
        const u = (lon + 180) / 360;
        const v = (90 - lat) / 180;
        const px = Math.min(w - 1, Math.floor(u * w));
        const py = Math.min(h - 1, Math.floor(v * h));
        const i = (py * w + px) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (!isLandPixel(r, g, b)) continue;
        if (((lat * 7 + lon * 11) % 9) > 5) continue;

        const p = latLonToVector3(lat, lon, radius * 1.002);
        verts.push(p.x, p.y, p.z);
      }
    }

    if (verts.length < 12) return null;

    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(new Float32Array(verts), 3));
    return geo;
  } catch {
    return null;
  }
}

function DotGlobe({ radius }) {
  const texture = useLoader(TextureLoader, GLOBE_MASK);
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    const img = texture.image;
    if (!img) return undefined;

    const build = () => {
      const geo = sampleDotPositions(img, radius);
      setGeometry(geo);
    };

    if (img.complete && img.naturalWidth > 0) build();
    else {
      img.addEventListener("load", build, { once: true });
      return () => img.removeEventListener("load", build);
    }
    return undefined;
  }, [texture, radius]);

  useEffect(() => {
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);

  if (!geometry) return null;

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color="#4f9fd4"
        size={0.022}
        sizeAttenuation
        transparent
        opacity={0.92}
        depthWrite={false}
      />
    </points>
  );
}

function MapPin({ lat, lon, radius }) {
  const { position, quaternion } = useMemo(() => {
    const normal = latLonToVector3(lat, lon, 1).normalize();
    const pos = normal.clone().multiplyScalar(radius * 1.02);
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), normal);
    return { position: pos, quaternion: q };
  }, [lat, lon, radius]);

  return (
    <group position={position} quaternion={quaternion}>
      <mesh position={[0, 0.055, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.034, 0.062, 16]} />
        <meshBasicMaterial color="#16a34a" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.026, 16, 16]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function PartnerNode({ lat, lon, radius }) {
  const pos = useMemo(
    () => latLonToVector3(lat, lon, radius * 1.006),
    [lat, lon, radius],
  );

  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.02, 10, 10]} />
      <meshBasicMaterial color="#1d4ed8" toneMapped={false} />
    </mesh>
  );
}

function ConnectionArc({ from, to, radius }) {
  const geometry = useMemo(() => {
    try {
      const start = latLonToVector3(from.lat, from.lon, 1).normalize();
      const end = latLonToVector3(to.lat, to.lon, 1).normalize();
      const points = [];

      for (let i = 0; i <= 48; i += 1) {
        const t = i / 48;
        const point = new Vector3().copy(start).slerp(end, t).normalize();
        const lift = 1 + 0.14 * Math.sin(t * Math.PI);
        points.push(point.multiplyScalar(radius * lift));
      }

      if (points.length < 4) return null;
      const curve = new CatmullRomCurve3(points);
      return new TubeGeometry(curve, 48, 0.007, 6, false);
    } catch {
      return null;
    }
  }, [from.lat, from.lon, to.lat, to.lon, radius]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color="#3b82f6"
        transparent
        opacity={0.85}
        toneMapped={false}
      />
    </mesh>
  );
}

function FitGlobeCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!("fov" in camera)) return;

    const aspect = size.width / size.height || 1;
    const vFovRad = (camera.fov * Math.PI) / 180;
    const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);
    const distV = SPHERE_RADIUS / Math.tan(vFovRad / 2);
    const distH = SPHERE_RADIUS / Math.tan(hFovRad / 2);
    const distance = Math.max(distV, distH) * 1.18;

    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

function GlobeControls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef(null);

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.target.set(0, 0, 0);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.65;
    controlsRef.current = controls;

    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
}

const DECOR_NODES = [
  { lat: 40.7, lon: -74 },
  { lat: 51.5, lon: -0.1 },
  { lat: 35.7, lon: 139.7 },
  { lat: -33.9, lon: 151.2 },
  { lat: 1.35, lon: 103.8 },
  { lat: 28.6, lon: 77.2 },
];

function Earth() {
  const hcm = GLOBE_LOCATIONS[0];
  const penang = GLOBE_LOCATIONS[1];

  return (
    <group rotation={[0, -2.05, 0.08]}>
      <DotGlobe radius={SPHERE_RADIUS} />
      {DECOR_NODES.map((node) => (
        <PartnerNode
          key={`${node.lat}-${node.lon}`}
          lat={node.lat}
          lon={node.lon}
          radius={SPHERE_RADIUS}
        />
      ))}
      <MapPin lat={hcm.lat} lon={hcm.lon} radius={SPHERE_RADIUS} />
      <MapPin lat={penang.lat} lon={penang.lon} radius={SPHERE_RADIUS} />
      <ConnectionArc from={hcm} to={penang} radius={SPHERE_RADIUS} />
    </group>
  );
}

function GlobeScene() {
  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 3, 6]} intensity={0.45} />
      <FitGlobeCamera />
      <GlobeControls />
      <Suspense fallback={null}>
        <Earth />
      </Suspense>
    </>
  );
}

export default function PartnersGlobe() {
  return (
    <Canvas
      className="partners-globe-canvas"
      camera={{ position: [0, 0, 3.5], fov: 36 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <GlobeScene />
    </Canvas>
  );
}
