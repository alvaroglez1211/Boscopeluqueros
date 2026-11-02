"""Genera img/favicon.svg: una B (Archivo estrecha 800) en papel sobre tinta, en trazos.
Uso (solo si cambia la marca): python3 scripts/generar-favicon.py  (requiere fonttools y brotli)"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

raiz = Path(__file__).resolve().parent.parent
f = TTFont(raiz / 'fonts/archivo-condensed-800.woff2')
gs = f.getGlyphSet(); g = f.getBestCmap()[ord('B')]
bp = BoundsPen(gs); gs[g].draw(bp); x0, y0, x1, y1 = bp.bounds
size, alto = 64, 44  # lienzo y altura de la letra
s = alto / (y1 - y0)
dx = (size - (x1 - x0) * s) / 2 - x0 * s
dy = (size + alto) / 2 + y0 * s
pen = SVGPathPen(gs); gs[g].draw(TransformPen(pen, (s, 0, 0, -s, dx, dy)))
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">'
       f'<rect width="{size}" height="{size}" fill="#1b1916"/>'
       f'<path d="{pen.getCommands()}" fill="#efe9df"/></svg>\n')
(raiz / 'img/favicon.svg').write_text(svg)
print('img/favicon.svg')
