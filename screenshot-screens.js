#!/usr/bin/env node
/**
 * Captura cada tela do wireframes.html como PNG individual.
 * Uso:
 *   npm install puppeteer        (apenas na primeira vez)
 *   node screenshot-screens.js
 *
 * Saída: ./screenshots/tela-1.png … tela-6.png  (2560×1600 @2x)
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const HTML_FILE = path.resolve(__dirname, 'wireframes.html');
const OUT_DIR   = path.resolve(__dirname, 'screenshots');

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new' });
  const page    = await browser.newPage();

  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
  await page.goto(`file://${HTML_FILE}`, { waitUntil: 'networkidle0' });

  const wrappers = await page.$$('.screen-wrapper');

  if (wrappers.length === 0) {
    console.error('Nenhum .screen-wrapper encontrado em wireframes.html');
    await browser.close();
    process.exit(1);
  }

  for (let i = 0; i < wrappers.length; i++) {
    const label   = await wrappers[i].$eval('.screen-label', el => el.textContent.trim()).catch(() => `Tela ${i + 1}`);
    const outFile = path.join(OUT_DIR, `tela-${i + 1}.png`);

    await wrappers[i].screenshot({ path: outFile });
    console.log(`✓ tela-${i + 1}.png  —  ${label}`);
  }

  await browser.close();
  console.log(`\nPronto. ${wrappers.length} imagens em ${OUT_DIR}`);
})();
