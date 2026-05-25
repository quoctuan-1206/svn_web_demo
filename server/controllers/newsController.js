const asyncHandler = require('../utils/asyncHandler');
const { uploadContext } = require('../utils/uploadContext');
const newsService = require('../services/newsService');
const { httpError } = require('../utils/httpError');

const list = asyncHandler(async (req, res) => {
  const result = await newsService.listNews({
    ...uploadContext(req),
    page: req.query.page,
    limit: req.query.limit,
  });
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const item = await newsService.getNewsOne({
    param: req.params.id,
    ...uploadContext(req),
  });
  if (!item) throw httpError(404, 'News not found');
  res.json(item);
});

const create = asyncHandler(async (req, res) => {
  const doc = await newsService.createNews({
    body: req.body,
    file: req.file,
    publicUploadUrl: uploadContext(req).publicUploadUrl,
  });
  res.status(201).json(doc);
});

const update = asyncHandler(async (req, res) => {
  const doc = await newsService.updateNews({
    id: req.params.id,
    body: req.body,
    file: req.file,
    ...uploadContext(req),
  });
  if (!doc) throw httpError(404, 'News not found');
  res.json(doc);
});

const remove = asyncHandler(async (req, res) => {
  const ok = await newsService.deleteNews({
    id: req.params.id,
    uploadDir: uploadContext(req).uploadDir,
  });
  if (!ok) throw httpError(404, 'News not found');
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove };
