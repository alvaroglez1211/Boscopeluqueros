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
      <figure class="foto ${clase}">
        <picture>
          ${f.webp ? `<source srcset="${esc(f.webp)}" type="image/webp">` : ''}
          <img src="${esc(f.src)}" width="${f.ancho}" height="${f.alto}" alt="${esc(f.alt || '')}"${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}${f.posicion ? ` style="object-position:${esc(f.posicion)}"` : ''}>
        </picture>
        ${f.ilustrativa ? '<figcaption>Imagen ilustrativa, no corresponde al local.</figcaption>' : ''}
      </figure>`;

const portadaVisual = fotoPortada
  ? foto(fotoPortada, { lazy: false, clase: 'portada__foto' })
  : `
      <div class="portada__rotulo" aria-hidden="true">
        ${marca(d, { variante: 'completa', tono: 'crema' })}
        <p class="portada__rotulo-dir">${esc(d.direccion.calle)}</p>
      </div>`;

const servicios = d.servicios.lista.map((s) => `
          <li>
            <span class="servicios__nombre">${esc(s.nombre)}${s.detalle ? ` <small>${esc(s.detalle)}</small>` : ''}</span>
            ${precios && s.precio ? `<span class="servicios__precio">${esc(s.precio)}</span>` : ''}
          </li>`).join('');

const filasHorario = horario ? horario.dias.map((h) => `
            <tr data-dia="${h.dia}">
              <th scope="row">${esc(h.nombre)}</th>
              <td>${h.tramos.length ? h.tramos.map(([a, b]) => `<span>${a} – ${b}</span>`).join('') : 'Cerrado'}</td>
            </tr>`).join('') : '';

const hechosLocal = `
        <ul class="local__hechos">
          <li><span class="num">—</span>${esc(d.tipo)}</li>
          <li><span class="num">—</span>${esc(d.direccion.calle)}, ${esc(d.direccion.barrio)}</li>
          <li><span class="num">—</span>Cita previa por Booksy</li>
        </ul>`;

// ── Datos estructurados (solo datos confirmados) ──────────────
const ld = {
  '@context': 'https://schema.org',
  '@type': 'HairSalon',
  name: nombreCompleto,
  address: {
    '@type': 'PostalAddress',
    streetAddress: d.direccion.calle,
    addressLocality: d.direccion.ciudad,
    postalCode: d.direccion.codigoPostal || undefined,
    addressCountry: d.direccion.pais,
  },
  sameAs: [d.instagram.url],
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

// ── Página ────────────────────────────────────────────────────
const html = `<!doctype html>
<!-- Archivo generado por scripts/build.mjs a partir de config/negocio.mjs. No lo edites a mano. -->
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(d.sitio.titulo)}</title>
  <meta name="description" content="${esc(d.sitio.descripcion)}">
  <meta name="theme-color" content="#101D33">
  ${d.sitio.url ? `<link rel="canonical" href="${esc(d.sitio.url)}">` : ''}
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_ES">
  <meta property="og:title" content="${esc(d.sitio.titulo)}">
  <meta property="og:description" content="${esc(d.sitio.descripcion)}">
  <meta property="og:image" content="${esc(absoluta(d.marca.ogImage))}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${esc(d.marca.favicon)}" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${esc(d.marca.appleTouchIcon)}">
  <link rel="preload" href="fonts/roboto-serif-condensed-800.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="fonts/archivo-400-600.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="styles.css">
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
  <a class="saltar" href="#contenido">Saltar al contenido</a>

  <header class="cabecera">
    <div class="cabecera__in">
      <a class="cabecera__marca" href="#inicio" aria-label="${esc(nombreCompleto)}, inicio">
        ${marca(d, { variante: 'compacta', tono: 'marino' })}
      </a>
      <nav class="cabecera__nav" aria-label="Secciones">
        <a href="#servicios">Servicios</a>
        <a href="#local">El local</a>
        ${horario ? '<a href="#horario">Horario</a>' : ''}
        <a href="#donde">Dónde</a>
      </nav>
      <a class="boton boton--marino cabecera__cta" ${ext(d.booksyUrl)}>Pedir cita</a>
    </div>
  </header>

  <main id="contenido">
    <section class="portada" id="inicio" aria-labelledby="titulo-portada">
      <div class="portada__texto">
        <p class="antetitulo">${esc(d.tipo)} · ${esc(d.direccion.barrio)}, ${esc(d.direccion.ciudad)}</p>
        <h1 id="titulo-portada">Tu peluquero en Triana.</h1>
        <p class="portada__desc">Corte y barba en la calle Alfarería. Como te gusta, con ${esc(d.nombre)}.</p>
        <div class="acciones" id="acciones-portada">
          <a class="boton boton--marino" ${ext(d.booksyUrl)}>Reservar en Booksy</a>
          ${secundaria ? `<a class="boton boton--linea" ${secundaria.attrs}>${esc(secundaria.texto)}</a>`
            : `<a class="boton boton--linea" ${ext(d.mapsUrl)}>Cómo llegar</a>`}
        </div>
        ${horario ? '<p class="portada__hoy" id="hoy" hidden></p>' : ''}
      </div>
      ${portadaVisual}
    </section>

    <section class="bloque servicios" id="servicios" aria-labelledby="titulo-servicios">
      <div class="bloque__cab">
        <p class="bloque__num">01</p>
        <h2 id="titulo-servicios">Cortes y barba</h2>
      </div>
      <div class="bloque__cuerpo">
        <ul class="servicios__lista">${servicios}
        </ul>
        <p class="nota">${esc(d.servicios.nota)}</p>
      </div>
    </section>

    <section class="bloque local" id="local" aria-labelledby="titulo-local">
      <div class="bloque__cab">
        <p class="bloque__num">02</p>
        <h2 id="titulo-local">Al frente está ${esc(d.nombre)}.</h2>
      </div>
      <div class="bloque__cuerpo">
        <p class="local__texto">Una peluquería de caballeros en la calle Alfarería, en Triana. Corte, barba y trato directo con ${esc(d.nombre)}.</p>
        ${hechosLocal}
      </div>
      ${fotosLocal.length ? `<div class="local__fotos">${fotosLocal.map((f) => foto(f)).join('')}
      </div>` : ''}
    </section>

    <section class="reservar" id="reservar" aria-labelledby="titulo-reservar">
      <div class="reservar__in">
        <h2 id="titulo-reservar">Tu próxima cita, aquí.</h2>
        <p>Elige tu hueco en Booksy.${whatsappUrl ? ' Si prefieres consultarnos algo, escríbenos por WhatsApp.' : telefono ? ' Si prefieres consultarnos algo, llámanos.' : ''}</p>
        <div class="acciones">
          <a class="boton boton--crema" ${ext(d.booksyUrl)}>Reservar en Booksy</a>
          ${secundaria ? `<a class="boton boton--linea-crema" ${secundaria.attrs}>${esc(secundaria.texto)}</a>` : ''}
        </div>
      </div>
    </section>

    <section class="bloque visita" aria-label="Horario y ubicación">
      ${horario ? `<div class="visita__col" id="horario">
        <p class="bloque__num">03</p>
        <h2>Horario</h2>
        <table class="horario">
          <caption class="sr">Horario de apertura por días</caption>
          <tbody>${filasHorario}
          </tbody>
        </table>
        <p class="nota">${esc(horario.nota)}</p>
      </div>` : ''}
      <div class="visita__col" id="donde">
        <p class="bloque__num">${horario ? '04' : '03'}</p>
        <h2>Dónde</h2>
        <address class="direccion">
          ${esc(d.direccion.calle)}<br>
          ${esc(d.direccion.barrio)}, ${esc(d.direccion.ciudad)}
        </address>
        <a class="boton boton--linea" ${ext(d.mapsUrl)}>Cómo llegar<span class="sr"> (Google Maps, se abre en otra pestaña)</span></a>
      </div>
    </section>
  </main>

  <footer class="pie">
    <div class="pie__in">
      <div class="pie__marca">${marca(d, { variante: 'compacta', tono: 'marino' })}</div>
      <p>${esc(d.direccion.calle)} · ${esc(d.direccion.barrio)}, ${esc(d.direccion.ciudad)}</p>
      <p><a ${ext(d.instagram.url)}>@${esc(d.instagram.usuario)}<span class="sr"> en Instagram</span></a></p>
      ${d.sitio.legales.map((l) => `<p><a href="${esc(l.href)}">${esc(l.texto)}</a></p>`).join('')}
      <p>© <span id="anio">${new Date().getFullYear()}</span> ${esc(nombreCompleto)}</p>
    </div>
  </footer>

  <nav class="barra-movil" id="barra-movil" aria-label="Reservar">
    <a class="boton boton--marino" ${ext(d.booksyUrl)}>Reservar en Booksy</a>
    ${whatsappUrl ? `<a class="boton boton--linea" ${ext(whatsappUrl)}>WhatsApp</a>` : ''}
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
      var fila = document.querySelector('.horario tr[data-dia="' + hoy + '"]');
      if (fila) {
        fila.classList.add('es-hoy');
        fila.querySelector('th').insertAdjacentHTML('beforeend', ' <span class="etiqueta-hoy">hoy</span>');
      }
      var horario = ${JSON.stringify(horario ? Object.fromEntries(horario.dias.map((h) => [h.dia, { n: h.nombre, t: tramosTexto(h.tramos) }])) : null)};
      var hoyEl = document.getElementById('hoy');
      if (hoyEl && horario && horario[hoy]) {
        hoyEl.innerHTML = '<span>Hoy, ' + horario[hoy].n.toLowerCase() + '</span> ' + horario[hoy].t;
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

// ── Avisos de datos pendientes ────────────────────────────────
const pendientes = [];
if (!d.whatsapp?.confirmado) pendientes.push('WhatsApp sin confirmar: el botón está oculto.');
if (!telefono) pendientes.push('Teléfonos sin confirmar: no se muestran.');
if (!d.sitio.url) pendientes.push('Sin dominio definitivo: no hay canonical y og:image es relativa.');
if (!d.fotos.portada && !d.fotos.local.length) pendientes.push('No hay fotos reales del local ni de Bosco.');
if (!d.marca.logoCompleto) pendientes.push('Logo: se usa la composición tipográfica provisional.');
console.log('index.html generado.');
if (pendientes.length) console.log('Pendientes:\n  - ' + pendientes.join('\n  - '));
