const slugify = require('slugify');
const News = require('../models/News');
const { parseBool } = require('../utils/parse');
const { unlinkUploadedImage, normalizeImageForResponse } = require('../utils/uploadUtils');

async function uniqueSlugFromTitle(title) {
  let base = slugify(String(title), { lower: true, strict: true });
  if (!base) base = 'news';
  let candidate = base;
  let n = 1;
  while (await News.exists({ slug: candidate })) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

async function listNews({ isAdmin, publicUploadUrl, page, limit }) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (safePage - 1) * safeLimit;
  const filter = isAdmin ? {} : { isPublished: true };

  const [items, total] = await Promise.all([
    News.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    News.countDocuments(filter),
  ]);

  const data = items.map((item) => ({
    ...item,
    image: normalizeImageForResponse({ publicUploadUrl, image: item.image }),
  }));

  return {
    data,
    page: safePage,
    limit: safeLimit,
    total,
    pages: Math.ceil(total / safeLimit) || 1,
  };
}

async function getNewsById({ id, isAdmin, publicUploadUrl }) {
  const item = await News.findById(id).lean();
  if (!item) return null;
  if (!isAdmin && !item.isPublished) return null;
  return { ...item, image: normalizeImageForResponse({ publicUploadUrl, image: item.image }) };
}

async function createNews({ body, file, publicUploadUrl }) {
  const { title, excerpt, content, publishedAt } = body || {};
  if (!title || !String(title).trim()) {
    const e = new Error('title is required');
    e.statusCode = 400;
    throw e;
  }

  const slug = await uniqueSlugFromTitle(title);
  const image = file ? publicUploadUrl(file.filename) : undefined;
  const isPublished = parseBool(body?.isPublished, false);

  let publishedAtDate;
  if (publishedAt) {
    publishedAtDate = new Date(publishedAt);
    if (Number.isNaN(publishedAtDate.getTime())) {
      const e = new Error('publishedAt is invalid');
      e.statusCode = 400;
      throw e;
    }
  }

  const doc = await News.create({
    title: String(title).trim(),
    slug,
    excerpt: excerpt != null ? String(excerpt) : undefined,
    content: content != null ? String(content) : undefined,
    image,
    publishedAt: publishedAtDate,
    isPublished,
  });

  const o = doc.toObject();
  o.image = normalizeImageForResponse({ publicUploadUrl, image: o.image });
  return o;
}

async function updateNews({ id, body, file, publicUploadUrl, uploadDir }) {
  const existing = await News.findById(id);
  if (!existing) return null;

  const { title, slug, excerpt, content, publishedAt } = body || {};

  if (title !== undefined) {
    if (!String(title).trim()) {
      const e = new Error('title cannot be empty');
      e.statusCode = 400;
      throw e;
    }
    existing.title = String(title).trim();
  }

  if (slug !== undefined) {
    const s = String(slug).trim();
    if (s && s !== existing.slug) {
      const taken = await News.exists({ slug: s, _id: { $ne: existing._id } });
      if (taken) {
        const e = new Error('slug already in use');
        e.statusCode = 400;
        throw e;
      }
      existing.slug = s;
    }
  }

  if (excerpt !== undefined) existing.excerpt = String(excerpt);
  if (content !== undefined) existing.content = String(content);

  if (publishedAt !== undefined) {
    if (publishedAt === '' || publishedAt === null) {
      existing.publishedAt = undefined;
    } else {
      const d = new Date(publishedAt);
      if (Number.isNaN(d.getTime())) {
        const e = new Error('publishedAt is invalid');
        e.statusCode = 400;
        throw e;
      }
      existing.publishedAt = d;
    }
  }

  if (body?.isPublished !== undefined) {
    existing.isPublished = parseBool(body.isPublished, existing.isPublished);
  }

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

async function deleteNews({ id, uploadDir }) {
  const existing = await News.findById(id);
  if (!existing) return false;
  await unlinkUploadedImage({ uploadDir, imageUrl: existing.image });
  await existing.deleteOne();
  return true;
}

module.exports = {
  listNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
};

