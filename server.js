const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = false; // process.env.NODE_ENV !== 'production';
console.log("process.env.NODE_ENV", process.env.NODE_ENV);
console.log("dev", dev);
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./certs/client-key.pem'),
  cert: fs.readFileSync('./certs/client-cert.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(8787, err => {
    if (err) throw err;
    console.log('> Ready on https://localhost:8086');
  });
});
