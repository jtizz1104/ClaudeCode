"""Synthesizes the soundtrack for the Residencia video (no samples, no copyright).

120 BPM, so one bar = 2 s = 60 video frames at 30 fps. Scene cuts in
src/Residencia fall on bar lines. Layout (bars):
  0-1 hook (impact + riser) · 2-9 four reasons (full groove) · 10 bridge (breakdown)
  11-13 SosaGroup (drop) · 14-18 reviews (warm) · 19-21 call to action (resolve)

Run:  python3 scripts/make-audio.py [classic|v2]
      classic -> src/Residencia/music.mp3, v2 -> src/Residencia/music-v2.mp3

v2 layout (bars): 0-1 hook · 2-9 reasons · 10 bridge · 11-14 SosaGroup ·
15-17 review · 18-21 call to action.
"""
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy import signal

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
BARS = 22
N = int(SR * BAR * BARS)
LAYOUT = sys.argv[1] if len(sys.argv) > 1 else "classic"
assert LAYOUT in ("classic", "v2"), LAYOUT
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR


def buf():
    return np.zeros(N)


def put(track, start_s, sig, gain=1.0):
    i = int(start_s * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    track[i:j] += sig[: j - i] * gain


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def env(n, a=0.002, d=0.2, curve=4.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d * curve / 4)
    return e


def kick():
    n = int(SR * 0.38)
    t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) * 1.0 + 0.25 * np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90)


def clap():
    n = int(SR * 0.28)
    t = np.arange(n) / SR
    noise = bp(rng.standard_normal(n), 1100, 5200)
    e = sum(np.exp(-(t - o) * 55) * (t >= o) for o in (0, 0.011, 0.022)) * 0.5 + np.exp(-t * 14) * (t >= 0.03)
    return noise * e * 0.9


def hat(open_=False):
    n = int(SR * (0.22 if open_ else 0.06))
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000) * np.exp(-t * (18 if open_ else 70)) * 0.5


def shaker():
    n = int(SR * 0.07)
    t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 4500, 11000) * np.exp(-t * 55) * np.minimum(1, t / 0.008) * 0.45


def agogo(f):
    n = int(SR * 0.22)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t)) * np.exp(-t * 22) * 0.3


def saw(freq, n, detune=0.0):
    t = np.arange(n) / SR
    return 2 * ((t * freq * (1 + detune)) % 1) - 1


def bass(freq, dur):
    n = int(SR * dur)
    t = np.arange(n) / SR
    x = lp(saw(freq, n), 520) * 0.55 + np.sin(2 * np.pi * freq * t) * 0.8
    return x * np.minimum(1, t / 0.006) * np.exp(-np.maximum(0, t - dur * 0.55) * 14)


def pluck(freq, dur=0.28):
    n = int(SR * dur)
    t = np.arange(n) / SR
    x = (saw(freq, n) + saw(freq, n, 0.006)) * 0.5
    cutoff = 900 + 5200 * np.exp(-t * 16)
    out = np.zeros(n)
    blk = 256
    for i in range(0, n, blk):
        sos = signal.butter(2, min(cutoff[i], 18000), "low", fs=SR, output="sos")
        out[i : i + blk] = signal.sosfilt(sos, x[i : i + blk])
    return out * np.exp(-t * 11) * np.minimum(1, t / 0.003) * 0.5


def pad(freqs, dur):
    n = int(SR * dur)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for f in freqs:
        for d in (-0.004, 0.0, 0.004):
            x += saw(f, n, d)
    x = lp(x / (len(freqs) * 3), 1800)
    a, r = 0.35, 0.5
    e = np.minimum(1, t / a) * np.minimum(1, (dur - t) / r)
    return x * e


def riser(dur, f0=300, f1=9000):
    n = int(SR * dur)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 512
    for i in range(0, n, blk):
        fc = f0 * (f1 / f0) ** (i / n)
        sos = signal.butter(2, [fc * 0.7, min(fc * 1.4, 20000)], "band", fs=SR, output="sos")
        out[i : i + blk] = signal.sosfilt(sos, noise[i : i + blk])
    return out * (t / dur) ** 2 * 1.4


def whoosh(dur=0.45):
    r = riser(dur, 400, 7000)
    n = len(r)
    t = np.arange(n) / SR
    return r * np.sin(np.pi * np.minimum(1, t / dur) ** 1.4) * 0.7


def impact():
    n = int(SR * 1.6)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (36 + 90 * np.exp(-t * 9)) * t) * np.exp(-t * 2.8)
    crack = lp(rng.standard_normal(n), 6000) * np.exp(-t * 18) * 0.7
    tail = lp(rng.standard_normal(n), 900) * np.exp(-t * 3.0) * 0.18
    return boom * 1.1 + crack + tail


def ding(freq=1318.5):
    n = int(SR * 0.9)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.01 * t)) * np.exp(-t * 4.5) * 0.28


def pop():
    n = int(SR * 0.12)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * (500 + 700 * np.exp(-t * 40)) * t) * np.exp(-t * 36) * 0.5


# Note frequencies (A minor: Am F C G)
def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


CHORDS = [  # (bass root midi, chord tones midi)
    (33, [57, 60, 64]),  # Am
    (29, [57, 60, 65]),  # F
    (36, [55, 60, 64]),  # C
    (31, [55, 59, 62]),  # G
]


def chord_at(bar):
    return CHORDS[bar % 4]


drums, bassl, music, fx = buf(), buf(), buf(), buf()

# ---- scene map (bars) -------------------------------------------------------
if LAYOUT == "classic":
    GROOVE = set(range(2, 10)) | set(range(11, 14))   # kick/clap/hats + bass
    SOFT = set(range(14, 19))                          # reviews: lighter
    CUTS = [2, 4, 6, 8, 10, 11, 14, 19]
    REVIEW_BARS = (14, 15, 16, 17, 18)
else:
    GROOVE = set(range(2, 10)) | set(range(11, 15))
    SOFT = set(range(15, 21))                          # review + closing: lighter
    CUTS = [2, 4, 6, 8, 10, 11, 15, 18]
    REVIEW_BARS = (15,)
for bar in range(BARS):
    t0 = bar * BAR
    root, tones = chord_at(bar)
    full = bar in GROOVE
    soft = bar in SOFT
    for beat in range(4):
        tb = t0 + beat * BEAT
        if full or soft:
            if full or beat in (0, 2):
                put(drums, tb, kick(), 1.0 if full else 0.6)
            if beat in (1, 3):
                put(drums, tb, clap(), 0.8 if full else 0.35)
        # 8ths / 16ths percussion
        for sub in range(4):
            ts = tb + sub * BEAT / 4
            if full:
                if sub == 2:
                    put(drums, ts, hat(open_=(beat == 3)), 0.8)
                if (beat * 4 + sub) % 8 in (0, 3, 6):  # samba-ish 3-3-2 shaker accents
                    put(drums, ts, shaker(), 1.0)
                elif sub % 2 == 1:
                    put(drums, ts, shaker(), 0.45)
            elif soft and sub in (0, 2):
                put(drums, ts, shaker(), 0.5)
        if full and bar in (4, 5, 8, 9, 11, 12, 13) and beat in (1, 3):
            put(drums, tb + BEAT * 0.75, agogo(midi(81) if beat == 1 else midi(77)), 0.7)

    # bass: root on 1, off-beat pushes
    if full or soft:
        pattern = [(0, 0.9), (1.5, 0.35), (2.5, 0.35), (3.25, 0.6)] if full else [(0, 1.8), (2, 1.8)]
        for off, dur in pattern:
            put(bassl, t0 + off * BEAT, bass(midi(root + (12 if off == 3.25 else 0)), dur * BEAT), 0.9 if full else 0.65)

    # pad on everything except the first bar
    if bar >= 1 and bar != 21:
        put(music, t0, pad([midi(n - 12) for n in tones], BAR + 0.15), 0.55 if full else 0.8)

    # arpeggio plucks (16ths) in groove + reviews
    if full or soft:
        order = [0, 1, 2, 1] if full else [0, 2, 1, 2]
        step = BEAT / 4 if full else BEAT / 2
        count = 16 if full else 8
        for k in range(count):
            n = tones[order[k % 4]] + (12 if (k // 4) % 2 else 0)
            put(music, t0 + k * step, pluck(midi(n + 12)), 0.55 if full else 0.4)

# resolve: long final chord, soft
for bar in (19, 20):
    pass
root, tones = CHORDS[0]
put(music, 21 * BAR, pad([midi(n - 12) for n in (57, 60, 64, 69)], BAR + 0.0), 0.9)
put(bassl, 21 * BAR, bass(midi(33), BAR * 0.9), 0.8)
put(fx, 21 * BAR, ding(880), 0.9)

# ---- fx: impacts, risers, whooshes ------------------------------------------
put(fx, 0.0, impact(), 1.0)                      # hook hit
put(fx, 0.9, hat(True), 0.5)
for k in range(8):                               # ticking build in the hook
    put(fx, 1.0 + k * 0.125, hat(), 0.5 + 0.06 * k)
put(fx, BAR * 2 - 2.0, riser(2.0), 0.55)         # riser into first reason
put(fx, BAR * 10 - 0.0, riser(BAR, 500, 12000), 0.5)  # bridge riser
put(fx, BAR * 11, impact(), 0.8)                 # drop on SosaGroup
put(fx, BAR * REVIEW_BARS[0], ding(1568), 0.8)      # reviews start

for c in CUTS:
    put(fx, c * BAR - 0.38, whoosh(), 0.55)
for c in REVIEW_BARS:                            # review swaps + pop
    put(fx, c * BAR, pop(), 0.8)
for i in range(5):
    put(fx, BAR * REVIEW_BARS[0] + 0.2 + i * 0.1, ding(1046.5 * (1 + i * 0.12)), 0.35)
for c in range(2, 10, 2):                        # number badges pop
    put(fx, c * BAR + 0.12, pop(), 0.9)
put(fx, BAR * 11 + 0.5, pop(), 0.9)

# ---- mix --------------------------------------------------------------------
# sidechain-style ducking of bass/music on kicks
duck = np.ones(N)
for bar in range(BARS):
    if bar in GROOVE or bar in SOFT:
        for beat in range(4):
            if bar in GROOVE or beat in (0, 2):
                i = int((bar * BAR + beat * BEAT) * SR)
                n = int(SR * 0.22)
                seg = 1 - 0.55 * np.exp(-np.arange(n) / SR / 0.07)
                j = min(N, i + n)
                duck[i:j] = np.minimum(duck[i:j], seg[: j - i])

mix = drums * 0.95 + bassl * 0.9 * duck + music * 0.55 * (0.45 + 0.55 * duck) + fx * 0.85
mix = hp(mix, 28)
# fade in/out
fi = int(SR * 0.01)
mix[:fi] *= np.linspace(0, 1, fi)
fo = int(SR * 2.6)
mix[-fo:] *= np.linspace(1, 0, fo) ** 1.5
# soft limiter + normalize to about -1 dBFS
mix = np.tanh(mix * 0.9)
mix = mix / np.max(np.abs(mix)) * 0.89

# light stereo widening
left = mix + 0.12 * np.roll(mix, int(SR * 0.012))
right = mix + 0.12 * np.roll(mix, -int(SR * 0.012))
stereo = np.stack([left, right], axis=1)
stereo = stereo / np.max(np.abs(stereo)) * 0.89

out_dir = Path(__file__).resolve().parent.parent / "src" / "Residencia"
out_dir.mkdir(parents=True, exist_ok=True)
wav = out_dir / "music.wav"
pcm = (stereo * 32767).astype("<i2")
import wave

with wave.open(str(wav), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
mp3 = out_dir / ("music.mp3" if LAYOUT == "classic" else "music-v2.mp3")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "192k", str(mp3)], check=True)
wav.unlink()
print("wrote", mp3, f"{N / SR:.1f}s", file=sys.stderr)
