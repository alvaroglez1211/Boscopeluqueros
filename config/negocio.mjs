// ─────────────────────────────────────────────────────────────
//  Datos del negocio: el único archivo que hay que editar.
//  Después de cambiar algo, ejecuta:  npm run build
//
//  Regla: lo que tenga `confirmado: false` o valga `null`
//  NO se publica en la web. Así no salen datos dudosos.
// ─────────────────────────────────────────────────────────────

export default {
  nombre: 'Bosco',
  firma: 'Triana',
  descriptor: 'Peluqueros',
  tipo: 'Peluquería de caballeros',

  direccion: {
    calle: 'Calle Alfarería, 113',
    barrio: 'Triana',
    ciudad: 'Sevilla',
    // Visto en la ficha de Booksy del negocio. Solo se usa en los datos estructurados.
    codigoPostal: '41010',
    pais: 'ES',
  },

  // Enlace de Google Maps que pasó el cliente.
  mapsUrl: 'https://maps.app.goo.gl/zXMAfhCzEWNtkZ9c7',

  // Enlace de Booksy facilitado por el negocio.
  booksyUrl: 'https://booksy.com/es-es/dl/show-business/757',

  // PENDIENTE: el 616 539 412 aparece en un cartel de Instagram, pero falta
  // confirmar que tiene WhatsApp. Cuando esté confirmado, pon `confirmado: true`.
  whatsapp: {
    numero: '34616539412',
    mensaje: 'Hola, quería pedir cita',
    confirmado: false,
  },

  // PENDIENTE: teléfonos del cartel de vacaciones (Instagram, 5 de mayo).
  // Están ocultos hasta que el negocio confirme que siguen vigentes.
  telefonos: [
    { numero: '+34954089985', texto: '954 089 985', confirmado: false },
    { numero: '+34616539412', texto: '616 539 412', confirmado: false },
  ],

  instagram: {
    usuario: 'boscopeluqueros',
    url: 'https://www.instagram.com/boscopeluqueros/',
  },

  // Horario según la ficha de Google Maps del negocio (captura del 2 de noviembre de 2026).
  // Día: 0 = domingo … 6 = sábado. Tramos vacíos = cerrado.
  horario: {
    confirmado: true,
    nota: 'Horario según Google Maps. Los huecos libres, siempre en Booksy.',
    dias: [
      { dia: 1, nombre: 'Lunes', tramos: [['10:00', '14:30'], ['16:00', '19:30']] },
      { dia: 2, nombre: 'Martes', tramos: [['10:00', '14:30'], ['16:00', '19:30']] },
      { dia: 3, nombre: 'Miércoles', tramos: [['10:00', '14:00'], ['17:00', '20:00']] },
      { dia: 4, nombre: 'Jueves', tramos: [['10:00', '14:30'], ['16:00', '19:30']] },
      { dia: 5, nombre: 'Viernes', tramos: [['10:00', '14:30'], ['16:00', '19:00']] },
      { dia: 6, nombre: 'Sábado', tramos: [] },
      { dia: 0, nombre: 'Domingo', tramos: [] },
    ],
  },

  // Servicios y precios copiados de la ficha de Booksy (captura del 2 de noviembre de 2026).
  // Si `preciosConfirmados` es false, se muestran los servicios sin importes.
  servicios: {
    preciosConfirmados: true,
    nota: 'Consulta los precios actualizados al reservar en Booksy.',
    lista: [
      { nombre: 'Corte', precio: '13,00 €' },
      { nombre: 'Corte niño', detalle: 'menores de 12 años', precio: '9,50 €' },
      { nombre: 'Arreglo de barba', precio: '7,00 €' },
      { nombre: 'Desrizante', precio: '18,00 €' },
    ],
  },

  // Fotos. Todavía no hay fotos reales del local ni de Bosco.
  //  - `portada` y `local`: pon aquí las fotos REALES cuando existan.
  //  - `ilustrativas`: imágenes generadas con IA. Por defecto NO se muestran.
  //    Si pones `mostrarIlustrativas: true`, salen con el aviso «Imagen ilustrativa».
  fotos: {
    portada: null, // ej.: { src: 'img/local/bosco-cortando.jpg', webp: '…webp', ancho: 1200, alto: 1500, alt: 'Bosco cortando el pelo a un cliente en el local' }
    local: [],
    mostrarIlustrativas: true,
    ilustrativas: [
      { src: 'img/ilustrativas/degradado-maquinilla.jpg', webp: 'img/ilustrativas/degradado-maquinilla.webp', ancho: 960, alto: 960, alt: '', posicion: '60% 50%' },
      { src: 'img/ilustrativas/afeitado-navaja.jpg', webp: 'img/ilustrativas/afeitado-navaja.webp', ancho: 960, alto: 960, alt: '', posicion: '50% 55%' },
      { src: 'img/ilustrativas/herramientas-barbero.jpg', webp: 'img/ilustrativas/herramientas-barbero.webp', ancho: 800, alto: 800, alt: '', posicion: '50% 50%' },
    ],
  },

  marca: {
    // Cuando exista el logotipo vectorial definitivo, pon aquí sus rutas.
    // Mientras sean null, se usa la composición tipográfica provisional.
    logoCompleto: null,        // ej.: 'marca/bosco-logo.svg'
    logoCompleto_crema: null,  // versión clara para fondos marino
    logoCompacto: null,        // versión de cabecera
    favicon: 'img/favicon.svg',
    appleTouchIcon: 'img/apple-touch-icon.png',
    ogImage: 'img/og-bosco.png',
  },

  sitio: {
    titulo: 'Bosco Peluqueros en Triana | Corte y barba',
    descripcion: 'Peluquería de caballeros en la calle Alfarería, Triana, Sevilla. Descubre Bosco y reserva tu cita.',
    // PENDIENTE: dominio definitivo. Mientras sea null no se añade canonical
    // y la imagen de Open Graph usa una ruta relativa.
    url: null,
    // Enlaces legales existentes (ninguno por ahora). Ej.: { texto: 'Aviso legal', href: 'aviso-legal.html' }
    legales: [],
  },
};
