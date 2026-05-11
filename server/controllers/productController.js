const productService = require('../services/productService');
const upload = require('../middleware/uploadMiddleware');

function isAdmin(req) {
  return Boolean(req.user);
}

async function list(req, res) {
  try {
    const data = await productService.listProducts({
      isAdmin: isAdmin(req),
      publicUploadUrl: upload.publicUploadUrl,
    });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to list products' });
  }
}

async function getById(req, res) {
  try {
    const param = req.params.id;
    const item = await productService.getProductOne({
      param,
      isAdmin: isAdmin(req),
      publicUploadUrl: upload.publicUploadUrl,
    });
    if (!item) return res.status(404).json({ message: 'Product not found' });
    return res.json(item);
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Invalid id' });
  }
}

async function create(req, res) {
  try {
    const doc = await productService.createProduct({
      body: req.body,
      file: req.file,
      publicUploadUrl: upload.publicUploadUrl,
    });
    return res.status(201).json(doc);
  } catch (err) {
    const status = err?.statusCode || 500;
    return res.status(status).json({ message: err.message || 'Failed to create product' });
  }
}

async function update(req, res) {
  try {
    const doc = await productService.updateProduct({
      id: req.params.id,
      body: req.body,
      file: req.file,
      publicUploadUrl: upload.publicUploadUrl,
      uploadDir: upload.UPLOAD_DIR,
    });
    if (!doc) return res.status(404).json({ message: 'Product not found' });
    return res.json(doc);
  } catch (err) {
    const status = err?.statusCode || 400;
    return res.status(status).json({ message: err.message || 'Failed to update product' });
  }
}

async function remove(req, res) {
  try {
    const ok = await productService.deleteProduct({
      id: req.params.id,
      uploadDir: upload.UPLOAD_DIR,
    });
    if (!ok) return res.status(404).json({ message: 'Product not found' });
    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to delete product' });
  }
}

module.exports = { list, getById, create, update, remove };

