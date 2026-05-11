const newsService = require('../services/newsService');
const upload = require('../middleware/uploadMiddleware');

function isAdmin(req) {
  return Boolean(req.user);
}

async function list(req, res) {
  try {
    const result = await newsService.listNews({
      isAdmin: isAdmin(req),
      publicUploadUrl: upload.publicUploadUrl,
      page: req.query.page,
      limit: req.query.limit,
    });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to list news' });
  }
}

async function getById(req, res) {
  try {
    const item = await newsService.getNewsOne({
      param: req.params.id,
      isAdmin: isAdmin(req),
      publicUploadUrl: upload.publicUploadUrl,
    });
    if (!item) return res.status(404).json({ message: 'News not found' });
    return res.json(item);
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Invalid id' });
  }
}

async function create(req, res) {
  try {
    const doc = await newsService.createNews({
      body: req.body,
      file: req.file,
      publicUploadUrl: upload.publicUploadUrl,
    });
    return res.status(201).json(doc);
  } catch (err) {
    const status = err?.statusCode || 500;
    return res.status(status).json({ message: err.message || 'Failed to create news' });
  }
}

async function update(req, res) {
  try {
    const doc = await newsService.updateNews({
      id: req.params.id,
      body: req.body,
      file: req.file,
      publicUploadUrl: upload.publicUploadUrl,
      uploadDir: upload.UPLOAD_DIR,
    });
    if (!doc) return res.status(404).json({ message: 'News not found' });
    return res.json(doc);
  } catch (err) {
    const status = err?.statusCode || 400;
    return res.status(status).json({ message: err.message || 'Failed to update news' });
  }
}

async function remove(req, res) {
  try {
    const ok = await newsService.deleteNews({ id: req.params.id, uploadDir: upload.UPLOAD_DIR });
    if (!ok) return res.status(404).json({ message: 'News not found' });
    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to delete news' });
  }
}

module.exports = { list, getById, create, update, remove };

