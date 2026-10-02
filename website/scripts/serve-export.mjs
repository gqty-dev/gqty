#!/usr/bin/env node
/**
 * Serves `out/` at the real deployment mount point,
 * `http://localhost:$PORT/gqty/`, so local checks exercise the same base path
 * GitHub Pages uses. Requests below `/gqty` are rejected, matching production.
 *
 * This is a static file server for manual inspection only. It is not part of
 * the build and is never deployed.
 */

import { createReadStream } from 'node:fs';
import { access, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const outDir = join(siteRoot, 'out');
const basePath = '/gqty';
const port = Number(process.env.PORT ?? 4173);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.gif': 'image/gif',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

async function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const relative = normalize(decoded.slice(basePath.length)).replace(
    /^(\.\.[/\\])+/,
    ''
  );
  const candidates =
    relative === '' || relative === '/'
      ? [join(outDir, 'index.html')]
      : [
          join(outDir, relative),
          join(outDir, `${relative}.html`),
          join(outDir, relative, 'index.html'),
        ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {
      // try the next candidate
    }
  }

  return undefined;
}

createServer(async (request, response) => {
  const url = request.url ?? '/';

  if (!url.startsWith(basePath)) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end(`Not found. This export is served under ${basePath}/.`);
    return;
  }

  const file = await resolveFile(url);

  if (!file) {
    response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    response.end(await readFile(join(outDir, '404.html'), 'utf8'));
    return;
  }

  response.writeHead(200, {
    'content-type': contentTypes[extname(file)] ?? 'application/octet-stream',
  });
  createReadStream(file).pipe(response);
}).listen(port, () => {
  console.log(`Serving ${outDir} at http://localhost:${port}${basePath}/`);
});
