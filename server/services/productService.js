const Product = require('../models/Product');
const { parseBool, parseNumber } = require('../utils/parse');
const { unlinkUploadedImage, normalizeImageForResponse } = require('../utils/uploadUtils');

async function listProducts({ isAdmin, publicUploadUrl }) {
  const filter = isAdmin ? {} : { isActive: true };
  const items = await Product.find(filter).sort({ order: 1, createdAt: -1 }).lean();
  return items.map((p) => ({
    ...p,
    image: normalizeImageForResponse({ publicUploadUrl, image: p.image }),
  }));
}

async function getProductById({ id, isAdmin, publicUploadUrl }) {
  const item = await Product.findById(id).lean();
  if (!item) return null;
  if (!isAdmin && item.isActive === false) return null;
  return { ...item, image: normalizeImageForResponse({ publicUploadUrl, image: item.image }) };
}

async function createProduct({ body, file, publicUploadUrl }) {
  const { title, description, category } = body || {};
  if (!title || !String(title).trim()) {
    const e = new Error('title is required');
    e.statusCode = 400;
    throw e;
  }

  const order = parseNumber(body?.order, 0);
  const isActive = parseBool(body?.isActive, true);
  const image = file ? publicUploadUrl(file.filename) : undefined;

  const doc = await Product.create({
    title: String(title).trim(),
    description: description != null ? String(description) : undefined,
    category: category || undefined,
    order,
    isActive,
    image,
  });

  const o = doc.toObject();
  o.image = normalizeImageForResponse({ publicUploadUrl, image: o.image });
  return o;
}

async function updateProduct({ id, body, file, publicUploadUrl, uploadDir }) {
  const existing = await Product.findById(id);
  if (!existing) return null;

  const { title, description, category } = body || {};

  if (title !== undefined) {
    if (!String(title).trim()) {
      const e = new Error('title cannot be empty');
      e.statusCode = 400;
      throw e;
    }
    existing.title = String(title).trim();
  }
  if (description !== undefined) existing.description = String(description);
  if (category !== undefined) existing.category = category || undefined;
  if (body?.order !== undefined) existing.order = parseNumber(body.order, existing.order);
  if (body?.isActive !== undefined) existing.isActive = parseBool(body.isActive, existing.isActive);

  if (file) {
    const prevImage = existing.image;
    existing.image = publicUploadUrl(file.filename);
    await unlinkUploadedImage({ uploadDir, imageUrl: prevImage });
  }

  await existing.save();
  const o = existing.toObject();
  o.image = normalizeImageForResponse({ publicUploadUrl, image: o.image });
  return o;
}

async function deleteProduct({ id, uploadDir }) {
  const existing = await Product.findById(id);
  if (!existing) return false;
  await unlinkUploadedImage({ uploadDir, imageUrl: existing.image });
  await existing.deleteOne();
  return true;
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

