// Genera img/og-bosco.png (1200×630) e img/apple-touch-icon.png (180×180)
// con la composición tipográfica provisional. Requiere Playwright instalado.
// Uso: node scripts/generar-imagenes.cjs
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const raiz = path.join(__dirname, '..');
const css = `
@font-face{font-family:T;src:url(${raiz}/fonts/roboto-serif-condensed-800.woff2);font-weight:800}
@font-face{font-family:S;src:url(${raiz}/fonts/archivo-400-600.woff2);font-weight:400 600}
*{margin:0;box-sizing:border-box} body{background:#101D33;color:#F2EBDD;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;text-transform:uppercase;line-height:1}
.n{font:800 var(--n) T;letter-spacing:.01em}
.f{font:800 var(--f) T;letter-spacing:.32em;margin-right:-.32em;display:flex;align-items:center;gap:.55em;margin-top:.35em}
.f:before,.f:after{content:"";width:1.6em;height:.12em;background:#A43B29}
.d{font:600 var(--d) S;letter-spacing:.42em;margin-right:-.42em;margin-top:1.1em}
.marco{position:fixed;inset:22px;border:1.5px solid rgba(242,235,221,.28)}`;
(async () => {
  const b = await chromium.launch();
  const jobs = [
    ['og-bosco.png', 1200, 630, `<div class=marco></div><div class=n style="--n:170px">Bosco</div><div class=f style="--f:40px">Triana</div><div class=d style="--d:20px">Peluqueros</div>`],
    ['apple-touch-icon.png', 180, 180, `<div class=n style="--n:120px">B</div>`],
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
