const path = require('path');
const fs = require('fs').promises;

function filenameFromImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const marker = '/uploads/';
  const i = imageUrl.indexOf(marker);
  const raw = i !== -1 ? imageUrl.slice(i + marker.length) : path.basename(imageUrl);
  const name = raw.split('?')[0];
  if (!name || name.includes('..') || path.isAbsolute(name)) return null;
  return name;
}

async function unlinkUploadedImage({ uploadDir, imageUrl }) {
  const filename = filenameFromImageUrl(imageUrl);
  if (!filename) return;
  const filePath = path.join(uploadDir, filename);
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error(err);
  }
}

function normalizeImageForResponse({ publicUploadUrl, image }) {
  if (!image) return image;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return publicUploadUrl(image);
}

module.exports = {
  filenameFromImageUrl,
  unlinkUploadedImage,
  normalizeImageForResponse,
};

