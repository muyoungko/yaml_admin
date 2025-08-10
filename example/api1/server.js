const { createApp } = require('../../packages/api');

(async function start() {
  const mode = process.env.NODE_ENV || 'development';
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 6911;

  const app = await createApp();

  // Add api1-specific routes/middleware here
  app.get('/api1/health', (req, res) => {
    res.json({ ok: true, service: 'api1' });
  });

  app.listen(port, () => {
    console.log(`[api1] ${mode} listening on ${port}`);
  });
})().catch((err) => {
  console.error('[api1] Failed to start', err);
  process.exit(1);
}); 