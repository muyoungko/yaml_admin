const registerRoutes = require('./yml-admin-api.js');
const { genEntityIdWithKey } = require('./common/util.js');
const { withConfigLocal } = require('./upload/localUpload.js');
const { withConfigS3 } = require('./upload/s3Upload.js');
module.exports = { registerRoutes, genEntityIdWithKey, withConfigLocal, withConfigS3 };