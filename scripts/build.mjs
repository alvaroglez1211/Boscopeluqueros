// Genera index.html a partir de config/negocio.mjs. Sin dependencias.
// Uso: npm run build   (o: node scripts/build.mjs)
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import datos from '../config/negocio.mjs';
import { marca } from './marca.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const d = datos;

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ext = (href) => `href="${esc(href)}" target="_blank" rel="noopener noreferrer"`;

// ── Datos derivados ───────────────────────────────────────────
const whatsappUrl = d.whatsapp?.confirmado
  ? `https://wa.me/${d.whatsapp.numero}?text=${encodeURIComponent(d.whatsapp.mensaje || '')}`
  : null;
const telefono = (d.telefonos || []).find((t) => t.confirmado) || null;
const horario = d.horario?.confirmado ? d.horario : null;
const precios = !!d.servicios?.preciosConfirmados;
const ilustrativas = d.fotos.mostrarIlustrativas ? d.fotos.ilustrativas : [];
const fotoPortada = d.fotos.portada || (ilustrativas[0] ? { ...ilustrativas[0], ilustrativa: true } : null);
const fotosLocal = d.fotos.local.length
  ? d.fotos.local
  : ilustrativas.slice(d.fotos.portada ? 0 : 1).map((f) => ({ ...f, ilustrativa: true })); // sin repetir la de portada
const nombreCompleto = `${d.nombre} ${d.descriptor}`;
const absoluta = (p) => (d.sitio.url ? new URL(p, d.sitio.url).href : p);

// Acción secundaria: WhatsApp si está confirmado; si no, teléfono confirmado; si no, nada.
const secundaria = whatsappUrl
  ? { texto: 'Escribir por WhatsApp', attrs: ext(whatsappUrl) }
  : telefono
    ? { texto: `Llamar al ${telefono.texto}`, attrs: `href="tel:${esc(telefono.numero)}"` }
    : null;

const tramosTexto = (t) => (t.length ? t.map(([a, b]) => `${a}–${b}`).join(' · ') : 'Cerrado');

// ── Bloques ───────────────────────────────────────────────────
const foto = (f, { lazy = true, clase = '' } = {}) => `
      <figure class="photo ${clase}">
        <picture>
          ${f.webp ? `<source srcset="${esc(f.webp)}" type="image/webp">` : ''}
          <img src="${esc(f.src)}" width="${f.ancho}" height="${f.alto}" alt="${esc(f.alt || '')}"${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}${f.posicion ? ` style="object-position:${esc(f.posicion)}"` : ''}>
        </picture>
        ${f.ilustrativa ? '<figcaption>Imagen ilustrativa</figcaption>' : ''}
      </figure>`;

// Fotos de la cuadrícula: la de portada (grande) y las del local, hasta 3.
const fotosGrid = [fotoPortada, ...fotosLocal].filter(Boolean).slice(0, 3);

const servicios = d.servicios.lista.map((s) => `
      <li><span class="prices__name">${esc(s.nombre)}${s.detalle ? ` <small>${esc(s.detalle)}</small>` : ''}</span>${precios && s.precio ? `<span class="prices__dots" aria-hidden="true"></span><span class="prices__val">${esc(s.precio)}</span>` : ''}</li>`).join('');

const filasHorario = horario ? horario.dias.map((h) => `
        <tr data-dia="${h.dia}"><th scope="row">${esc(h.nombre)}</th><td>${h.tramos.length ? h.tramos.map(([a, b]) => `${a} – ${b}`).join('<br>') : 'Cerrado'}</td></tr>`).join('') : '';

// Opciones del bloque «¿Cómo pido cita?»: solo destinos reales y confirmados.
const opciones = [
  { label: 'Booksy', sub: 'Elige día y hora', attrs: ext(d.booksyUrl) },
  ...(whatsappUrl ? [{ label: 'WhatsApp', sub: d.whatsapp.numero.replace(/^34/, '').replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'), attrs: ext(whatsappUrl) }] : []),
  ...(telefono ? [{ label: 'Teléfono', sub: telefono.texto, attrs: `href="tel:${esc(telefono.numero)}"` }] : []),
  { label: 'Instagram', sub: `@${d.instagram.usuario}`, attrs: ext(d.instagram.url) },
];

// ── Datos estructurados (solo datos confirmados) ──────────────
const ld = {
  '@context': 'https://schema.org',
  '@type': 'HairSalon',
  '@id': d.sitio.url ? d.sitio.url + '#negocio' : undefined,
  name: nombreCompleto,
  alternateName: d.nombresAlternativos,
  description: d.sitio.descripcion,
  ...(d.sitio.url ? { image: absoluta(d.marca.ogImage), logo: absoluta(d.marca.appleTouchIcon) } : {}),
  hasMap: d.mapsUrl,
  areaServed: { '@type': 'Place', name: `${d.direccion.barrio}, ${d.direccion.ciudad}` },
  address: {
    '@type': 'PostalAddress',
    streetAddress: d.direccion.calle,
    addressLocality: d.direccion.ciudad,
    postalCode: d.direccion.codigoPostal || undefined,
    addressRegion: 'Andalucía',
    addressCountry: d.direccion.pais,
  },
  potentialAction: { '@type': 'ReserveAction', target: d.booksyUrl, name: 'Reservar cita en Booksy' },
  ...(precios ? {
    hasOfferCatalog: {
      '@type': 'OfferCatalog', name: 'Servicios',
      itemListElement: d.servicios.lista.filter((s) => s.precio).map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.detalle ? `${s.nombre} (${s.detalle})` : s.nombre },
        price: s.precio.replace(/[^\d,]/g, '').replace(',', '.'),
        priceCurrency: 'EUR',
      })),
    },
  } : {}),
  sameAs: [d.instagram.url, ...(d.sitio.perfiles || [])],
  ...(d.sitio.url ? { url: d.sitio.url } : {}),
  ...(telefono ? { telephone: telefono.numero } : {}),
  ...(horario ? {
    openingHoursSpecification: horario.dias.flatMap((h) => h.tramos.map(([a, b]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][h.dia]}`,
      opens: a, closes: b,
    }))),
  } : {}),
};

// ── Preguntas frecuentes (solo con datos confirmados) ─────────
const precioDe = (n) => d.servicios.lista.find((s) => s.nombre === n)?.precio;
const diasAbre = horario ? horario.dias.filter((h) => h.tramos.length).map((h) => h.nombre.toLowerCase()) : [];
const diasCierra = horario ? horario.dias.filter((h) => !h.tramos.length).map((h) => h.nombre.toLowerCase()) : [];
const lista = (a) => (a.length > 1 ? a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1] : a[0] || '');
const preguntas = [
  ['¿Cómo pido cita?', `Por <a ${ext(d.booksyUrl)}>Booksy</a>: eliges el servicio, el día y la hora que te vengan bien y te llega la confirmación.`],
  ['¿Dónde está la peluquería?', `En la ${esc(d.direccion.calle.replace(/^Calle/, 'calle'))}, en el barrio de ${esc(d.direccion.barrio)} (${esc(d.direccion.ciudad)}). <a ${ext(d.mapsUrl)}>Ver en Google Maps</a>.`],
  ...(precios && precioDe('Corte') ? [['¿Cuánto cuesta un corte de pelo?', `El corte de caballero cuesta ${esc(precioDe('Corte'))}${precioDe('Arreglo de barba') ? ` y el arreglo de barba, ${esc(precioDe('Arreglo de barba'))}` : ''}. Los precios actualizados están siempre en Booksy.`]] : []),
  ...(precios && precioDe('Corte niño') ? [['¿Cortáis el pelo a niños?', `Sí. El corte para menores de 12 años cuesta ${esc(precioDe('Corte niño'))}.`]] : []),
  ...(horario ? [['¿Qué días abre?', `Abre de ${diasAbre[0]} a ${diasAbre[diasAbre.length - 1]}, por la mañana y por la tarde. ${lista(diasCierra).replace(/^./, (c) => c.toUpperCase())}, cerrado.`]] : []),
];

// ── Página ────────────────────────────────────────────────────
const html = `<!doctype html>
<!-- Archivo generado por scripts/build.mjs a partir de config/negocio.mjs. No lo edites a mano. -->
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(d.sitio.titulo)}</title>
  <meta name="description" content="${esc(d.sitio.descripcion)}">
  <meta name="theme-color" content="#1b1916">
  <meta name="robots" content="index, follow, max-image-preview:large">
  ${d.sitio.googleVerificacion ? `<meta name="google-site-verification" content="${esc(d.sitio.googleVerificacion)}">` : ''}
  <meta name="geo.region" content="ES-SE">
  <meta name="geo.placename" content="${esc(d.direccion.barrio)}, ${esc(d.direccion.ciudad)}">
  ${d.sitio.url ? `<link rel="canonical" href="${esc(d.sitio.url)}">` : ''}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(nombreCompleto)}">
  ${d.sitio.url ? `<meta property="og:url" content="${esc(d.sitio.url)}">` : ''}
  <meta property="og:locale" content="es_ES">
  <meta property="og:title" content="${esc(d.sitio.titulo)}">
  <meta property="og:description" content="${esc(d.sitio.descripcion)}">
  <meta property="og:image" content="${esc(absoluta(d.marca.ogImage))}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(nombreCompleto)}, ${esc(d.direccion.barrio)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${esc(d.marca.favicon)}" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${esc(d.marca.appleTouchIcon)}">
  <link rel="preload" href="fonts/archivo-condensed-800.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="fonts/archivo-400-600.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="styles.css">
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
  <a class="saltar" href="#contenido">Saltar al contenido</a>

  <header class="top">
    <a class="top__logo" href="#inicio" aria-label="${esc(nombreCompleto)}, inicio">${marca(d, { variante: 'compacta' })}</a>
    <nav class="top__nav" aria-label="Secciones">
      <a href="#precios">Precios</a>
      ${horario ? '<a href="#horario">Horario</a>' : ''}
      <a href="#donde">Dónde</a>
    </nav>
    <a class="btn btn--small" ${ext(d.booksyUrl)}>Pedir cita</a>
  </header>

  <main id="contenido">
    <section class="hero" id="inicio" aria-labelledby="titulo">
      <p class="hero__kicker">${esc(d.tipo)} · ${esc(d.direccion.barrio)}, ${esc(d.direccion.ciudad)}</p>
      <h1 class="hero__title" id="titulo">${esc(d.nombre)}<span class="sr"> ${esc(d.descriptor)}, ${esc(d.tipo.toLowerCase())} en ${esc(d.direccion.barrio)}</span></h1>
      <div class="hero__row">
        <div>
          <p class="hero__text">Corte y barba en la calle Alfarería. Sin prisas y como lo pides. <em>Reserva en un minuto</em>${whatsappUrl ? ' o escríbenos' : ''}.</p>
          ${horario ? '<p class="hero__hoy" id="hoy" hidden></p>' : ''}
        </div>
        <div class="hero__actions" id="acciones-portada">
          <a class="btn" ${ext(d.booksyUrl)}>Reservar en Booksy</a>
          ${whatsappUrl ? `<a class="btn btn--ghost" ${ext(whatsappUrl)}>WhatsApp</a>` : `<a class="btn btn--ghost" ${ext(d.mapsUrl)}>Cómo llegar</a>`}
        </div>
      </div>
    </section>

    ${fotosGrid.length ? `<section class="photos photos--${fotosGrid.length}" aria-label="Fotos">${fotosGrid.map((f, n) => foto(f, { lazy: n > 0, clase: n === 0 ? 'photo--tall' : '' })).join('')}
    </section>` : ''}

    <section class="block" id="precios" aria-labelledby="titulo-precios">
      <h2 class="block__title" id="titulo-precios"><span>01</span>Precios</h2>
      <ul class="prices">${servicios}
      </ul>
      <p class="note">${esc(d.servicios.nota)}</p>
    </section>

    <section class="book" id="cita" aria-labelledby="titulo-cita">
      <div class="book__col">
        <h2 id="titulo-cita">¿Cómo pido cita?</h2>
        <p>Lo más rápido es Booksy: ves los huecos libres y te llega un recordatorio.${whatsappUrl ? ' Si prefieres hablar con nosotros, mándanos un WhatsApp.' : telefono ? ' Si prefieres hablar con nosotros, llámanos.' : ''}</p>
        <p>Una peluquería y barbería de caballeros en la calle Alfarería, en Triana (Sevilla). Corte, barba y trato directo con ${esc(d.nombre)}.</p>
      </div>
      <div class="book__opts">${opciones.map((o) => `
        <a class="opt" ${o.attrs}>
          <span class="opt__label">${esc(o.label)}</span>
          <span class="opt__sub">${esc(o.sub)}</span>
          <span class="opt__arrow" aria-hidden="true">→</span>
        </a>`).join('')}
      </div>
    </section>

    <section class="block block--split" aria-label="Horario y ubicación">
      ${horario ? `<div id="horario">
        <h2 class="block__title"><span>02</span>Horario</h2>
        <table class="hours">
          <caption class="sr">Horario de apertura por días</caption>
          <tbody>${filasHorario}
          </tbody>
        </table>
        <p class="note">${esc(horario.nota)}</p>
      </div>` : ''}
      <div id="donde">
        <h2 class="block__title"><span>${horario ? '03' : '02'}</span>Dónde</h2>
        <address class="addr">
          ${esc(d.direccion.calle)}<br>
          ${esc(d.direccion.barrio)}, ${esc(d.direccion.ciudad)}
        </address>
        <a class="link" ${ext(d.mapsUrl)}>Abrir en Google Maps <span aria-hidden="true">→</span></a>
      </div>
    </section>

    <section class="block" id="preguntas" aria-labelledby="titulo-faq">
      <h2 class="block__title" id="titulo-faq"><span>${horario ? '04' : '03'}</span>Preguntas</h2>
      <div class="faq">${preguntas.map(([q, a]) => `
        <div class="faq__item">
          <h3>${esc(q)}</h3>
          <p>${a}</p>
        </div>`).join('')}
      </div>
    </section>
  </main>

  <footer class="foot">
    <span>${esc(nombreCompleto)} · ${esc(d.direccion.calle)}, ${esc(d.direccion.ciudad)}</span>
    <a ${ext(d.instagram.url)}>@${esc(d.instagram.usuario)}<span class="sr"> en Instagram</span></a>
    ${d.sitio.legales.map((l) => `<a href="${esc(l.href)}">${esc(l.texto)}</a>`).join('')}
    <span>© <span id="anio">${new Date().getFullYear()}</span></span>
  </footer>

  <nav class="mbar" id="barra-movil" aria-label="Reservar">
    <a ${ext(d.booksyUrl)}>Reservar en Booksy</a>
    ${whatsappUrl ? `<a ${ext(whatsappUrl)}>WhatsApp</a>` : ''}
  </nav>

  <script>
    (function () {
      var anio = document.getElementById('anio');
      if (anio) anio.textContent = new Date().getFullYear();

      // Día actual en Sevilla, aunque quien visite esté en otra zona horaria.
      var hoy;
      try {
        var nombre = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Europe/Madrid' }).format(new Date());
        hoy = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(nombre);
      } catch (e) { hoy = new Date().getDay(); }
      var fila = document.querySelector('.hours tr[data-dia="' + hoy + '"]');
      if (fila) {
        fila.classList.add('es-hoy');
        fila.querySelector('th').insertAdjacentHTML('beforeend', ' <span class="hoy">hoy</span>');
      }
      var horario = ${JSON.stringify(horario ? Object.fromEntries(horario.dias.map((h) => [h.dia, { n: h.nombre, t: tramosTexto(h.tramos) }])) : null)};
      var hoyEl = document.getElementById('hoy');
      if (hoyEl && horario && horario[hoy]) {
        hoyEl.innerHTML = '<span>Hoy, ' + horario[hoy].n.toLowerCase() + ':</span> ' + horario[hoy].t;
        hoyEl.hidden = false;
      }

      // Barra inferior en móvil: se muestra cuando los botones de la portada ya no se ven.
      var barra = document.getElementById('barra-movil');
      var acciones = document.getElementById('acciones-portada');
      if (barra && acciones && 'IntersectionObserver' in window) {
        document.documentElement.classList.add('js-barra');
        new IntersectionObserver(function (e) {
          barra.classList.toggle('visible', !e[0].isIntersecting);
        }).observe(acciones);
      }
    })();
  </script>
</body>
</html>
`;

writeFileSync(join(raiz, 'index.html'), html.replace(/\n\s*\n(\s*\n)+/g, '\n\n'));
writeFileSync(join(raiz, '.nojekyll'), '');
writeFileSync(join(raiz, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /marca/anterior/\n${d.sitio.url ? `\nSitemap: ${absoluta('sitemap.xml')}\n` : ''}`);
if (d.sitio.url) {
  writeFileSync(join(raiz, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${esc(d.sitio.url)}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>
</urlset>
`);
}

// ── Avisos de datos pendientes ────────────────────────────────
const pendientes = [];
if (!d.whatsapp?.confirmado) pendientes.push('WhatsApp sin confirmar: el botón está oculto.');
if (!telefono) pendientes.push('Teléfonos sin confirmar: no se muestran.');
if (!d.sitio.url) pendientes.push('Sin dominio definitivo: no hay canonical y og:image es relativa.');
if (!d.sitio.googleVerificacion) pendientes.push('Google Search Console sin verificar (sitio.googleVerificacion).');
if (!d.fotos.portada && !d.fotos.local.length) pendientes.push('No hay fotos reales del local ni de Bosco.');
if (!d.marca.logoCompleto) pendientes.push('Logo: se usa la composición tipográfica provisional.');
console.log('index.html generado.');
if (pendientes.length) console.log('Pendientes:\n  - ' + pendientes.join('\n  - '));
