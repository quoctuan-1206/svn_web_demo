const upload = require('../middleware/uploadMiddleware');

function uploadContext(req) {
  return {
    isAdmin: Boolean(req.user),
    publicUploadUrl: upload.publicUploadUrl,
    uploadDir: upload.UPLOAD_DIR,
  };
}

module.exports = { uploadContext };
