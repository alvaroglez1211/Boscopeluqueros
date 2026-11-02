// Comprobaciones estáticas de index.html. Sin dependencias.
// Uso: npm run check
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(raiz, 'index.html'), 'utf8');
const css = readFileSync(join(raiz, 'styles.css'), 'utf8');
const errores = [];
const ok = (cond, msg) => { if (!cond) errores.push(msg); };

// Estructura
ok((html.match(/<h1[\s>]/g) || []).length === 1, 'Debe haber exactamente un <h1>.');
ok(/<html lang="es">/.test(html), 'Falta lang="es".');
ok(/<title>Bosco Peluqueros en Triana \| Corte y barba<\/title>/.test(html), 'Título SEO incorrecto.');
ok(/name="description" content="Peluquería de caballeros en la calle Alfarería, Triana, Sevilla\. Descubre Bosco y reserva tu cita\."/.test(html), 'Meta description incorrecta.');
const niveles = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
niveles.forEach((n, i) => ok(i === 0 || n <= niveles[i - 1] + 1, `Salto de encabezado: h${niveles[i - 1]} → h${n}.`));

// Enlaces
ok(!/href="#"/.test(html), 'Hay enlaces con href="#".');
ok(!/600\s?00\s?00\s?00|34600000000/.test(html), 'Aparece el número ficticio 600 00 00 00.');
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) ok(html.includes(`id="${id}"`), `Ancla rota: #${id}.`);
for (const m of html.matchAll(/<a [^>]*target="_blank"[^>]*>/g)) ok(/rel="noopener/.test(m[0]), `Enlace externo sin rel=noopener: ${m[0]}`);
for (const [, u] of html.matchAll(/href="(https?:[^"]+)"/g)) ok(!/example|TODO|BOOKSY_URL/i.test(u), `Enlace sospechoso: ${u}`);
ok(html.includes('https://booksy.com/es-es/dl/show-business/757'), 'Falta el enlace de Booksy.');

// Recursos locales
const locales = [...html.matchAll(/(?:src|href|srcset)="([^"#:]+?)"/g)].map((m) => m[1]).filter((p) => !p.startsWith('//'));
for (const p of new Set(locales)) ok(existsSync(join(raiz, p)), `Recurso local inexistente: ${p}`);
for (const [, p] of css.matchAll(/url\("?([^")]+)"?\)/g)) ok(existsSync(join(raiz, p)), `Recurso CSS inexistente: ${p}`);

// Imágenes
for (const m of html.matchAll(/<img [^>]*>/g)) {
  ok(/ alt="/.test(m[0]), `Imagen sin alt: ${m[0]}`);
  ok(/ width="\d+"/.test(m[0]) && / height="\d+"/.test(m[0]) || /marca-img/.test(m[0]), `Imagen sin dimensiones: ${m[0]}`);
}
ok(!/class="ph|placeholder|repeating-linear-gradient/.test(html + css), 'Quedan placeholders rayados.');

// Datos estructurados: sin valoraciones ni precios
const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
ok(ld['@type'] === 'HairSalon', 'JSON-LD sin HairSalon.');
ok(!('aggregateRating' in ld) && !('priceRange' in ld) && !('review' in ld), 'JSON-LD con datos no confirmados.');

// Contraste WCAG AA de los tokens
const hex = (h) => h.match(/\w\w/g).map((x) => parseInt(x, 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
const lum = (h) => { const [r, g, b] = hex(h.replace('#', '')); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pares = [
  ['#101D33', '#F2EBDD', 4.5, 'marino sobre crema'],
  ['#605D57', '#F2EBDD', 4.5, 'texto secundario sobre crema'],
  ['#605D57', '#FAF6EF', 4.5, 'texto secundario sobre superficie'],
  ['#A43B29', '#F2EBDD', 4.5, 'teja sobre crema'],
  ['#F2EBDD', '#101D33', 4.5, 'crema sobre marino'],
  ['#F2EBDD', '#A43B29', 4.5, 'crema sobre teja (hover de botón)'],
];
const informe = pares.map(([a, b, min, n]) => { const r = ratio(a, b); ok(r >= min, `Contraste insuficiente (${n}): ${r.toFixed(2)}`); return `  ${n}: ${r.toFixed(2)}:1`; });

if (errores.length) { console.error('✗ ' + errores.length + ' problema(s):\n  - ' + errores.join('\n  - ')); process.exit(1); }
console.log('✓ Comprobaciones estáticas superadas.\nContraste:\n' + informe.join('\n'));
