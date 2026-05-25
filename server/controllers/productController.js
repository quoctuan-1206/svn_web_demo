const asyncHandler = require('../utils/asyncHandler');
const { uploadContext } = require('../utils/uploadContext');
const productService = require('../services/productService');
const { httpError } = require('../utils/httpError');

const list = asyncHandler(async (req, res) => {
  const data = await productService.listProducts(uploadContext(req));
  res.json(data);
});

const getById = asyncHandler(async (req, res) => {
  const item = await productService.getProductOne({
    param: req.params.id,
    ...uploadContext(req),
  });
  if (!item) throw httpError(404, 'Product not found');
  res.json(item);
});

const create = asyncHandler(async (req, res) => {
  const doc = await productService.createProduct({
    body: req.body,
    file: req.file,
    publicUploadUrl: uploadContext(req).publicUploadUrl,
  });
  res.status(201).json(doc);
});

const update = asyncHandler(async (req, res) => {
  const doc = await productService.updateProduct({
    id: req.params.id,
    body: req.body,
    file: req.file,
    ...uploadContext(req),
  });
  if (!doc) throw httpError(404, 'Product not found');
  res.json(doc);
});

const remove = asyncHandler(async (req, res) => {
  const ok = await productService.deleteProduct({
    id: req.params.id,
    uploadDir: uploadContext(req).uploadDir,
  });
  if (!ok) throw httpError(404, 'Product not found');
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove };
