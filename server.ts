import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { handleWorksheetAnalyzeRequest } from './api/_worksheetAnalyzer.ts';

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '16mb' }));

  app.post('/api/analyze-worksheet', async (req, res) => {
    try {
      const result = await handleWorksheetAnalyzeRequest({
        authorizationHeader: req.headers.authorization,
        body: req.body,
      });
      res.setHeader('Cache-Control', 'no-store');
      res.status(result.status).json(result.body);
    } catch (err) {
      console.error('Unhandled /api/analyze-worksheet error:', err);
      res.status(500).json({ error: 'Terjadi kesalahan internal server saat memproses analisa.' });
    }
  });

  app.all('/api/analyze-worksheet', (_req, res) => {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed. Gunakan POST.' });
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    const indexPath = path.join(distDir, 'index.html');
    app.use(express.static(distDir, { index: false }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      if (!fs.existsSync(indexPath)) {
        res.status(404).send('Build output dist/index.html not found. Run npm run build first.');
        return;
      }
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
