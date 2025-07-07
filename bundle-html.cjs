#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// --- CONFIG ---
const distDir = path.join(__dirname, 'dist');
const tilesDir = path.join(__dirname, '..', 'img', 'tiles');

// --- ARGUMENTS ---
let outFile = path.join(__dirname, 'bundle.html');
const argv = process.argv;
for (let i = 2; i < argv.length; ++i) {
  if ((argv[i] === '-o' || argv[i] === '--output') && argv[i + 1]) {
    outFile = path.isAbsolute(argv[i + 1]) ? argv[i + 1] : path.join(__dirname, argv[i + 1]);
    i++;
  }
}

function inlineFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function getBase64Svg(filePath) {
  const svg = fs.readFileSync(filePath, 'utf8');
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

function inlineAssets(html) {
  // Inline CSS
  html = html.replace(/<link rel="stylesheet"[^>]*href=["'](.+?\.css)["'][^>]*>/g, (match, cssPath) => {
    const cssFile = path.join(distDir, cssPath.replace(/^\//, ''));
    const css = inlineFile(cssFile);
    return `<style>\n${css}\n</style>`;
  });

  // Inline JS
  html = html.replace(/<script type="module"[^>]*src=["'](.+?\.js)["'][^>]*><\/script>/g, (match, jsPath) => {
    const jsFile = path.join(distDir, jsPath.replace(/^\//, ''));
    const js = inlineFile(jsFile);
    return `<script type="module">\n${js}\n</script>`;
  });

  // Inline legacy JS (if any)
  html = html.replace(/<script nomodule[^>]*src=["'](.+?\.js)["'][^>]*><\/script>/g, (match, jsPath) => {
    const jsFile = path.join(distDir, jsPath.replace(/^\//, ''));
    const js = inlineFile(jsFile);
    return `<script nomodule>\n${js}\n</script>`;
  });

  // Replace all /tiles/NAME.svg references with base64 data
  html = html.replace(/['"`]\/tiles\/([A-Za-z0-9\-]+\.svg)['"`]/g, (match, svgName) => {
    const tileName = svgName.replace('.svg', '');
    const svgPath = path.join(tilesDir, svgName);
    if (fs.existsSync(svgPath)) {
      const base64 = getBase64Svg(svgPath);
      return `"${base64}"`;
    } else {
      console.log(`Warning: SVG file not found: ${svgPath}`);
      return match;
    }
  });

  return html;
}

// --- MAIN ---
console.log('Bundling HTML...');

// Check if dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Check if tiles directory exists
if (!fs.existsSync(tilesDir)) {
  console.error('Error: tiles directory not found at', tilesDir);
  process.exit(1);
}

// Read the HTML file
const htmlFile = path.join(distDir, 'index.html');
if (!fs.existsSync(htmlFile)) {
  console.error('Error: index.html not found in dist directory');
  process.exit(1);
}

let html = inlineFile(htmlFile);

// Inline all assets
html = inlineAssets(html);

// Write the bundled HTML
fs.writeFileSync(outFile, html);

console.log(`Bundled HTML written to: ${outFile}`);
console.log('You can now open this file directly in your browser!'); 