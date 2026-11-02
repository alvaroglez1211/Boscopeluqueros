import math, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
F = os.path.dirname(__file__) + '/fonts/'  # descarga Archivo (Extra Condensed 800, 500; Normal 500, 600) de Google Fonts aquí
OUT = '/home/user/Boscopeluqueros/marca/'
INK, PAPER, RED, BLUE = '#1b1916', '#efe9df', '#b3322a', '#24407a'
_c = {}
def font(n):
    if n not in _c: _c[n] = TTFont(F + n)
    return _c[n]

def glyph(fnt, ch, size, x, y, rot=0, cx=0):
    """path of one glyph; baseline at (x,y); optional rotation around (x+cx, y)"""
    f = font(fnt); gs = f.getGlyphSet(); cmap = f.getBestCmap()
    g = cmap[ord(ch)]; s = size / f['head'].unitsPerEm
    pen = SVGPathPen(gs)
    a = math.radians(rot); ca, sa = math.cos(a), math.sin(a)
    # local: (u,v) font units -> (u*s - cx, -v*s) then rotate, then translate (x+cx, y)
    t = (s*ca, s*sa, s*sa, -s*ca, x + cx - cx*ca, y - cx*sa)
    t = (s*ca, s*sa, s*sa, -s*ca, x + cx + (-cx)*ca, y + (-cx)*sa)
    gs[g].draw(TransformPen(pen, t))
    return pen.getCommands(), f['hmtx'][g][0] * s

def adv(fnt, ch, size):
    f = font(fnt); return f['hmtx'][f.getBestCmap()[ord(ch)]][0] * size / f['head'].unitsPerEm

def width(fnt, txt, size, ls=0):
    return sum(adv(fnt, c, size) for c in txt) + ls * (len(txt) - 1)

def text(fnt, txt, size, x, y, ls=0, anchor='start'):
    if anchor == 'middle': x -= width(fnt, txt, size, ls) / 2
    if anchor == 'end': x -= width(fnt, txt, size, ls)
    d = []
    for c in txt:
        if c != ' ':
            p, _ = glyph(fnt, c, size, x, y); d.append(p)
        x += adv(fnt, c, size) + ls
    return ' '.join(d)

def circle_text(fnt, txt, size, cx, cy, r, ls=0, start=-90):
    """text around circle clockwise, centered at angle `start` (deg, -90 = top)"""
    total = width(fnt, txt, size, ls); ang = start - math.degrees(total / r) / 2
    d = []
    for c in txt:
        w = adv(fnt, c, size); mid = ang + math.degrees((w / 2) / r)
        a = math.radians(mid)
        px, py = cx + r * math.cos(a), cy + r * math.sin(a)
        if c != ' ':
            # glyph centered on px, baseline tangent, rotated mid+90
            p, _ = glyph(fnt, c, size, px - w / 2, py, rot=mid + 90, cx=w / 2)
            d.append(p)
        ang += math.degrees((w + ls) / r)
    return ' '.join(d)

def pole(x, y, w, h, uid, cap=INK, outline=None):
    """barber pole: caps + striped body. x,y top-left"""
    ch = w * 0.32; bw = w * 0.72; bx = x + (w - bw) / 2
    sw = bw * 0.32
    o = f'''<defs><clipPath id="c{uid}"><rect x="{bx:.2f}" y="{y+ch:.2f}" width="{bw:.2f}" height="{h-2*ch:.2f}"/></clipPath>
<pattern id="p{uid}" width="{sw*3:.2f}" height="{sw*3:.2f}" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
<rect width="{sw*3:.2f}" height="{sw*3:.2f}" fill="{PAPER}"/><rect width="{sw:.2f}" height="{sw*3:.2f}" fill="{RED}"/><rect x="{sw*1.5:.2f}" width="{sw:.2f}" height="{sw*3:.2f}" fill="{BLUE}"/></pattern></defs>
<rect x="{bx:.2f}" y="{y+ch:.2f}" width="{bw:.2f}" height="{h-2*ch:.2f}" fill="url(#p{uid})"/>'''
    if outline: o += f'<rect x="{bx:.2f}" y="{y+ch:.2f}" width="{bw:.2f}" height="{h-2*ch:.2f}" fill="none" stroke="{outline}" stroke-width="{w*0.05:.2f}"/>'
    o += f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{ch:.2f}" rx="{ch*0.35:.2f}" fill="{cap}"/>'
    o += f'<rect x="{x:.2f}" y="{y+h-ch:.2f}" width="{w:.2f}" height="{ch:.2f}" rx="{ch*0.35:.2f}" fill="{cap}"/>'
    return o

def svg(w, h, body, bg=None):
    b = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}">{b}{body}</svg>\n'

def save(name, s):
    open(OUT + name, 'w').write(s)

# ---------- 1. logotipo: BOSCO + pole-apostrophe + S, "peluqueros · triana" below ----------
def wordmark(fg, bg, uid, tagline=True):
    S = 200; capH = S * 0.71  # approx cap height for Archivo
    x0, base = 0, capH
    bosco = text('cond-800.ttf', 'BOSCO', S, x0, base, ls=-2)
    wb = width('cond-800.ttf', 'BOSCO', S, -2)
    pw = S * 0.16; ph = capH * 0.48; px = wb + S * 0.035
    sx = px + pw + S * 0.035
    s_ = text('cond-800.ttf', 'S', S, sx, base)
    W = sx + adv('cond-800.ttf', 'S', S)
    body = f'<path d="{bosco} {s_}" fill="{fg}"/>' + pole(px, 0, pw, ph, uid, cap=fg, outline=None if fg == INK else None)
    H = capH
    if tagline:
        ty = capH + 58
        body += f'<rect x="0" y="{capH+18:.1f}" width="{W:.1f}" height="3" fill="{fg}"/>'
        body += f'<path d="{text("norm-600.ttf", "PELUQUEROS", 30, 0, ty, ls=7.5)}" fill="{fg}"/>'
        body += f'<path d="{text("norm-500.ttf", "TRIANA · SEVILLA", 30, W, ty, ls=4, anchor="end")}" fill="{fg}"/>'
        H = ty + 6
    pad = 40
    return svg(W + 2*pad, H + 2*pad, f'<g transform="translate({pad} {pad})">{body}</g>', bg), W + 2*pad, H + 2*pad

for name, fg, bg in [('logo.svg', INK, None), ('logo-papel.svg', INK, PAPER), ('logo-negativo.svg', PAPER, INK)]:
    s, *_ = wordmark(fg, bg, name[:-4]); save(name, s)

# ---------- 2. sello circular ----------
def seal(fg, bgc, uid):
    W = 600; c = 300
    body = f'<circle cx="{c}" cy="{c}" r="296" fill="{bgc}"/>'
    body += f'<circle cx="{c}" cy="{c}" r="272" fill="none" stroke="{fg}" stroke-width="3"/>'
    body += f'<circle cx="{c}" cy="{c}" r="186" fill="none" stroke="{fg}" stroke-width="3"/>'
    body += f'<path d="{circle_text("cond-800.ttf", "BOSCO’S PELUQUEROS", 58, c, c, 210, ls=6, start=-90)}" fill="{fg}"/>' if False else ''
    top = circle_text('cond-800.ttf', "BOSCO'S PELUQUEROS", 46, c, c, 212, ls=6, start=-90)
    body += f'<path d="{top}" fill="{fg}"/>'
    # bottom text: reversed reading direction (counter-clockwise) -> draw on mirrored circle
    bot = bottom_text('norm-600.ttf', 'TRIANA · SEVILLA', 30, c, c, 232, ls=8)
    body += f'<path d="{bot}" fill="{fg}"/>'
    # stars/dots separating
    for a in (180, 0):
        x = c + 228 * math.cos(math.radians(a)); y = c + 228 * math.sin(math.radians(a))
        body += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="7" fill="{RED}"/>'
    # center: B + pole
    S = 240; capH = S * 0.71; bw = adv('cond-800.ttf', 'B', S); pw = S * 0.16; gap = S * 0.035
    tot = bw + gap + pw; bx = c - tot / 2; base = c + capH / 2
    body += f'<path d="{text("cond-800.ttf", "B", S, bx, base)}" fill="{fg}"/>'
    body += pole(bx + bw + gap, base - capH, pw, capH * 0.48, uid, cap=fg)
    return svg(W, W, body)

def bottom_text(fnt, txt, size, cx, cy, r, ls=0):
    """text along bottom of circle, readable left-to-right (counter-clockwise), baseline outside->inside"""
    total = width(fnt, txt, size, ls); ang = 90 + math.degrees(total / r) / 2
    d = []
    capH = size * 0.71
    for ch in txt:
        w = adv(fnt, ch, size); mid = ang - math.degrees((w / 2) / r)
        a = math.radians(mid)
        rr = r - capH  # baseline radius so caps sit between r-capH..r
        px, py = cx + (r) * math.cos(a), cy + (r) * math.sin(a)
        if ch != ' ':
            p, _ = glyph(fnt, ch, size, px - w / 2, py, rot=mid - 90, cx=w / 2)
            d.append(p)
        ang -= math.degrees((w + ls) / r)
    return ' '.join(d)

save('sello.svg', seal(PAPER, INK, 's1'))
save('sello-papel.svg', seal(INK, PAPER, 's2'))

# ---------- 3. icono (perfil Instagram / favicon) ----------
def icon(uid, size=1080):
    c = size / 2
    body = f'<rect width="{size}" height="{size}" fill="{INK}"/>'
    S = 620; capH = S * 0.71; bw = adv('cond-800.ttf', 'B', S); pw = S * 0.16; gap = S * 0.035
    tot = bw + gap + pw; bx = c - tot / 2; base = c + capH / 2
    body += f'<path d="{text("cond-800.ttf", "B", S, bx, base)}" fill="{PAPER}"/>'
    body += pole(bx + bw + gap, base - capH, pw, capH * 0.48, uid, cap=PAPER)
    return svg(size, size, body)
save('icono.svg', icon('i1'))

# favicon (simplified pole on ink)
fav = f'<rect width="64" height="64" rx="12" fill="{INK}"/>' + pole(24, 9, 16, 46, 'f', cap=PAPER)
open('/home/user/Boscopeluqueros/img/favicon.svg', 'w').write(svg(64, 64, fav))
print('ok')

for name, fg in [('logo-simple.svg', INK), ('logo-simple-negativo.svg', PAPER)]:
    s, *_ = wordmark(fg, None, name[:-4], tagline=False); save(name, s.replace('translate(40 40)', 'translate(0 0)').replace(s[s.find('viewBox="'):s.find('" width')], 'viewBox="0 0 %.0f %.0f' % (_w(fg) if False else 0, 0)) if False else s)
