const mode = process.env.NODE_ENV || "production";

(async function() {
  const app = await require('./app');
  var port = 6911;
  if(mode == 'production')
    port = 80;
  app.listen(port, () => console.log(`${mode} Listening on port ` + port));
})();
