import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { APP_DOWNLOAD_PATH, appStoreUrlFor } from './app/core/config/app-download';

const DEFAULT_PORT = 4000;
const HASHED_ASSET = /-[A-Za-z0-9]{8}\.(?:js|css)$/;
const HASHED_ASSET_CACHE = 'public, max-age=31536000, immutable';
const PUBLIC_FILE_CACHE = 'public, max-age=86400';
const PAGE_CACHE = 'no-cache';
const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.disable('x-powered-by');

app.use((_request, response, next) => {
  response.set(SECURITY_HEADERS);
  response.setHeader('Cache-Control', PAGE_CACHE);
  next();
});

app.get('/healthz', (_request, response) => {
  response.type('text/plain').send('ok');
});

app.get(APP_DOWNLOAD_PATH, (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.redirect(302, appStoreUrlFor(request.get('user-agent')));
});

app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
    setHeaders: (response, path) => {
      response.setHeader(
        'Cache-Control',
        HASHED_ASSET.test(path) ? HASHED_ASSET_CACHE : PUBLIC_FILE_CACHE,
      );
    },
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] ?? DEFAULT_PORT;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
  });
}

export const reqHandler = createNodeRequestHandler(app);
