import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '../dist');
const port = Number(process.env.PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.json': 'application/json', '.txt': 'text/plain',
  '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.mp4': 'video/mp4', '.ttf': 'font/ttf', '.woff2': 'font/woff2',
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let file;
  try { file = resolve(root, '.' + decodeURIComponent(url.pathname)); }
  catch { res.writeHead(400).end(); return; }
  if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  let status = 200;
  let info;
  try {
    info = await stat(file);
    if (info.isDirectory()) {
      if (!url.pathname.endsWith('/')) {
        res.writeHead(308, { Location: url.pathname + '/' + url.search }).end();
        return;
      }
      file = join(file, 'index.html');
      info = await stat(file);
    }
    if (!info.isFile()) throw new Error('Expected a regular file');
  } catch {
    file = join(root, '404.html');
    info = await stat(file);
    status = 404;
  }

  let start = 0;
  let end = info.size - 1;
  const headers = { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' };
  const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
  if (range && status === 200) {
    start = Number(range[1]);
    end = range[2] ? Math.min(end, Number(range[2])) : end;
    if (start > end) { res.writeHead(416, { 'Content-Range': 'bytes */' + info.size }).end(); return; }
    headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + info.size;
    status = 206;
  }
  headers['Content-Length'] = Math.max(0, end - start + 1);
  headers['Accept-Ranges'] = 'bytes';
  res.writeHead(status, headers);
  if (req.method === 'HEAD' || !info.size) { res.end(); return; }
  const stream = createReadStream(file, { start, end });
  stream.on('error', () => res.destroy());
  res.on('close', () => stream.destroy());
  stream.pipe(res);
}).listen(port, '127.0.0.1', () => console.log('Cskin preview on http://localhost:' + port));
