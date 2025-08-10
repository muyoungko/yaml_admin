const createApp = require('./app');
const { parseYML, parseYMLFile } = require('./config');

async function startServer(options = {}) {
  const mode = process.env.NODE_ENV || 'production';
  const port = options.port ?? (mode === 'production' ? 80 : 6911);
  const app = await createApp(options.config);
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`${mode} Listening on port ${port}`);
      resolve(server);
    });
  });
}

module.exports = { createApp, startServer, parseYML, parseYMLFile };
