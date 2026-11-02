// Comprobación visual con Playwright en 360, 390, 768, 1024 y 1440 px.
// Uso: node scripts/check-visual.cjs [carpeta-capturas]
// Requiere Playwright (no es dependencia del proyecto: usa el instalado en el sistema).
const { chromium } = require('playwright');
const path = require('path');
const raiz = path.join(__dirname, '..');
const salida = process.argv[2];
const anchos = [360, 390, 768, 1024, 1440];

(async () => {
  const { servir } = await import('./preview.mjs');
  const srv = await servir(0);
  const base = `http://localhost:${srv.address().port}/`;
  const b = await chromium.launch();
  const fallos = [];
  for (const w of anchos) {
    const p = await b.newPage({ viewport: { width: w, height: 800 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('requestfailed', (r) => { if (r.url().startsWith(base)) errs.push('Recurso no cargado: ' + r.url()); });
    await p.goto(base);
    await p.evaluate(() => document.fonts.ready);
    const r = await p.evaluate(() => {
      const out = [];
      if (document.documentElement.scrollWidth > innerWidth) out.push(`scroll horizontal (${document.documentElement.scrollWidth}px)`);
      document.querySelectorAll('img').forEach((i) => { if (i.complete && !i.naturalWidth) out.push('imagen rota: ' + i.src); });
      const base = parseFloat(getComputedStyle(document.body).fontSize);
      if (base < 16) out.push('texto base < 16px');
      document.querySelectorAll('a, button').forEach((a) => {
        const rc = a.getBoundingClientRect(); const cs = getComputedStyle(a);
        if (!rc.width || cs.visibility === 'hidden' || a.closest('[hidden]') || a.classList.contains('saltar')) return;
        if (cs.display === 'inline' && a.parentElement.tagName === 'P') return; // enlace dentro de una frase: exento (WCAG 2.5.8)
        if (rc.height < 44) out.push(`objetivo táctil pequeño (${Math.round(rc.height)}px): ${a.textContent.trim().slice(0, 30)}`);
      });
      // Pequeños textos legibles
      document.querySelectorAll('body *').forEach((el) => {
        if (el.children.length || !el.textContent.trim()) return;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < 9) out.push('texto ilegible (' + fs + 'px): ' + el.textContent.trim().slice(0, 20));
      });
      return out;
    });
    // La barra fija no debe tapar el pie al final de la página
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(350);
    const tapa = await p.evaluate(() => {
      const barra = document.getElementById('barra-movil'); const pie = document.querySelector('.foot');
      if (!barra || getComputedStyle(barra).display === 'none') return null;
      const rb = barra.getBoundingClientRect(); const ultimo = [...pie.children].pop().getBoundingClientRect();
      return ultimo.bottom > rb.top + 1 ? 'la barra inferior tapa el pie' : null;
    });
    // Destinos de anclas no quedan bajo la cabecera fija
    const anclas = await p.evaluate(async () => {
      const out = []; const cab = document.querySelector('.top');
      for (const a of document.querySelectorAll('.top__nav a')) {
        const t = document.querySelector(a.getAttribute('href'));
        t.scrollIntoView({ behavior: 'instant' }); await new Promise((r) => setTimeout(r, 50));
        const fija = getComputedStyle(cab).position === 'sticky';
        if (fija && t.getBoundingClientRect().top < cab.getBoundingClientRect().bottom - 1) out.push('ancla tapada: ' + a.getAttribute('href'));
      }
      return out;
    });
    // Teclado: el primer Tab enfoca «Saltar al contenido» y el foco es visible
    await p.goto(base); await p.evaluate(() => document.fonts.ready);
    await p.keyboard.press('Tab');
    const foco = await p.evaluate(() => { const a = document.activeElement; return { t: a.textContent.trim(), o: getComputedStyle(a).outlineStyle }; });
    if (foco.t !== 'Saltar al contenido' || foco.o === 'none') r.push('foco de teclado inicial incorrecto: ' + JSON.stringify(foco));
    // Recorre todo con Tab: cada elemento enfocado debe mostrar contorno
    for (let i = 0; i < 40; i++) {
      await p.keyboard.press('Tab');
      const f = await p.evaluate(() => { const a = document.activeElement; if (a === document.body) return null; return { t: a.textContent.trim().slice(0, 25), o: getComputedStyle(a).outlineStyle }; });
      if (!f) break;
      if (f.o === 'none') { r.push('sin foco visible: ' + f.t); break; }
    }
    const todos = [...r, ...errs, ...anclas, ...(tapa ? [tapa] : [])];
    if (todos.length) fallos.push(`${w}px:\n    - ` + todos.join('\n    - '));
    if (salida) {
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.screenshot({ path: path.join(salida, `vista-${w}.png`), fullPage: true });
    }
    console.log(`${w}px ${todos.length ? '✗' : '✓'}`);
    await p.close();
  }
  await b.close(); srv.close();
  if (fallos.length) { console.error(fallos.join('\n')); process.exit(1); }
  console.log('✓ Comprobación visual superada en ' + anchos.join(', ') + ' px.');
})();
