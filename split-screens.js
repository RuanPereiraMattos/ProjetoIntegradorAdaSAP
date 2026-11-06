#!/usr/bin/env node
/**
 * Divide wireframes.html em 6 arquivos individuais para importar no Figma.
 * Uso: node split-screens.js
 * Saída: telas/tela-1.html … tela-6.html
 */

const fs   = require('fs');
const path = require('path');

const src    = fs.readFileSync(path.resolve(__dirname, 'wireframes.html'), 'utf8');
const outDir = path.resolve(__dirname, 'telas');
fs.mkdirSync(outDir, { recursive: true });

// Extrai o bloco <head>…</head> (inclui as tags)
const head = src.match(/^[\s\S]*?<\/head>/)[0];

// Extrai cada .screen-wrapper com seu conteúdo
const wrapperRe = /<div class="screen-wrapper">[\s\S]*?^<\/div>/gm;
const wrappers  = [...src.matchAll(wrapperRe)].map(m => m[0]);

if (wrappers.length === 0) {
  console.error('Nenhum .screen-wrapper encontrado.');
  process.exit(1);
}

wrappers.forEach((wrapper, i) => {
  const label = wrapper.match(/class="screen-label">(.*?)<\/div>/)?.[1]?.trim() ?? `Tela ${i + 1}`;
  const html  = `${head}\n<body>\n\n${wrapper}\n\n</body>\n</html>`;
  const file  = path.join(outDir, `tela-${i + 1}.html`);
  fs.writeFileSync(file, html, 'utf8');
  console.log(`✓ tela-${i + 1}.html  —  ${label}`);
});

console.log(`\nPronto. ${wrappers.length} arquivos em ${outDir}`);
