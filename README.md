# Bosco Peluqueros · web

Web estática de una sola página para Bosco Peluqueros (Triana, Sevilla).
HTML y CSS, sin framework y sin dependencias. Solo hace falta Node 18 o superior para generarla.

## Cómo se edita
Todos los datos del negocio están en **`config/negocio.mjs`**: dirección, Booksy, WhatsApp, teléfonos, Instagram, horario, servicios y precios, fotos y logos.

1. Edita `config/negocio.mjs`.
2. Ejecuta `npm run build`, que regenera `index.html`.
3. Ejecuta `npm run check` para comprobar que todo está bien.

No edites `index.html` a mano: se sobrescribe en cada build.
Lo que tenga `confirmado: false` o valga `null` no se publica.

## Comandos
| Comando | Qué hace |
|---|---|
| `npm run build` | Genera `index.html` desde la configuración y lista los pendientes. |
| `npm run check` | Build más comprobaciones estáticas: un solo h1, sin `href="#"`, sin el número ficticio, recursos existentes, contraste AA y datos estructurados limpios. |
| `npm run check:visual` | Abre la web con Playwright en 360, 390, 768, 1024 y 1440 px y revisa scroll horizontal, imágenes rotas, objetivos táctiles de 44 px o más, foco con teclado, anclas y barra móvil. Necesita Playwright instalado en el sistema; con una carpeta como argumento guarda capturas. |
| `npm run preview` | Servidor local en http://localhost:4173 |

## Estructura
```
config/negocio.mjs        ← datos del negocio (editar aquí)
scripts/build.mjs         ← genera index.html
scripts/marca.mjs         ← componente de marca (provisional, sustituible)
scripts/check*.{mjs,cjs}  ← comprobaciones
styles.css                ← estilos y tokens de color
fonts/                    ← WOFF2 locales (Roboto Serif 800 y Archivo 400–600, licencia OFL)
img/                      ← favicon, icono iOS, imagen para redes, fotos
marca/anterior/           ← propuesta de marca anterior, archivada
docs/PROMPTS-fotos.md     ← prompts para generar fotos provisionales
```

## Marca
El logotipo actual es una **composición tipográfica provisional**, no un logo final vectorizado:
`BOSCO / — TRIANA — / PELUQUEROS`, en Roboto Serif 800 y Archivo, que se acercan a la referencia pero no la reproducen exactamente.
Cuando exista el SVG definitivo, pon sus rutas en `marca.logoCompleto`, `marca.logoCompleto_crema` y `marca.logoCompacto` dentro de la configuración.
Si cambia la marca, el favicon y las imágenes se regeneran con `scripts/generar-favicon.py` y `scripts/generar-imagenes.cjs`.

Colores (`styles.css`, en `:root`): crema `#F2EBDD`, superficie `#FAF6EF`, marino `#101D33`, rojo teja `#A43B29`, texto secundario `#605D57` y líneas `#D2C9BB`.

## SEO
El build genera `robots.txt`, `sitemap.xml` y `.nojekyll`, más canonical, Open Graph y datos estructurados `HairSalon` con dirección, horario, servicios y precios, y la acción de reservar en Booksy. La sección de preguntas frecuentes se construye con los datos confirmados.

## Pendientes
- [ ] **WhatsApp**: confirmar que el 616 539 412 tiene WhatsApp. Mientras tanto, el botón está oculto.
- [ ] **Teléfonos** (954 089 985 y 616 539 412, sacados de un cartel de Instagram): confirmar que siguen vigentes. Mientras tanto, no se muestran.
- [ ] **Fotos reales** del local, de Bosco trabajando y de detalles. Formatos: portada vertical 4:5 de al menos 1200×1500 y otras 3 cuadradas de al menos 1000×1000. Van en `img/local/` y se declaran en `fotos.portada` y `fotos.local`.
- [ ] **Logo SVG definitivo** (versión completa, versión clara y versión compacta).
- [ ] **Dominio propio** (opcional): ahora `sitio.url` apunta a GitHub Pages. Si se compra uno, cámbialo ahí y en Settings → Pages.
- [ ] **Google Search Console**: verificar la web y enviar `sitemap.xml` (el código va en `sitio.googleVerificacion`).
- [ ] **Servicios** «Corte + barba» y «Rapado» de la maqueta: no aparecen en Booksy, así que no se publican hasta confirmarlos.
- [ ] **Textos legales** (aviso legal y privacidad): no existen y no se han inventado.

Fuentes de los datos publicados: precios de la ficha de Booksy y horario de Google Maps, ambos según capturas del 2 de noviembre de 2026. El código postal 41010 sale de Booksy y solo se usa en los datos estructurados.

Las imágenes de `img/ilustrativas/` están generadas con IA. Están desactivadas (`fotos.mostrarIlustrativas: false`). Si se activan, aparecen con el aviso «Imagen ilustrativa, no corresponde al local».
