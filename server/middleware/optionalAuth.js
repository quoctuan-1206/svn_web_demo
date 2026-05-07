const { tryAuth } = require('./authMiddleware');

module.exports = async function optionalAuth(req, _res, next) {
  req.user = await tryAuth(req);
  next();
};

