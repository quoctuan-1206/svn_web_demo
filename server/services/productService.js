const slugify = require('slugify');
const Product = require('../models/Product');
const { parseBool, parseNumber } = require('../utils/parse');
const { unlinkUploadedImage, normalizeImageForResponse } = require('../utils/uploadUtils');

function isObjectId24(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

function mapProductItem({ publicUploadUrl, item }) {
  if (!item) return null;
  return {
    ...item,
    image: normalizeImageForResponse({ publicUploadUrl, image: item.image }),
  };
}

async function uniqueSlugFromTitle(title) {
  let base = slugify(String(title), { lower: true, strict: true });
  if (!base) base = 'item';
  let candidate = base;
  let n = 1;
  while (await Product.exists({ slug: candidate })) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

async function listProducts({ isAdmin, publicUploadUrl }) {
  const filter = isAdmin ? {} : { isActive: true };
  const items = await Product.find(filter).sort({ order: 1, createdAt: -1 }).lean();
  return items.map((p) => mapProductItem({ publicUploadUrl, item: p }));
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
  if (isObjectId24(param)) {
    return getProductById({ id: param, isAdmin, publicUploadUrl });
  }
  return getProductBySlug({ slug: param, isAdmin, publicUploadUrl });
}

async function createProduct({ body, file, publicUploadUrl }) {
  const { title, description, excerpt, content, category } = body || {};
  if (!title || !String(title).trim()) {
    const e = new Error('title is required');
    e.statusCode = 400;
    throw e;
  }

  const order = parseNumber(body?.order, 0);
  const isActive = parseBool(body?.isActive, true);
  const image = file ? publicUploadUrl(file.filename) : undefined;
  const slug = await uniqueSlugFromTitle(title);

  const doc = await Product.create({
    title: String(title).trim(),
    slug,
    excerpt: excerpt != null ? String(excerpt) : undefined,
    content: content != null ? String(content) : undefined,
    description: description != null ? String(description) : undefined,
    category: category || undefined,
    order,
    isActive,
    image,
  });

  const o = doc.toObject();
  return mapProductItem({ publicUploadUrl, item: o });
}

async function updateProduct({ id, body, file, publicUploadUrl, uploadDir }) {
  const existing = await Product.findById(id);
  if (!existing) return null;

  const { title, description, excerpt, content, category } = body || {};

  if (title !== undefined) {
    if (!String(title).trim()) {
      const e = new Error('title cannot be empty');
      e.statusCode = 400;
      throw e;
    }
    existing.title = String(title).trim();
    if (!existing.slug) {
      existing.slug = await uniqueSlugFromTitle(existing.title);
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
  const o = existing.toObject();
  return mapProductItem({ publicUploadUrl, item: o });
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
  getProductOne,
  createProduct,
  updateProduct,
  deleteProduct,
};
