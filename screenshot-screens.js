#!/usr/bin/env node
/**
 * Captura cada tela individual como PNG.
 * Uso:
 *   npm install puppeteer        (apenas na primeira vez)
 *   node screenshot-screens.js
 *
 * Saída: ./screenshots/tela-1.png … tela-6.png  (1280×900 @2x)
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const TELAS_DIR = path.resolve(__dirname, 'telas');
const OUT_DIR   = path.resolve(__dirname, 'screenshots');
const TELAS     = [1, 2, 3, 4, 5, 6];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new' });
  const page    = await browser.newPage();

  // Viewport generoso — o .screen (max-width 900px) sempre cabe
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

  for (const n of TELAS) {
    const htmlFile = path.join(TELAS_DIR, `tela-${n}.html`);
    const outFile  = path.join(OUT_DIR,   `tela-${n}.png`);

    await page.goto(`file://${htmlFile}`, { waitUntil: 'networkidle0' });

    // Captura apenas o elemento .screen, ignorando padding/fundo do body
    const screenEl = await page.$('.screen');
    if (screenEl) {
      await screenEl.screenshot({ path: outFile });
    } else {
      // fallback: página inteira
      await page.screenshot({ path: outFile, fullPage: false });
    }

    console.log(`✓ tela-${n}.png`);
  }

  await browser.close();
  console.log(`\nPronto. ${TELAS.length} imagens em ${OUT_DIR}`);
})();
