const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = 4173;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

function sendText(statusCode, contentType, body, res) {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(body);
}

function sendFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendText(500, 'text/plain; charset=utf-8', 'Internal Server Error', res);
      return;
    }
    sendText(200, contentType, data, res);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/app-config.local.js') {
    const localConfigPath = path.join(root, 'app-config.local.js');
    fs.access(localConfigPath, fs.constants.F_OK, (accessErr) => {
      if (!accessErr) {
        sendFile(localConfigPath, res);
        return;
      }
      sendText(200, 'application/javascript; charset=utf-8', 'window.REEL_APP_CONFIG = window.REEL_APP_CONFIG || {};', res);
    });
    return;
  }
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(root, safePath === '/' ? 'index.html' : safePath);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.access(filePath, fs.constants.F_OK, (accessErr) => {
      if (accessErr) {
        sendText(404, 'text/plain; charset=utf-8', 'Not Found', res);
        return;
      }
      sendFile(filePath, res);
    });
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Preview server running at http://127.0.0.1:${port}`);
});
