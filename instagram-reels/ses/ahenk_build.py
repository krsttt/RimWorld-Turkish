"""Normalise voice clips, retime reels to the speech, write KN/DUR into the reel JS, build an SFX track."""
import json, os, re, subprocess
import numpy as np, soundfile as sf

S = '/tmp/claude-0/-home-user-RimWorld-Turkish/db99d8a9-580e-542a-b548-df16cc4ac28f/scratchpad'
SRC, NORM, REELS = f'{S}/ahenk/out', f'{S}/ahenk/norm', f'{S}/reels'
os.makedirs(NORM, exist_ok=True)
SR = 48000
TARGET = -16.0

def lufs(path):
    o = subprocess.run(['ffmpeg', '-nostdin', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1])

dur = {}
for f in sorted(os.listdir(SRC)):
    if not f.endswith('.wav'): continue
    k = f[:-4]; i = lufs(f'{SRC}/{f}'); gain = TARGET - i
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{SRC}/{f}', '-af',
                    f'volume={gain:.2f}dB,alimiter=limit=0.95:level=disabled', '-ar', str(SR), f'{NORM}/{f}'], check=True)
    x, _ = sf.read(f'{NORM}/{f}'); dur[k] = len(x) / SR

W = {'r1': [0, 3.2, 5.5, 9, 13, 16.5, 18.3, 20, 23, 25.5],
     'r2': [0, 3, 6, 9.5, 13, 15.5, 19, 23.5, 26.5, 28.5, 31, 34]}
MIN = {'r2_6': 4.3, 'r1_8': 3.6, 'r2_10': 3.4}
plan = {}
for p, Wd in W.items():
    real, starts = [0.0], []
    for i in range(len(Wd) - 1):
        k = f'{p}_{i}'; d = dur[k]; ol = Wd[i + 1] - Wd[i]
        L = max(min(ol, d + 0.55), d + 0.3, MIN.get(k, 0))
        starts.append(real[-1] + 0.08); real.append(real[-1] + L)
    kn = [[round(r, 3), o] for r, o in zip(real, Wd)]
    plan[p] = dict(kn=kn, starts=starts, dur=round(real[-1], 2))

def to_real(p, o):
    kn = plan[p]['kn']
    for (r0, o0), (r1, o1) in zip(kn, kn[1:]):
        if o <= o1: return r0 + (o - o0) / (o1 - o0) * (r1 - r0)
    return kn[-1][0]

# write timings into the reels
for p, f in (('r1', 'reel1.js'), ('r2', 'reel2.js')):
    s = open(f'{REELS}/{f}').read()
    s = re.sub(r'const DUR = [\d.]+;', f"const DUR = {plan[p]['dur']};", s, count=1)
    s = re.sub(r'const KN = \[.*?\];', 'const KN = ' + json.dumps(plan[p]['kn']) + ';', s, count=1)
    open(f'{REELS}/{f}', 'w').write(s)

# ---------- SFX ----------
rng = np.random.default_rng(7)
def whoosh(d=.5):
    n = int(d * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    # crude band-pass sweep: mix of progressively smoothed noise
    out = np.zeros(n); fc = 400 * (3000 / 400) ** (t / d)
    for lo, hi in ((1, 3), (3, 9), (9, 27)):
        k = np.convolve(x, np.ones(lo) / lo, 'same') - np.convolve(x, np.ones(hi) / hi, 'same')
        out += k * np.exp(-((np.log(fc) - np.log(SR / (2.2 * hi))) ** 2) / 1.2)
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    out *= env; return out / np.abs(out).max()
def pop(f0=520, f1=980, d=.12):
    t = np.arange(int(d * SR)) / SR; f = f0 + (f1 - f0) * (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 34) * np.minimum(1, t * 400)
def tick(f=1700, d=.05):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 90) * np.minimum(1, t * 800)
def ding(d=.6):
    t = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * 1318 * t) + .5 * np.sin(2 * np.pi * 1975 * t)) * np.exp(-t * 7) * np.minimum(1, t * 600) / 1.5

EV = {
 'r1': [('w', o) for o in (5.5, 9, 13, 16.5, 20, 23)] + [('p', 0.05), ('p', 3.2), ('d', 6.6), ('p', 9.3), ('p', 10.3), ('p', 11.3),
        ('t', 13.8), ('t', 14.25), ('t', 14.7), ('p', 15.3), ('p', 20.5), ('p', 20.8), ('p', 23.1), ('p', 23.8), ('d', 24.4)],
 'r2': [('w', o) for o in (3, 6, 9.5, 13, 15.5, 19, 23.5, 26.5, 28.5, 31)] + [('p', 0.05), ('p', 3.1), ('d', 14.2), ('p', 23.8), ('d', 24.4),
        ('t', 26.6), ('t', 26.8), ('t', 27.0), ('t', 27.2), ('p', 28.6), ('d', 31.8)] + [('t', 19.8 + i) for i in range(3)],
}
GAIN = {'w': .10, 'p': .16, 't': .12, 'd': .10}
SND = {'w': whoosh, 'p': pop, 't': tick, 'd': ding}
for p in EV:
    n = int((plan[p]['dur'] + 1) * SR); buf = np.zeros(n)
    for kind, o in EV[p]:
        r = to_real(p, o) - (0.22 if kind == 'w' else 0)
        x = SND[kind]() * GAIN[kind]; i0 = max(0, int(r * SR)); buf[i0:i0 + len(x)] += x[:n - i0]
    sf.write(f'{S}/ahenk/sfx_{p}.wav', np.stack([buf, buf], 1)[:int(plan[p]['dur'] * SR)], SR)

json.dump(plan, open(f'{S}/ahenk/plan2.json', 'w'))
for p in plan: print(p, plan[p]['dur'], [round(x, 2) for x in plan[p]['starts']])
