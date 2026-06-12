const { v2: cloudinary } = require('cloudinary');

const UPLOAD_FOLDER = 'svn-automation';

let configured = false;

function ensureConfigured() {
  if (configured) return true;
  if (!process.env.CLOUDINARY_URL) return false;
  cloudinary.config({ secure: true });
  configured = true;
  return true;
}

function isConfigured() {
  return ensureConfigured();
}

function isCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /res\.cloudinary\.com/i.test(url);
}

function publicIdFromUrl(url) {
  if (!isCloudinaryUrl(url)) return null;
  try {
    const parsed = new URL(url);
    const marker = '/upload/';
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return null;
    let rest = parsed.pathname.slice(idx + marker.length);
    // Bỏ version v1234567890/
    rest = rest.replace(/^v\d+\//, '');
    return decodeURIComponent(rest);
  } catch {
    return null;
  }
}

function uploadMulterFile(file) {
  if (!ensureConfigured()) {
    return Promise.reject(new Error('CLOUDINARY_URL is not configured'));
  }
  if (!file?.buffer?.length) {
    return Promise.reject(new Error('Missing file buffer'));
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: UPLOAD_FOLDER,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
      },
      (err, result) => {
        if (err) return reject(err);
        file.cloudinaryUrl = result.secure_url;
        file.cloudinaryPublicId = result.public_id;
        resolve(result);
      },
    );
    stream.end(file.buffer);
  });
}

async function uploadMulterFiles(files) {
  const list = Array.isArray(files) ? files : [];
  await Promise.all(list.map((file) => uploadMulterFile(file)));
}

async function destroyByUrl(url) {
  const publicId = publicIdFromUrl(url);
  if (!publicId) return false;
  if (!ensureConfigured()) return false;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return true;
  } catch (err) {
    if (err?.http_code === 404) return false;
    throw err;
  }
}

async function listImages({ limit = 200, offset = 0 } = {}) {
  if (!ensureConfigured()) return { items: [], total: 0 };

  const safeLimit = Math.min(500, Math.max(1, limit));
  const safeOffset = Math.max(0, offset);

  const result = await cloudinary.api.resources({
    type: 'upload',
    prefix: `${UPLOAD_FOLDER}/`,
    max_results: safeLimit,
    direction: 'desc',
  });

  const all = (result.resources || []).map((item) => ({
    name: item.public_id,
    url: item.secure_url,
    size: item.bytes,
    mtime: item.created_at ? Date.parse(item.created_at) : 0,
  }));

  return {
    items: all.slice(safeOffset, safeOffset + safeLimit),
    total: result.total_count ?? all.length,
  };
}

module.exports = {
  isConfigured,
  isCloudinaryUrl,
  publicIdFromUrl,
  uploadMulterFile,
  uploadMulterFiles,
  destroyByUrl,
  listImages,
  UPLOAD_FOLDER,
};
