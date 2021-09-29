const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = false; // process.env.NODE_ENV !== 'production';
console.log("process.env.NODE_ENV", process.env.NODE_ENV);
console.log("dev", dev);
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(8787, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:8787");
  });
});
