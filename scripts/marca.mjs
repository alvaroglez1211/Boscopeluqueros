// Componente de marca PROVISIONAL.
//
// Mientras no exista el logotipo vectorial definitivo, se dibuja una composición
// tipográfica (Roboto Serif + Archivo):
//
//     BOSCO
//   — TRIANA —
//   PELUQUEROS
//
// Para sustituirla por el logo real, basta con poner las rutas de los SVG en
// config/negocio.mjs → marca.logoCompleto / logoCompleto_crema / logoCompacto.
// Siempre es decorativa (aria-hidden): el nombre accesible lo pone quien la usa.

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/**
 * @param {object} d    datos del negocio
 * @param {object} o
 * @param {'completa'|'compacta'} o.variante
 * @param {'marino'|'crema'} o.tono  color de las letras
 */
export function marca(d, { variante = 'completa', tono = 'marino' } = {}) {
  const svg = variante === 'compacta'
    ? d.marca.logoCompacto
    : (tono === 'crema' ? d.marca.logoCompleto_crema : null) || d.marca.logoCompleto;

  if (svg) {
    return `<img class="marca-img marca-img--${variante}" src="${esc(svg)}" alt="" aria-hidden="true">`;
  }

  return `<span class="marca marca--${variante} marca--${tono}" aria-hidden="true">`
    + `<span class="marca__nombre">${esc(d.nombre)}</span>`
    + `<span class="marca__firma">${esc(d.firma)}</span>`
    + (variante === 'completa' ? `<span class="marca__desc">${esc(d.descriptor)}</span>` : '')
    + '</span>';
}
