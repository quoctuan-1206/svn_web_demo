const mongoose = require('mongoose');
const { isProd } = require('../config/env');

function notFoundHandler(req, res, next) {
  const err = new Error(`Cannot ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

function messageFromMongoose(err) {
  if (err instanceof mongoose.Error.ValidationError) {
    const first = Object.values(err.errors || {})[0];
    return first?.message || 'Validation failed';
  }
  if (err instanceof mongoose.Error.CastError) {
    return 'Invalid id';
  }
  return null;
}

function statusFromMongoDuplicate(err) {
  if (err?.code === 11000) {
    return { status: 409, message: 'Duplicate value' };
  }
  return null;
}

function statusFromMulter(err) {
  if (err?.name !== 'MulterError') return null;
  if (err.code === 'LIMIT_FILE_SIZE') {
    return { status: 400, message: 'File too large' };
  }
  if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    return { status: 400, message: err.message || 'Too many files' };
  }
  return { status: 400, message: err.message || 'Upload failed' };
}

function errorHandler(err, req, res, _next) {
  if (res.headersSent) {
    return;
  }

  const multerHandled = statusFromMulter(err);
  if (multerHandled) {
    return res.status(multerHandled.status).json({ message: multerHandled.message });
  }

  const dup = statusFromMongoDuplicate(err);
  if (dup) {
    return res.status(dup.status).json({ message: dup.message });
  }

  const mongooseMsg = messageFromMongoose(err);
  if (mongooseMsg) {
    return res.status(400).json({ message: mongooseMsg });
  }

  const status =
    Number(err?.statusCode) ||
    Number(err?.status) ||
    (err.name === 'UnauthorizedError' ? 401 : null) ||
    500;

  const body = { message: err.message || 'Internal server error' };

  if (status >= 500 && isProd) {
    body.message = 'Internal server error';
  }

  if (!isProd && status >= 500 && err.stack) {
    body.stack = err.stack.split('\n').map((s) => s.trim());
  }

  return res.status(status).json(body);
}

module.exports = { notFoundHandler, errorHandler };
