// Genera img/og-bosco.png (1200×630) e img/apple-touch-icon.png (180×180)
// con el estilo de la web (tinta, papel y Archivo estrecha). Requiere Playwright instalado.
// Uso: node scripts/generar-imagenes.cjs
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const raiz = path.join(__dirname, '..');
const css = `
@font-face{font-family:T;src:url(${raiz}/fonts/archivo-condensed-800.woff2);font-weight:800}
@font-face{font-family:S;src:url(${raiz}/fonts/archivo-400-600.woff2);font-weight:400 600}
@font-face{font-family:N;src:url(${raiz}/fonts/newsreader-italic.woff2);font-style:italic}
*{margin:0;box-sizing:border-box} body{background:#1b1916;color:#efe9df;height:100vh;display:flex;flex-direction:column;justify-content:flex-end;padding:56px 64px}
.k{font:500 22px S;letter-spacing:.14em;text-transform:uppercase;color:#b5ad9f}
.n{font:800 var(--n)/.82 T;text-transform:uppercase;letter-spacing:-.03em;margin:14px 0 22px -.04em}
.r{display:flex;justify-content:space-between;align-items:baseline;border-top:2px solid #efe9df;padding-top:18px;font:400 30px S}
.r em{font:italic 36px N;color:#e0806e}
.c{display:flex;align-items:center;justify-content:center;padding:0}`;
(async () => {
  const b = await chromium.launch();
  const jobs = [
    ['og-bosco.png', 1200, 630, `<div class=k>Peluquería de caballeros · Triana, Sevilla</div><div class=n style="--n:300px">Bosco</div><div class=r><span>Calle Alfarería, 113</span><em>peluqueros</em></div>`],
    ['apple-touch-icon.png', 180, 180, `<style>body{align-items:center;justify-content:center;padding:0}</style><div class=n style="--n:150px;margin:0">B</div>`],
  ];
  for (const [n, w, h, body] of jobs) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const tmp = path.join(raiz, '.tmp-img.html');
    fs.writeFileSync(tmp, `<style>${css}</style>${body}`);
    await p.goto('file://' + tmp); await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(raiz, 'img', n) }); fs.unlinkSync(tmp); await p.close();
    console.log('img/' + n);
  }
  await b.close();
})();
