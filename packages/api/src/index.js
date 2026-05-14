const registerRoutes = require('./yml-admin-api.js');
const { genEntityIdWithKey } = require('./common/util.js');
const { Uploader } = require('./common/Uploader.js');
module.exports = { registerRoutes, genEntityIdWithKey, Uploader };