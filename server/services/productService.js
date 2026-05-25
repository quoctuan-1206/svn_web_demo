const Product = require('../models/Product');
const { parseBool, parseNumber } = require('../utils/parse');
const { isObjectId } = require('../utils/mongo');
const { uniqueSlug } = require('../utils/slug');
const { httpError } = require('../utils/httpError');
const { unlinkUploadedImage, normalizeImageForResponse } = require('../utils/uploadUtils');

function mapProductItem({ publicUploadUrl, item }) {
  if (!item) return null;
  return {
    ...item,
    image: normalizeImageForResponse({ publicUploadUrl, image: item.image }),
  };
}

async function listProducts({ isAdmin, publicUploadUrl }) {
  const filter = isAdmin ? {} : { isActive: true };
  const items = await Product.find(filter).sort({ order: 1, createdAt: -1 }).lean();
  return items.map((item) => mapProductItem({ publicUploadUrl, item }));
}

async function getProductById({ id, isAdmin, publicUploadUrl }) {
  const item = await Product.findById(id).lean();
  if (!item) return null;
  if (!isAdmin && item.isActive === false) return null;
  return mapProductItem({ publicUploadUrl, item });
}

async function getProductBySlug({ slug, isAdmin, publicUploadUrl }) {
  const s = String(slug || '').trim();
  if (!s) return null;
  const item = await Product.findOne({ slug: s }).lean();
  if (!item) return null;
  if (!isAdmin && item.isActive === false) return null;
  return mapProductItem({ publicUploadUrl, item });
}

async function getProductOne({ param, isAdmin, publicUploadUrl }) {
  if (isObjectId(param)) {
    return getProductById({ id: param, isAdmin, publicUploadUrl });
  }
  return getProductBySlug({ slug: param, isAdmin, publicUploadUrl });
}

async function createProduct({ body, file, publicUploadUrl }) {
  const { title, description, excerpt, content, category } = body || {};
  if (!title || !String(title).trim()) {
    throw httpError(400, 'title is required');
  }

  const doc = await Product.create({
    title: String(title).trim(),
    slug: await uniqueSlug(Product, title, 'item'),
    excerpt: excerpt != null ? String(excerpt) : undefined,
    content: content != null ? String(content) : undefined,
    description: description != null ? String(description) : undefined,
    category: category || undefined,
    order: parseNumber(body?.order, 0),
    isActive: parseBool(body?.isActive, true),
    image: file ? publicUploadUrl(file.filename) : undefined,
  });

  return mapProductItem({ publicUploadUrl, item: doc.toObject() });
}

async function updateProduct({ id, body, file, publicUploadUrl, uploadDir }) {
  const existing = await Product.findById(id);
  if (!existing) return null;

  const { title, description, excerpt, content, category } = body || {};

  if (title !== undefined) {
    if (!String(title).trim()) {
      throw httpError(400, 'title cannot be empty');
    }
    existing.title = String(title).trim();
    if (!existing.slug) {
      existing.slug = await uniqueSlug(Product, existing.title, 'item');
    }
  }

  if (description !== undefined) existing.description = String(description);
  if (excerpt !== undefined) existing.excerpt = excerpt != null ? String(excerpt) : undefined;
  if (content !== undefined) existing.content = content != null ? String(content) : undefined;
  if (category !== undefined) existing.category = category || undefined;
  if (body?.order !== undefined) existing.order = parseNumber(body.order, existing.order);
  if (body?.isActive !== undefined) existing.isActive = parseBool(body.isActive, existing.isActive);

  if (file) {
    const prevImage = existing.image;
    existing.image = publicUploadUrl(file.filename);
    await unlinkUploadedImage({ uploadDir, imageUrl: prevImage });
  }

  await existing.save();
  return mapProductItem({ publicUploadUrl, item: existing.toObject() });
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
  getProductOne,
  createProduct,
  updateProduct,
  deleteProduct,
};
