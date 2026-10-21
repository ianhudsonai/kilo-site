import { createRequire } from 'module'; import { execSync } from 'child_process';
const require = createRequire(execSync('npm root -g').toString().trim() + '/');
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = process.cwd();
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': { '.js': 'text/javascript', '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.glb': 'model/gltf-binary' }[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(8766);
const [query, frames, outdir] = [process.argv[2] || '', +(process.argv[3] || 1), process.argv[4] || 'out'];
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage(); p.on('console', m => console.log('page:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('http://localhost:8766/render.html?' + query);
await p.waitForFunction(() => window.ready, null, { timeout: 120000 });
console.log(JSON.stringify(await p.evaluate(() => window.info)));
fs.mkdirSync(outdir, { recursive: true });
for (let i = 0; i < frames; i++) {
  const d = await p.evaluate(t => window.frame(t), frames === 1 ? 1 : i / (frames - 1));
  fs.writeFileSync(path.join(outdir, String(i).padStart(3, '0') + '.png'), Buffer.from(d.split(',')[1], 'base64'));
}
await b.close(); srv.close();
