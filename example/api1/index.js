const mode = process.env.NODE_ENV || "production";

(async function() {
  const createApp = require('./app');
  const app = await createApp();
  var port = 6911;
  if(mode == 'production')
    port = 8080;
  app.listen(port, () => console.log(`${mode} Listening on port ` + port));
})();
