import http from 'http';
import fs from 'fs';
import path from 'path';
import url, { fileURLToPath } from 'url';

import chatHandler from './api/chat.js';
import loginHandler from './api/login.js';
import userKeysHandler from './api/user-keys.js';
import sessionsHandler from './api/sessions.js';
import codelabSessionsHandler from './api/codelab-sessions.js';
import modelsHandler from './api/models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local variables if present
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // 1. Route API Calls to Serverless Handlers
  if (pathname.startsWith('/api/')) {
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
    });

    req.on('end', async () => {
      let parsedBody = {};
      if (bodyData && bodyData.trim()) {
        try {
          parsedBody = JSON.parse(bodyData);
        } catch (e) {
          console.error('Failed to parse incoming JSON body:', e);
        }
      }

      const mockReq = {
        method: req.method,
        headers: req.headers,
        url: req.url,
        query: parsedUrl.query || {},
        body: parsedBody
      };

      const mockRes = {
        headers: {},
        statusCode: 200,
        setHeader(name, value) {
          this.headers[name] = value;
          res.setHeader(name, value);
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          res.writeHead(this.statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            ...this.headers
          });
          res.end(JSON.stringify(data));
        },
        end(data) {
          res.writeHead(this.statusCode, this.headers);
          res.end(data);
        }
      };

      const handlers = {
        '/api/chat': chatHandler,
        '/api/login': loginHandler,
        '/api/user-keys': userKeysHandler,
        '/api/sessions': sessionsHandler,
        '/api/codelab-sessions': codelabSessionsHandler,
        '/api/models': modelsHandler
      };

      const normalizedPath = pathname.replace(/\/$/, '');

      try {
        if (handlers[normalizedPath]) {
          await handlers[normalizedPath](mockReq, mockRes);
        } else {
          // Dynamic fallback for any additional api file (e.g. send-email.js)
          const routeName = normalizedPath.replace('/api/', '');
          const handlerFile = path.join(__dirname, 'api', `${routeName}.js`);

          if (fs.existsSync(handlerFile)) {
            const dynamicMod = await import(`./api/${routeName}.js`);
            const handler = dynamicMod.default || dynamicMod;
            await handler(mockReq, mockRes);
          } else {
            mockRes.status(404).json({ error: `API route ${pathname} not found.` });
          }
        }
      } catch (err) {
        console.error(`API Error in ${pathname}:`, err);
        mockRes.status(500).json({ error: err.message || 'Internal Server Error' });
      }
    });
    return;
  }

  // 2. Serve Static Build Files (dist/)
  let filePath = path.join(__dirname, 'dist', pathname === '/' ? 'index.html' : pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(__dirname, 'dist', 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'text/html';
    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Server Error loading page');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use by an active Prof. Joe AI server. Server is ready!`);
    process.exit(0);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, () => {
  console.log(`Prof. Joe AI Local Server running on http://localhost:${PORT}`);
});
