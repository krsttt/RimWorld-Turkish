"""Retime a reel to its voice lines (segments may skip parts of the animation), write KN/DUR, build SFX.

usage: python build2.py r1|d
"""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf

S = '/tmp/claude-0/-home-user-RimWorld-Turkish/db99d8a9-580e-542a-b548-df16cc4ac28f/scratchpad'
REELS = f'{S}/reels'
SR = 48000
WHICH = sys.argv[1]

CFG = {
 'r1': dict(src=f'{S}/ahenk/out', js='reel1.js',
   segs=[('r1_0', 0, 3.2), ('r1_1', 3.2, 5.5), ('r1_3', 9, 13), ('r1_4', 13, 16.5), ('r1_5', 16.5, 18.3),
         ('r1_6', 18.3, 20), ('r1_7', 20, 23), ('r1_8', 23, 25.5)],
   minl={'r1_8': 3.6},
   ev=[('w', o) for o in (9, 13, 16.5, 20, 23)] + [('p', 0.05), ('p', 3.2), ('p', 9.3), ('p', 10.3), ('p', 11.3),
       ('t', 13.8), ('t', 14.25), ('t', 14.7), ('p', 15.3), ('p', 20.5), ('p', 20.8), ('p', 23.1), ('p', 23.8), ('d', 24.4)]),
 'r2': dict(src=f'{S}/ahenk/out', js='reel2.js',
   segs=[(f'r2_{i}', a, b) for i, (a, b) in enumerate([(0, 3), (3, 6), (6, 9.5), (9.5, 13), (13, 15.5), (15.5, 19), (19, 23.5),
                                                      (23.5, 26.5), (26.5, 28.5), (28.5, 31), (31, 34)])],
   minl={'r2_6': 4.3, 'r2_10': 3.4},
   ev=[('w', o) for o in (3, 6, 9.5, 13, 15.5, 19, 23.5, 26.5, 28.5, 31)] + [('p', 0.05), ('p', 3.1), ('d', 14.2), ('p', 23.8), ('d', 24.4),
       ('t', 26.6), ('t', 26.8), ('t', 27.0), ('t', 27.2), ('p', 28.6), ('d', 31.8)] + [('t', 19.8 + i) for i in range(3)]),
 't': dict(src=f'{S}/clone/reel_t', js='reel_t.js',
   segs=[(f't_{i}', a, b) for i, (a, b) in enumerate([(0, 4), (4, 8), (8, 12.5), (12.5, 15.5), (15.5, 20), (20, 24), (24, 27), (27, 33), (33, 37), (37, 40)])],
   minl={'t_2': 3.8, 't_4': 4.0, 't_7': 5.0, 't_9': 3.4},
   ev=[('w', o) for o in (4, 8, 12.5, 15.5, 20, 24, 27, 33, 37)] + [('p', .05), ('p', 8.4), ('p', 9.2), ('p', 10.0), ('p', 12.7), ('p', 12.9), ('p', 13.1), ('d', 17.6), ('d', 21.8), ('p', 25.2), ('d', 25.8), ('t', 28.2), ('t', 30.2), ('p', 33.2), ('p', 37.6), ('d', 38.4)]),
 'k': dict(src=f'{S}/clone/reel_k', js='reel_k.js',
   segs=[(f'k_{i}', a, b) for i, (a, b) in enumerate([(0, 4), (4, 8), (8, 12.5), (12.5, 15.5), (15.5, 20), (20, 24), (24, 27), (27, 33), (33, 37), (37, 40)])],
   minl={'k_2': 3.8, 'k_4': 4.0, 'k_7': 5.0, 'k_9': 3.4},
   ev=[('w', o) for o in (4, 8, 12.5, 15.5, 20, 24, 27, 33, 37)] + [('p', .05), ('p', 8.4), ('p', 9.2), ('p', 10.0), ('p', 12.7), ('p', 12.9), ('p', 13.1), ('d', 18.0), ('d', 21.8), ('p', 24.6), ('d', 25.6), ('t', 27.4), ('p', 30.4), ('p', 33.2), ('p', 37.6), ('d', 38.4)]),
 's': dict(src=f'{S}/clone/reel_s', js='reel_s.js',
   segs=[(f's_{i}', a, b) for i, (a, b) in enumerate([(0, 4), (4, 8), (8, 12.5), (12.5, 15.5), (15.5, 20), (20, 24), (24, 27), (27, 33), (33, 37), (37, 40)])],
   minl={'s_2': 3.8, 's_4': 4.0, 's_7': 5.0, 's_9': 3.4},
   ev=[('w', o) for o in (4, 8, 12.5, 15.5, 20, 24, 27, 33, 37)] + [('p', .05), ('p', 8.4), ('p', 9.2), ('p', 10.0), ('p', 12.7), ('p', 12.9), ('p', 13.1), ('d', 18.0), ('p', 21.2), ('d', 22.2), ('d', 25.2), ('p', 27.8), ('p', 33.2), ('p', 37.6), ('d', 38.4)]),
 'h': dict(src=f'{S}/clone/reel_h', js='reel_h.js',
   segs=[(f'h_{i}', a, b) for i, (a, b) in enumerate([(0, 4), (4, 8), (8, 12.5), (12.5, 15.5), (15.5, 20), (20, 24), (24, 27), (27, 33), (33, 37), (37, 40)])],
   minl={'h_2': 3.8, 'h_4': 4.0, 'h_7': 5.0, 'h_9': 3.4},
   ev=[('w', o) for o in (4, 8, 12.5, 15.5, 20, 24, 27, 33, 37)] + [('p', .05), ('p', 8.4), ('p', 9.2), ('p', 10.0), ('p', 12.7), ('p', 12.9), ('p', 13.1), ('d', 18.0), ('p', 21.0), ('d', 21.8), ('p', 24.6), ('d', 25.6), ('p', 27.8), ('p', 33.2), ('p', 37.6), ('d', 38.4)]),
 'm': dict(src=f'{S}/clone/reel_m', js='reel_m.js',
   segs=[(f'm_{i}', a, b) for i, (a, b) in enumerate([(0, 4), (4, 8), (8, 12.5), (12.5, 15.5), (15.5, 20), (20, 24), (24, 27), (27, 33), (33, 37), (37, 40)])],
   minl={'m_2': 3.8, 'm_4': 4.0, 'm_7': 5.0, 'm_9': 3.4},
   ev=[('w', o) for o in (4, 8, 12.5, 15.5, 20, 24, 27, 33, 37)] + [('p', .05), ('p', 4.8), ('p', 8.4), ('p', 9.2), ('p', 10.0), ('p', 12.7), ('p', 12.9), ('p', 13.1), ('p', 17.4), ('d', 18.0), ('p', 21.4), ('d', 22.2), ('p', 24.4), ('d', 25.2), ('p', 27.4), ('p', 33.2), ('p', 37.6), ('d', 38.4)]),
 'a1': dict(src=f'{S}/clone/reel_a1', js='reel_a1.js',
   segs=[(f'a1_{i}', a, b) for i, (a, b) in enumerate([(0, 4), (4, 8), (8, 12.5), (12.5, 15.5), (15.5, 20), (20, 24), (24, 27), (27, 33), (33, 37), (37, 40)])],
   minl={'a1_2': 3.8, 'a1_4': 4.0, 'a1_7': 5.0, 'a1_9': 3.4},
   ev=[('w', o) for o in (4, 8, 12.5, 15.5, 20, 24, 27, 33, 37)] + [('p', .05), ('p', 8.4), ('p', 9.2), ('p', 10.0), ('p', 12.7), ('p', 12.9), ('p', 13.1), ('p', 17.2), ('d', 17.8), ('p', 21.4), ('d', 21.8), ('p', 24.6), ('d', 25.4), ('p', 27.4), ('p', 33.2), ('p', 37.6), ('d', 38.4)]),
 'a2': dict(src=f'{S}/clone/reel_a2', js='reel_a2.js',
   segs=[(f'a2_{i}', a, b) for i, (a, b) in enumerate([(0, 4), (4, 8), (8, 12.5), (12.5, 15.5), (15.5, 20), (20, 24), (24, 27), (27, 33), (33, 37), (37, 40)])],
   minl={'a2_2': 3.8, 'a2_4': 4.0, 'a2_7': 5.0, 'a2_9': 3.4},
   ev=[('w', o) for o in (4, 8, 12.5, 15.5, 20, 24, 27, 33, 37)] + [('p', .05), ('p', 8.4), ('p', 9.2), ('p', 10.0), ('p', 12.7), ('p', 12.9), ('p', 13.1), ('p', 16.4), ('p', 18.4), ('d', 18.8), ('p', 20.6), ('d', 22.4), ('p', 24.6), ('d', 25.4), ('p', 27.6), ('p', 33.2), ('p', 37.6), ('d', 38.4)]),
 'a3': dict(src=f'{S}/clone/reel_a3', js='reel_a3.js',
   segs=[(f'a3_{i}', a, b) for i, (a, b) in enumerate([(0, 4), (4, 8), (8, 12.5), (12.5, 15.5), (15.5, 20), (20, 24), (24, 27), (27, 33), (33, 37), (37, 40)])],
   minl={'a3_2': 3.8, 'a3_4': 4.0, 'a3_7': 5.0, 'a3_9': 3.4},
   ev=[('w', o) for o in (4, 8, 12.5, 15.5, 20, 24, 27, 33, 37)] + [('p', .05), ('p', 4.4), ('p', 5.4), ('p', 8.6), ('p', 9.6), ('p', 12.7), ('p', 12.9), ('p', 13.1), ('p', 16.6), ('d', 17.6), ('p', 21.6), ('d', 22.0), ('p', 24.6), ('d', 25.4), ('p', 27.4), ('p', 33.2), ('p', 37.6), ('d', 38.4)]),
 'd': dict(src=f'{S}/ahenk/out_dis', js='reel3.js',
   segs=[(f'd_{i}', a, b) for i, (a, b) in enumerate([(0, 4), (4, 8), (8, 12.5), (12.5, 15.5), (15.5, 20), (20, 24),
                                                     (24, 27), (27, 33), (33, 37), (37, 40)])],
   minl={'d_2': 3.8, 'd_4': 4.0, 'd_7': 5.0, 'd_9': 3.4},
   ev=[('w', o) for o in (4, 8, 12.5, 15.5, 20, 24, 27, 33, 37)] + [('p', 0.05), ('p', 8.4), ('p', 9.2), ('p', 10.0),
       ('p', 12.7), ('p', 12.9), ('p', 13.1), ('d', 17.6), ('d', 21.6), ('t', 27.6), ('t', 29.6), ('t', 31.6), ('p', 33.2), ('d', 37.8)]),
}[WHICH]
if os.environ.get('SRC'): CFG['src'] = os.environ['SRC']

def lufs(path):
    o = subprocess.run(['ffmpeg', '-nostdin', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1])

NORM = CFG['src'] + f'_norm_{WHICH}'; os.makedirs(NORM, exist_ok=True)
dur = {}
for k, _, _ in CFG['segs']:
    src = f"{CFG['src']}/{k}.wav"; gain = -16.0 - lufs(src)
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', src, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.95:level=disabled',
                    '-ar', str(SR), f'{NORM}/{k}.wav'], check=True)
    x, _ = sf.read(f'{NORM}/{k}.wav'); dur[k] = len(x) / SR

kn, starts, R = [], [], 0.0
segmap = []  # (orig_a, orig_b, real_a, real_b)
for idx, (k, a, b) in enumerate(CFG['segs']):
    d = dur[k]; L = max(min(b - a, d + 0.55), d + 0.3, CFG['minl'].get(k, 0))
    if idx == len(CFG['segs']) - 1: L = max(L, d + 0.9)
    if not kn: kn.append([0.0, a])
    elif kn[-1][1] != a: kn.append([round(R + 0.001, 3), a])
    starts.append(R + 0.08); segmap.append((a, b, R, R + L)); R += L; kn.append([round(R, 3), b])
DUR = round(R, 2)

def to_real(o):
    for a, b, ra, rb in segmap:
        if a <= o <= b: return ra + (o - a) / (b - a) * (rb - ra)
    return None

js = f"{REELS}/{CFG['js']}"
s = open(js).read()
s = re.sub(r'const DUR = [\d.]+;', f'const DUR = {DUR};', s, count=1)
s = re.sub(r'const KN = \[.*?\];', 'const KN = ' + json.dumps(kn) + ';', s, count=1)
open(js, 'w').write(s)

rng = np.random.default_rng(7)
def whoosh(d=.5):
    n = int(d * SR); t = np.arange(n) / SR; x = rng.standard_normal(n); out = np.zeros(n)
    fc = 400 * (3000 / 400) ** (t / d)
    for lo, hi in ((1, 3), (3, 9), (9, 27)):
        k = np.convolve(x, np.ones(lo) / lo, 'same') - np.convolve(x, np.ones(hi) / hi, 'same')
        out += k * np.exp(-((np.log(fc) - np.log(SR / (2.2 * hi))) ** 2) / 1.2)
    out *= np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2; return out / np.abs(out).max()
def pop(f0=520, f1=980, d=.12):
    t = np.arange(int(d * SR)) / SR; f = f0 + (f1 - f0) * (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 34) * np.minimum(1, t * 400)
def tick(f=1700, d=.05):
    t = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * f * t) * np.exp(-t * 90) * np.minimum(1, t * 800)
def ding(d=.6):
    t = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * 1318 * t) + .5 * np.sin(2 * np.pi * 1975 * t)) * np.exp(-t * 7) * np.minimum(1, t * 600) / 1.5
GAIN = {'w': .10, 'p': .16, 't': .12, 'd': .10}; SND = {'w': whoosh, 'p': pop, 't': tick, 'd': ding}
n = int((DUR + 1) * SR); buf = np.zeros(n)
for kind, o in CFG['ev']:
    r = to_real(o)
    if r is None: continue
    r -= (0.22 if kind == 'w' else 0); x = SND[kind]() * GAIN[kind]; i0 = max(0, int(r * SR)); buf[i0:i0 + len(x)] += x[:n - i0]
sf.write(f'{S}/ahenk/sfx_{WHICH}.wav', np.stack([buf, buf], 1)[:int(DUR * SR)], SR)
plan = dict(dur=DUR, kn=kn, starts=starts, keys=[k for k, _, _ in CFG['segs']], norm=NORM)
json.dump(plan, open(f'{S}/ahenk/plan_{WHICH}.json', 'w'))
print(WHICH, DUR, [round(x, 2) for x in starts])
