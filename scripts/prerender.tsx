// SSG entry (architecture section 1): renders App with the real inventory via
// renderToStaticMarkup, writes the complete document to dist/index.html, and
// strips every JS chunk vite emitted — the served page is pure HTML+CSS.
import { readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderToStaticMarkup } from 'react-dom/server';

import { App } from '../src/App';
import services from '../src/content/services.json';

const distDir = fileURLToPath(new URL('../dist', import.meta.url));
const assetsDir = join(distDir, 'assets');

const assets = readdirSync(assetsDir);
const cssFiles = assets.filter((f) => f.endsWith('.css'));
if (cssFiles.length !== 1) {
  console.error(`prerender: expected exactly one hashed CSS file in dist/assets, found ${cssFiles.length}`);
  process.exit(1);
}
const cssHref = `/assets/${cssFiles[0]}`;

const markup = renderToStaticMarkup(<App services={services} />);
const html =
  '<!doctype html>\n' +
  '<html lang="en">\n' +
  '<head>\n' +
  '<meta charset="utf-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
  '<title>Connelly Lab</title>\n' +
  `<link rel="stylesheet" href="${cssHref}">\n` +
  '</head>\n' +
  `<body>${markup}</body>\n` +
  '</html>\n';

writeFileSync(join(distDir, 'index.html'), html);

// Zero-JS by construction: remove every JS artifact from the shipped output.
let removed = 0;
for (const file of assets) {
  if (file.endsWith('.js') || file.endsWith('.js.map')) {
    rmSync(join(assetsDir, file));
    removed += 1;
  }
}

console.log(`prerender: wrote dist/index.html (${html.length} bytes), css=${cssHref}, removed ${removed} JS artifact(s).`);
