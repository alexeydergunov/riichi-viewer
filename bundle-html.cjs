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

  // Inline SVG tile images as base64 (unchanged)
  html = html.replace(/<img([^>]+)src=["']\/tiles\/([^"']+\.svg)["']([^>]*)>/g, (match, before, svgName, after) => {
    const svgPath = path.join(tilesDir, svgName);
    if (fs.existsSync(svgPath)) {
      const base64 = getBase64Svg(svgPath);
      return `<img${before}src=\"${base64}\"${after}>`;
    } else {
      return match;
    }
  });

  return html;
}

function main() {
  const indexHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('dist/index.html not found. Please run your build first.');
    process.exit(1);
  }
  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  html = inlineAssets(html);
  fs.writeFileSync(outFile, html, 'utf8');
  console.log(`Created ${outFile}`);
}

main(); 