// Marca de cabecera: «Bosco» en Archivo estrecha + «peluqueros» en cursiva.
// Si existe un logo en SVG, pon su ruta en config/negocio.mjs → marca.logoCompacto.
// Siempre es decorativa (aria-hidden): el nombre accesible lo pone quien la usa.

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export function marca(d, { variante = 'compacta' } = {}) {
  const svg = variante === 'compacta' ? d.marca.logoCompacto : d.marca.logoCompleto;
  if (svg) return `<img class="marca-img" src="${esc(svg)}" alt="" aria-hidden="true">`;
  return `<span class="marca" aria-hidden="true">${esc(d.nombre)}<span>${esc(d.descriptor.toLowerCase())}</span></span>`;
}
