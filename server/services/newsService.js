const News = require('../models/News');
const { parseBool } = require('../utils/parse');
const { isObjectId } = require('../utils/mongo');
const { uniqueSlug } = require('../utils/slug');
const { httpError } = require('../utils/httpError');
const { parsePagination, paginatedResult } = require('../utils/pagination');
const { unlinkUploadedImage, normalizeImageForResponse } = require('../utils/uploadUtils');
const { resolveUploadedImageUrl } = require('../middleware/uploadMiddleware');
const {
  buildEnglishFields,
  shouldAutoTranslate,
} = require('../utils/translate');

const MAX_GALLERY_IMAGES = 20;

function parseGalleryInput(raw) {
  if (raw == null || raw === '') return undefined;

  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim()).filter(Boolean);
      }
    } catch {
      // comma-separated URLs
    }
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return undefined;
}

function mapNewsItem({ publicUploadUrl, item }) {
  if (!item) return null;

  const gallery = Array.isArray(item.gallery)
    ? item.gallery
        .map((url) => normalizeImageForResponse({ publicUploadUrl, image: url }))
        .filter(Boolean)
    : [];

  return {
    ...item,
    image: normalizeImageForResponse({ publicUploadUrl, image: item.image }),
    gallery,
  };
}

function assertGalleryLimit(gallery) {
  if (gallery && gallery.length > MAX_GALLERY_IMAGES) {
    throw httpError(400, `gallery exceeds ${MAX_GALLERY_IMAGES} images`);
  }
}

function parsePublishedAt(value) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw httpError(400, 'publishedAt is invalid');
  }
  return date;
}

async function listNews({ isAdmin, publicUploadUrl, page, limit }) {
  const { page: safePage, limit: safeLimit, skip } = parsePagination({ page, limit });
  const filter = isAdmin ? {} : { isPublished: true };

  const [items, total] = await Promise.all([
    News.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    News.countDocuments(filter),
  ]);

  const data = items.map((item) => mapNewsItem({ publicUploadUrl, item }));
  return paginatedResult({ items: data, total, page: safePage, limit: safeLimit });
}

async function getNewsById({ id, isAdmin, publicUploadUrl }) {
  const item = await News.findById(id).lean();
  if (!item) return null;
  if (!isAdmin && !item.isPublished) return null;
  return mapNewsItem({ publicUploadUrl, item });
}

async function getNewsBySlug({ slug, isAdmin, publicUploadUrl }) {
  const s = String(slug || '').trim();
  if (!s) return null;
  const item = await News.findOne({ slug: s }).lean();
  if (!item) return null;
  if (!isAdmin && !item.isPublished) return null;
  return mapNewsItem({ publicUploadUrl, item });
}

async function getNewsOne({ param, isAdmin, publicUploadUrl }) {
  if (isObjectId(param)) {
    return getNewsById({ id: param, isAdmin, publicUploadUrl });
  }
  return getNewsBySlug({ slug: param, isAdmin, publicUploadUrl });
}

async function createNews({ body, file, publicUploadUrl }) {
  const { title, excerpt, content, publishedAt } = body || {};
  if (!title || !String(title).trim()) {
    throw httpError(400, 'title is required');
  }

  const gallery = parseGalleryInput(body?.gallery);
  assertGalleryLimit(gallery);

  const vi = {
    title: String(title).trim(),
    excerpt: excerpt != null ? String(excerpt) : '',
    content: content != null ? String(content) : '',
  };
  const en = await buildEnglishFields(vi, {
    enabled: shouldAutoTranslate(body),
  });

  const doc = await News.create({
    ...vi,
    ...en,
    slug: await uniqueSlug(News, title, 'news'),
    excerpt: vi.excerpt || undefined,
    content: vi.content || undefined,
    image: (() => {
      if (!file) return undefined;
      const imageUrl = resolveUploadedImageUrl(file);
      if (!imageUrl) throw httpError(500, 'Upload lên Cloudinary thất bại');
      return imageUrl;
    })(),
    gallery: gallery?.length ? gallery : undefined,
    publishedAt: parsePublishedAt(publishedAt),
    isPublished: parseBool(body?.isPublished, false),
  });

  return mapNewsItem({ publicUploadUrl, item: doc.toObject() });
}

async function updateNews({ id, body, file, publicUploadUrl, uploadDir }) {
  const existing = await News.findById(id);
  if (!existing) return null;

  const { title, slug, excerpt, content, publishedAt } = body || {};

  if (title !== undefined) {
    if (!String(title).trim()) {
      throw httpError(400, 'title cannot be empty');
    }
    existing.title = String(title).trim();
  }

  if (slug !== undefined) {
    const s = String(slug).trim();
    if (s && s !== existing.slug) {
      const taken = await News.exists({ slug: s, _id: { $ne: existing._id } });
      if (taken) throw httpError(400, 'slug already in use');
      existing.slug = s;
    }
  }

  if (excerpt !== undefined) existing.excerpt = String(excerpt);
  if (content !== undefined) existing.content = String(content);

  let removedGallery = [];
  if (body?.gallery !== undefined) {
    const nextGallery = parseGalleryInput(body.gallery) || [];
    assertGalleryLimit(nextGallery);

    const prevGallery = Array.isArray(existing.gallery) ? existing.gallery : [];
    removedGallery = prevGallery.filter((url) => !nextGallery.includes(url));
    existing.gallery = nextGallery;
  }

  if (publishedAt !== undefined) {
    existing.publishedAt =
      publishedAt === '' || publishedAt === null
        ? undefined
        : parsePublishedAt(publishedAt);
  }

  if (body?.isPublished !== undefined) {
    existing.isPublished = parseBool(body.isPublished, existing.isPublished);
  }

  if (file) {
    const imageUrl = resolveUploadedImageUrl(file);
    if (!imageUrl) throw httpError(500, 'Upload lên Cloudinary thất bại');
    const prevImage = existing.image;
    existing.image = imageUrl;
    await unlinkUploadedImage({ uploadDir, imageUrl: prevImage });
  }

  if (removedGallery.length) {
    await Promise.all(
      removedGallery.map((url) => unlinkUploadedImage({ uploadDir, imageUrl: url })),
    );
  }

  if (shouldAutoTranslate(body)) {
    const en = await buildEnglishFields({
      title: existing.title,
      excerpt: existing.excerpt,
      content: existing.content,
    });
    Object.assign(existing, en);
  }

  await existing.save();
  return mapNewsItem({ publicUploadUrl, item: existing.toObject() });
}

async function deleteNews({ id, uploadDir }) {
  const existing = await News.findById(id);
  if (!existing) return false;

  await unlinkUploadedImage({ uploadDir, imageUrl: existing.image });

  const gallery = Array.isArray(existing.gallery) ? existing.gallery : [];
  if (gallery.length) {
    await Promise.all(
      gallery.map((url) => unlinkUploadedImage({ uploadDir, imageUrl: url })),
    );
  }

  await existing.deleteOne();
  return true;
}

module.exports = {
  listNews,
  getNewsOne,
  createNews,
  updateNews,
  deleteNews,
};
