# Bosco Peluqueros — web

Web estática (HTML + CSS, sin dependencias). Abre `index.html` en el navegador para verla.

## Qué hay que rellenar
Busca `EDITAR` en `index.html`:

- `34600000000` → número de WhatsApp con prefijo 34, sin espacios (y el `600 00 00 00` visible)
- Horario (los precios ya están copiados de Booksy)
- Fotos: guarda `img/foto-local.jpg`, `img/foto-corte.jpg` y `img/foto-barba.jpg`. Aparecen solas; si falta alguna, se ve el hueco rayado.
- Logo: está redibujado en vectorial dentro de `index.html` (`<symbol id="badge">`) y es provisional.

## Prompts para fotos provisionales con IA
Pide formato horizontal 3:2 para el local y cuadrado para las otras dos.

1. **foto-local.jpg**: "Interior of a small traditional men's barbershop in Seville, Spain, one vintage barber chair, mirror, warm afternoon light through the window, tiled wall, documentary photo, 35mm film look, no people, no text"
2. **foto-corte.jpg**: "Close-up of a barber doing a skin fade haircut with clippers, back of the client's head, shallow depth of field, natural light, 35mm film look, no faces, no text"
3. **foto-barba.jpg**: "Close-up of a barber shaping a beard with a straight razor, hot towel, warm tones, 35mm film look, face cropped out, no text"

Consejo: pide "film look" y "no text"; las fotos de IA demasiado limpias y brillantes son las que más cantan.

## Publicar gratis
GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.
