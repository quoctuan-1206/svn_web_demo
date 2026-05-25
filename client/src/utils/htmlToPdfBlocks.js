/** Chuyển HTML / plain text thành khối văn bản cho pdfmake (kèm ảnh khi có thể). */

function decodeEntities(text) {
  if (typeof document === "undefined") return text;
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

function stripTags(html) {
  return String(html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function plainLinesToBlocks(text) {
  const blocks = [];
  const lines = String(text || "").split("\n");
  let buf = [];

  function flush() {
    const joined = buf.join("\n").trim();
    buf = [];
    if (joined) {
      blocks.push({
        text: joined,
        style: "body",
        margin: [0, 0, 0, 10],
      });
    }
  }

  for (const line of lines) {
    const t = line.trim();
    const mdImg = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(t);
    if (mdImg) {
      flush();
      const label = mdImg[1] || "Hình ảnh";
      blocks.push({
        text: `[${label}: ${mdImg[2]}]`,
        style: "caption",
        margin: [0, 0, 0, 8],
      });
      continue;
    }
    if (!t) {
      flush();
      continue;
    }
    buf.push(line);
  }
  flush();
  return blocks;
}

function resolveImageUrl(src) {
  if (!src) return "";
  if (/^data:/.test(src)) return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (typeof window === "undefined") return src;
  try {
    return new URL(src, window.location.origin).toString();
  } catch {
    return src;
  }
}

async function fetchImageAsDataUrl(src) {
  const url = resolveImageUrl(src);
  if (!url || /^data:/.test(url)) return url;

  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`Không tải được ảnh (${res.status})`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Không đọc được ảnh"));
    reader.readAsDataURL(blob);
  });
}

async function htmlDomToBlocks(html) {
  const blocks = [];
  const root = document.createElement("div");
  root.innerHTML = html;

  const selectors = "h1,h2,h3,h4,h5,h6,p,li,blockquote,pre,img";
  const nodes = root.querySelectorAll(selectors);

  if (nodes.length > 0) {
    for (const el of nodes) {
      const tag = el.tagName.toLowerCase();
      if (tag === "img") {
        const alt = el.getAttribute("alt") || "Hình ảnh";
        const src = el.getAttribute("src") || "";
        try {
          const dataUrl = await fetchImageAsDataUrl(src);
          if (dataUrl) {
            blocks.push({
              image: dataUrl,
              fit: [480, 320],
              margin: [0, 6, 0, 6],
            });
            if (alt) {
              blocks.push({
                text: alt,
                style: "caption",
                margin: [0, 0, 0, 10],
              });
            }
            continue;
          }
        } catch {
          // Fallback to caption when image fetch fails
        }
        blocks.push({
          text: src ? `[${alt}: ${src}]` : `[${alt}]`,
          style: "caption",
          margin: [0, 0, 0, 10],
        });
        continue;
      }

      const text = el.innerText?.replace(/\s+/g, " ").trim();
      if (!text) continue;
      if (/^h[1-6]$/.test(tag)) {
        blocks.push({
          text,
          style: "heading",
          margin: [0, 14, 0, 6],
        });
      } else if (tag === "li") {
        blocks.push({
          text: `• ${text}`,
          style: "body",
          margin: [0, 2, 0, 4],
        });
      } else if (tag === "blockquote") {
        blocks.push({
          text,
          style: "quote",
          margin: [12, 4, 0, 10],
        });
      } else {
        blocks.push({
          text,
          style: "body",
          margin: [0, 0, 0, 10],
        });
      }
    }
    return blocks;
  }

  const fallback = root.innerText?.trim() || stripTags(html);
  return plainLinesToBlocks(fallback);
}

/**
 * @param {string} body
 * @returns {Promise<Array<{ text?: string, style?: string, margin?: number[], [key: string]: unknown }>>}
 */
export async function htmlToPdfBlocks(body) {
  const raw = String(body || "").trim();
  if (!raw) {
    return [
      {
        text: "Nội dung đang được cập nhật.",
        style: "body",
        color: "#64748b",
      },
    ];
  }

  const isHtml =
    /^</.test(raw) ||
    /<(p|div|img|h[1-6]|ul|ol|li|br|figure|blockquote)\b/i.test(raw);

  if (isHtml && typeof document !== "undefined") {
    const blocks = await htmlDomToBlocks(decodeEntities(raw));
    return Array.isArray(blocks) ? blocks : [];
  }

  return plainLinesToBlocks(decodeEntities(stripTags(raw)));
}
