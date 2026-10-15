"""Reel 9:16 — Residencia legal vs. residencia fiscal (SosaGroup)."""
import math, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS, DUR = 1080, 1920, 30, 36.0
HERE = sys.path[0]
IMG = "/home/user/ClaudeCode/sosagroup/assets/img/"
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE + "/reel.mp4"
ONLY = [float(x) for x in sys.argv[2:]]  # still frames for preview

# brand
BRAND = (138, 36, 84); ACCENT = (200, 107, 152); LIGHT = (242, 193, 216)
INK = (28, 11, 20); WHITE = (255, 255, 255); MUTED = (214, 196, 206)
WARN = (255, 196, 92)

def F(w, s): return ImageFont.truetype(f"{HERE}/Outfit-{w}.ttf", s)
def I(w, s): return ImageFont.truetype(f"/usr/share/fonts/opentype/inter/Inter-{w}.otf", s)

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease(x): x = clamp(x); return 1 - (1 - x) ** 3
def eback(x):
    x = clamp(x); c = 1.70158
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
def prog(t, a, d): return clamp((t - a) / d)

# ---------- background ----------
hero = Image.open(IMG + "hero-paraguay.jpg").convert("RGB")
# crop around the towers, scale to cover the upper part
hero = hero.crop((150, 0, 1150, 505))
BG_H = 1300
bgsrc = hero.resize((int(hero.width * BG_H / hero.height), BG_H), Image.LANCZOS)
bgsrc = bgsrc.filter(ImageFilter.GaussianBlur(3))

grad = Image.new("RGBA", (W, H))
ga = np.zeros((H, W, 4), np.uint8)
ys = np.linspace(0, 1, H)[:, None]
base = np.array(INK, float)
ga[..., :3] = base
alpha = np.clip(0.55 + 0.45 * np.clip((ys - 0.18) / 0.45, 0, 1), 0, 1)
ga[..., 3] = (alpha * 255).astype(np.uint8)
grad = Image.fromarray(ga, "RGBA")
# soft brand glow
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse((-300, 1150, 900, 2250), fill=BRAND + (150,))
gd.ellipse((500, 700, 1500, 1500), fill=BRAND + (70,))
glow = glow.filter(ImageFilter.GaussianBlur(160))

def background(t):
    z = 1.0 + 0.06 * (t / DUR)
    bw, bh = int(bgsrc.width * z), int(bgsrc.height * z)
    b = bgsrc.resize((bw, bh), Image.BILINEAR)
    ox = int((bw - W) / 2 + 60 * math.sin(t / DUR * math.pi))
    b = b.crop((ox, 0, ox + W, bh))
    im = Image.new("RGB", (W, H), INK)
    im.paste(b, (0, 0))
    im = im.convert("RGBA")
    im.alpha_composite(grad)
    im.alpha_composite(glow)
    return im

# gloria avatar (circular)
gl = Image.open(IMG + "gloria-sosa.jpg").convert("RGB").resize((300, 300), Image.LANCZOS)
gmask = Image.new("L", (300, 300), 0); ImageDraw.Draw(gmask).ellipse((6, 6, 294, 294), fill=255)
gl = gl.convert("RGBA"); gl.putalpha(gmask)

# ---------- text helpers ----------
def layer(): return Image.new("RGBA", (W, H), (0, 0, 0, 0))

def paste_alpha(dst, src, a):
    if a <= 0: return
    if a < 1:
        r = np.array(src); r[..., 3] = (r[..., 3] * a).astype(np.uint8); src = Image.fromarray(r)
    dst.alpha_composite(src)

def rich(im, tokens, x0, y0, maxw, font, lh, t, start, step=0.11, align="left", hl_font=None):
    """tokens: list of (word, color, highlight_bg|None). Word-by-word reveal."""
    words = []
    for txt, col, bg in tokens:
        if bg: words.append((txt, col, bg)); continue
        for w_ in txt.split(" "):
            if w_: words.append((w_, col, bg))
    # layout
    lines, cur, cw = [], [], 0
    sp = font.getlength(" ")
    for w_ in words:
        f = hl_font if (w_[2] and hl_font) else font
        wl = f.getlength(w_[0])
        if cur and cw + sp + wl > maxw:
            lines.append((cur, cw)); cur, cw = [], 0
        cw = cw + (sp if cur else 0) + wl; cur.append((w_, wl, f))
    if cur: lines.append((cur, cw))
    i = 0
    for li, (ln, lw) in enumerate(lines):
        x = x0 if align == "left" else x0 + (maxw - lw) / 2
        y = y0 + li * lh
        for (w_, wl, f) in ln:
            p = ease(prog(t, start + i * step, 0.35))
            if p > 0:
                L = layer(); d = ImageDraw.Draw(L)
                dy = (1 - p) * 40
                if w_[2]:
                    pad = 12
                    d.rounded_rectangle((x - pad, y + dy - 4, x + wl + pad, y + dy + lh - 14), 12, fill=w_[2])
                d.text((x, y + dy), w_[0], font=f, fill=w_[1])
                paste_alpha(im, L, p)
            x += wl + sp; i += 1
    return y0 + len(lines) * lh, start + i * step

def pill(im, cx, y, text, font, fg, bg, a=1.0, outline=None):
    L = layer(); d = ImageDraw.Draw(L)
    tw = font.getlength(text); h = font.size + 30
    x0 = cx - tw / 2 - 30
    d.rounded_rectangle((x0, y, x0 + tw + 60, y + h), h // 2, fill=bg, outline=outline, width=3 if outline else 0)
    d.text((cx, y + h / 2), text, font=font, fill=fg, anchor="mm")
    paste_alpha(im, L, a)

def check(d, x, y, s, col, w=8):
    d.line([(x, y + s * .5), (x + s * .38, y + s * .85), (x + s, y + s * .12)], fill=col, width=w, joint="curve")

# ---------- scenes ----------
def chrome(im, t):
    d = ImageDraw.Draw(im)
    # brand mark top-left (below IG safe zone top)
    d.rounded_rectangle((70, 150, 140, 220), 18, fill=BRAND)
    d.text((105, 186), "S", font=F(700, 48), fill=WHITE, anchor="mm")
    d.text((160, 160), "SosaGroup", font=F(700, 40), fill=WHITE)
    d.text((161, 202), "Asesoría en Paraguay", font=I("Medium", 22), fill=MUTED)
    # progress bar
    d.rounded_rectangle((70, 260, W - 70, 266), 3, fill=(255, 255, 255, 50))
    d.rounded_rectangle((70, 260, 70 + (W - 140) * clamp(t / DUR), 266), 3, fill=ACCENT)

def scene_fade(t, a, b, fi=0.35, fo=0.35):
    if t < a or t > b: return 0
    return min(ease((t - a) / fi), ease((b - t) / fo))

def s_hook(im, t):  # 0 - 5
    a = scene_fade(t, 0, 5.0, 0.01, 0.4)
    if not a: return
    L = layer()
    sc = eback(prog(t, 0.0, 0.5))
    if sc > 0:
        fnt = F(800, 44)
        Lp = layer(); dp = ImageDraw.Draw(Lp)
        tw = fnt.getlength("ATENCIÓN"); h = 92
        cx = W / 2; y = 470
        dp.rounded_rectangle((cx - tw / 2 - 80, y, cx + tw / 2 + 40, y + h), h // 2, fill=WARN)
        # warning triangle
        tx = cx - tw / 2 - 50; ty = y + h / 2
        dp.polygon([(tx, ty - 24), (tx + 26, ty + 20), (tx - 26, ty + 20)], fill=INK)
        dp.rectangle((tx - 3, ty - 9, tx + 3, ty + 6), fill=WARN); dp.rectangle((tx - 3, ty + 10, tx + 3, ty + 15), fill=WARN)
        dp.text((cx + 20, y + h / 2), "ATENCIÓN", font=fnt, fill=INK, anchor="mm")
        if t < 0.5:
            Lp = Lp.resize((int(W * sc), int(H * sc)), Image.BILINEAR)
            Z = layer(); Z.alpha_composite(Lp, (int((W - Lp.width) / 2), int((H - Lp.height) / 2 + (1 - sc) * (y - H / 2))))
            Lp = Z
        L.alpha_composite(Lp)
    fb = F(700, 92); fh = F(800, 92)
    y, _ = rich(L, [("Confundir", WHITE, None), ("residencia legal", WHITE, BRAND), ("con", WHITE, None),
                    ("residencia fiscal", INK, LIGHT)],
                90, 640, W - 180, fb, 112, t, 0.45, 0.13, hl_font=fh)
    rich(L, [("te puede costar", WHITE, None), ("muy caro", WARN, None), ("al mudarte a Paraguay.", WHITE, None)],
         90, y + 40, W - 180, F(600, 70), 88, t, 1.6, 0.13)
    paste_alpha(im, L, a)

def s_cedula(im, t):  # 5 - 10.5
    a = scene_fade(t, 5.0, 10.5)
    if not a: return
    L = layer(); d = ImageDraw.Draw(L)
    # cédula card
    p = eback(prog(t, 5.0, 0.6))
    cw, ch = 620, 390
    cx, cy = W / 2, 560
    C = Image.new("RGBA", (cw, ch), (0, 0, 0, 0)); dc = ImageDraw.Draw(C)
    dc.rounded_rectangle((0, 0, cw - 1, ch - 1), 32, fill=(250, 246, 248), outline=LIGHT, width=4)
    dc.rounded_rectangle((0, 0, cw - 1, 84), 32, fill=BRAND); dc.rectangle((0, 50, cw - 1, 84), fill=BRAND)
    dc.text((34, 42), "CÉDULA DE IDENTIDAD · PY", font=F(700, 34), fill=WHITE, anchor="lm")
    dc.rounded_rectangle((34, 118, 194, 318), 18, fill=(226, 214, 221))
    dc.ellipse((79, 148, 149, 218), fill=(190, 170, 182)); dc.pieslice((54, 220, 174, 340), 180, 360, fill=(190, 170, 182))
    for i, wd in enumerate((330, 260, 300, 200)):
        dc.rounded_rectangle((230, 130 + i * 48, 230 + wd, 152 + i * 48), 11, fill=(222, 208, 216))
    dc.text((230, 330), "Residente legal", font=F(700, 38), fill=BRAND, anchor="lm")
    C = C.rotate(-4 * (1 - p) - 3, resample=Image.BICUBIC, expand=True)
    s = max(0.01, p)
    C = C.resize((int(C.width * s), int(C.height * s)), Image.BILINEAR)
    L.alpha_composite(C, (int(cx - C.width / 2), int(cy - C.height / 2)))
    # stamp "≠ residente fiscal"
    ps = eback(prog(t, 7.2, 0.45))
    if ps > 0:
        S = Image.new("RGBA", (720, 120), (0, 0, 0, 0)); ds = ImageDraw.Draw(S)
        ds.rounded_rectangle((4, 4, 716, 116), 22, fill=(28, 11, 20, 200), outline=(239, 68, 68), width=8)
        ds.text((360, 62), "NO ES RESIDENCIA FISCAL", font=F(800, 46), fill=(255, 99, 99), anchor="mm")
        S = S.rotate(8, resample=Image.BICUBIC, expand=True)
        k = 1.6 - 0.6 * ps
        S = S.resize((int(S.width * k), int(S.height * k)), Image.BILINEAR)
        paste_alpha(L, _place(S, cx, cy + 250), clamp(ps * 1.4))
    y, _ = rich(L, [("Tener la", WHITE, None), ("cédula paraguaya", LIGHT, None), ("no te hace", WHITE, None),
                    ("automáticamente", WHITE, None), ("residente fiscal.", INK, LIGHT)],
                90, 1000, W - 180, F(700, 76), 96, t, 5.3, 0.14, hl_font=F(800, 76))
    paste_alpha(im, L, a)

def _place(S, cx, cy):
    Z = layer(); Z.alpha_composite(S, (int(cx - S.width / 2), int(cy - S.height / 2))); return Z

def s_origen(im, t):  # 10.5 - 15
    a = scene_fade(t, 10.5, 15.0)
    if not a: return
    L = layer()
    y, _ = rich(L, [("Y tampoco te exime de tus", WHITE, None), ("obligaciones tributarias", INK, LIGHT),
                    ("en tu país de origen.", WHITE, None)],
                90, 520, W - 180, F(700, 82), 104, t, 10.7, 0.13, hl_font=F(800, 82))
    countries = [("Argentina", "AFIP / ARCA"), ("España", "Agencia Tributaria"), ("Chile", "SII")]
    for i, (c, ag) in enumerate(countries):
        p = ease(prog(t, 12.2 + i * 0.25, 0.45))
        if p <= 0: continue
        C = layer(); dc = ImageDraw.Draw(C)
        yy = y + 70 + i * 150 + (1 - p) * 40
        dc.rounded_rectangle((90, yy, W - 90, yy + 124), 28, fill=(255, 255, 255, 26), outline=(255, 255, 255, 60), width=2)
        dc.ellipse((124, yy + 32, 184, yy + 92), fill=BRAND)
        dc.text((154, yy + 62), c[0], font=F(800, 34), fill=WHITE, anchor="mm")
        dc.text((210, yy + 62), c, font=F(700, 48), fill=WHITE, anchor="lm")
        dc.text((W - 130, yy + 62), ag, font=I("Medium", 32), fill=MUTED, anchor="rm")
        paste_alpha(L, C, p)
    paste_alpha(im, L, a)

def s_compare(im, t):  # 15 - 20.5
    a = scene_fade(t, 15.0, 20.5)
    if not a: return
    L = layer(); d = ImageDraw.Draw(L)
    p0 = ease(prog(t, 15.1, 0.4))
    tl = layer(); ImageDraw.Draw(tl).text((W / 2, 470), "No son lo mismo", font=F(800, 88), fill=WHITE, anchor="mm")
    paste_alpha(L, tl, p0)
    cards = [
        ("RESIDENCIA", "LEGAL", "Es migratoria", ["Dónde podés vivir", "Cédula y radicación", "Trámite de migraciones"], BRAND, WHITE, 15.6),
        ("RESIDENCIA", "FISCAL", "Define tus impuestos", ["Dónde tributás", "Qué país te reclama", "Riesgo de doble imposición"], LIGHT, INK, 16.6),
    ]
    for i, (k1, k2, sub, items, bg, fg, st) in enumerate(cards):
        p = ease(prog(t, st, 0.5))
        if p <= 0: continue
        C = layer(); dc = ImageDraw.Draw(C)
        x0 = 70 + i * 480 + (1 - p) * (-60 if i == 0 else 60)
        y0 = 580
        dc.rounded_rectangle((x0, y0, x0 + 460, y0 + 720), 36, fill=bg)
        dc.text((x0 + 36, y0 + 44), k1, font=F(600, 34), fill=fg)
        dc.text((x0 + 36, y0 + 82), k2, font=F(800, 92), fill=fg)
        dc.line((x0 + 36, y0 + 210, x0 + 140, y0 + 210), fill=fg, width=6)
        dc.multiline_text((x0 + 36, y0 + 240), sub.replace(" tus", "\ntus").replace(" migratoria", "\nmigratoria"),
                          font=F(700, 46), fill=fg, spacing=8)
        for j, it in enumerate(items):
            pj = ease(prog(t, st + 0.5 + j * 0.2, 0.35))
            if pj <= 0: continue
            yy = y0 + 420 + j * 92
            I_ = layer(); di = ImageDraw.Draw(I_)
            di.ellipse((x0 + 36, yy, x0 + 76, yy + 40), fill=fg)
            check(di, x0 + 46, yy + 10, 20, bg, 5)
            di.multiline_text((x0 + 92, yy - 2), it.replace(" de doble", "\nde doble").replace(" te reclama", "\nte reclama").replace(" de migraciones", "\nde migraciones"),
                              font=I("SemiBold", 30), fill=fg, spacing=4)
            paste_alpha(C, I_, pj)
        paste_alpha(L, C, p)
    # vs badge
    pv = eback(prog(t, 16.3, 0.4))
    if pv > 0:
        r = 56 * pv
        d.ellipse((W / 2 - r, 940 - r, W / 2 + r, 940 + r), fill=WARN)
        if pv > .5:
            for oy in (-14, 14): d.line((W / 2 - 26, 940 + oy, W / 2 + 26, 940 + oy), fill=INK, width=9)
            d.line((W / 2 + 14, 940 - 34, W / 2 - 14, 940 + 34), fill=INK, width=9)
    paste_alpha(im, L, a)

def s_sosa(im, t):  # 20.5 - 25.5
    a = scene_fade(t, 20.5, 25.5)
    if not a: return
    L = layer()
    y, _ = rich(L, [("En", WHITE, None), ("SosaGroup", INK, LIGHT), ("analizamos tu", WHITE, None),
                    ("encuadre completo", LIGHT, None)],
                90, 480, W - 180, F(800, 86), 108, t, 20.6, 0.13, hl_font=F(800, 86))
    items = ["Residencia legal en Paraguay", "Residencia fiscal efectiva", "Obligaciones en tu país de origen", "Riesgos patrimoniales"]
    for i, it in enumerate(items):
        p = ease(prog(t, 21.6 + i * 0.3, 0.4))
        if p <= 0: continue
        C = layer(); dc = ImageDraw.Draw(C)
        yy = y + 60 + i * 120; xx = 90 + (1 - p) * -50
        dc.rounded_rectangle((xx, yy, xx + 66, yy + 66), 18, fill=BRAND)
        check(dc, xx + 16, yy + 18, 34, WHITE, 7)
        dc.text((xx + 96, yy + 33), it, font=F(600, 46), fill=WHITE, anchor="lm")
        paste_alpha(L, C, p)
    pt = ease(prog(t, 23.4, 0.5))
    if pt > 0:
        C = layer()
        rich(C, [("para evitar sorpresas con las", MUTED, None), ("agencias tributarias.", WARN, None)],
             90, y + 60 + 4 * 120 + 30, W - 180, I("SemiBold", 44), 60, t, 23.4, 0.07)
        L.alpha_composite(C)
    paste_alpha(im, L, a)

def s_cta(im, t):  # 25.5 - 36
    a = scene_fade(t, 25.5, DUR + 1)
    if not a: return
    L = layer(); d = ImageDraw.Draw(L)
    pg = eback(prog(t, 25.6, 0.6))
    if pg > 0:
        s = int(300 * pg)
        if s > 4:
            ring = layer(); dr = ImageDraw.Draw(ring)
            dr.ellipse((W / 2 - s / 2 - 10, 360 - 10, W / 2 + s / 2 + 10, 360 + s + 10), outline=ACCENT, width=6)
            L.alpha_composite(ring)
            L.alpha_composite(gl.resize((s, s), Image.LANCZOS), (int(W / 2 - s / 2), 360 + int((300 - s) / 2)))
    pn = ease(prog(t, 26.0, 0.4))
    if pn > 0:
        T = layer(); dt = ImageDraw.Draw(T)
        dt.text((W / 2, 715), "Gloria Sosa", font=F(700, 44), fill=WHITE, anchor="mm")
        dt.text((W / 2, 765), "Directora · SosaGroup", font=I("Medium", 30), fill=MUTED, anchor="mm")
        paste_alpha(L, T, pn)
    y, _ = rich(L, [("Evitá", WHITE, None), ("riesgos patrimoniales.", INK, WARN)],
                90, 850, W - 180, F(800, 84), 104, t, 26.4, 0.14, align="center", hl_font=F(800, 84))
    y, _ = rich(L, [("Agendá una", WHITE, None), ("evaluación de encuadre fiscal", LIGHT, None),
                    ("con nuestros especialistas.", WHITE, None)],
                90, y + 30, W - 180, F(600, 58), 74, t, 27.3, 0.1, align="center")
    pb = eback(prog(t, 28.8, 0.5))
    if pb > 0:
        pulse = 1 + 0.035 * math.sin((t - 28.8) * 2 * math.pi / 1.2) if t > 29.3 else 1
        B = Image.new("RGBA", (820, 150), (0, 0, 0, 0)); db = ImageDraw.Draw(B)
        db.rounded_rectangle((0, 0, 819, 149), 75, fill=BRAND, outline=ACCENT, width=4)
        db.text((410, 75), "Agendar evaluación", font=F(700, 54), fill=WHITE, anchor="mm")
        k = pb * pulse
        B = B.resize((max(2, int(820 * k)), max(2, int(150 * k))), Image.BILINEAR)
        L.alpha_composite(B, (int(W / 2 - B.width / 2), int(y + 70 + 75 - B.height / 2)))
        # bouncing arrow
        ay = y + 260 + 18 * abs(math.sin((t - 28.8) * math.pi / 0.7))
        aL = layer(); da = ImageDraw.Draw(aL)
        for k2 in range(2):
            yy = ay + k2 * 34
            da.line([(W / 2 - 34, yy), (W / 2, yy + 30), (W / 2 + 34, yy)], fill=(255, 255, 255, 230 - 90 * k2), width=9, joint="curve")
        paste_alpha(L, aL, clamp(pb))
        d2 = layer(); ImageDraw.Draw(d2).text((W / 2, y + 380), "Tocá el botón de abajo · Formulario en 30 segundos",
                                             font=I("Medium", 30), fill=MUTED, anchor="mm")
        paste_alpha(L, d2, ease(prog(t, 29.5, 0.5)))
    paste_alpha(im, L, a)

SCENES = [s_hook, s_cedula, s_origen, s_compare, s_sosa, s_cta]

def frame(t):
    im = background(t)
    S = layer()
    for s in SCENES: s(S, t)
    im.alpha_composite(S, (0, 90))
    chrome(im, t)
    return im.convert("RGB")

if ONLY:
    for tt in ONLY:
        frame(tt).save(f"{HERE}/prev_{tt:05.1f}.png")
    sys.exit()

ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                       "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                       "-pix_fmt", "yuv420p", HERE + "/video_noaudio.mp4"], stdin=subprocess.PIPE)
N = int(DUR * FPS)
for n in range(N):
    ff.stdin.write(frame(n / FPS).tobytes())
    if n % 150 == 0: print(n, "/", N, flush=True)
ff.stdin.close(); ff.wait()
