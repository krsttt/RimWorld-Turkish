"""Quality audit for all reels: pronunciation, voice consistency, clip hygiene, sync, loudness.
usage: python qa.py r1:video.mp4 r2:video.mp4 ...
"""
import json, re, subprocess, sys, warnings
warnings.filterwarnings('ignore')
import numpy as np, soundfile as sf, sherpa_onnx

S = '/tmp/claude-0/-home-user-RimWorld-Turkish/db99d8a9-580e-542a-b548-df16cc4ac28f/scratchpad'
M = f'{S}/dl/sherpa-onnx-whisper-small'
TEXT = json.load(open(f'{S}/clone/jobs_all.json', encoding='utf-8')) | json.load(open(f'{S}/clone/jobs_prof.json', encoding='utf-8'))
for p in ['t', 'k', 's', 'h', 'm', 'a1', 'a2', 'a3']:
    TEXT[f'{p}_3'] = TEXT['d_3']; TEXT[f'{p}_8'] = TEXT['d_8']
TEXT['a2_9'] = TEXT['a3_9'] = TEXT['a1_9']
asr = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+'/small-encoder.int8.onnx', decoder=M+'/small-decoder.int8.onnx',
                                                 tokens=M+'/small-tokens.txt', language='tr', task='transcribe', num_threads=4)
spk = sherpa_onnx.SpeakerEmbeddingExtractor(sherpa_onnx.SpeakerEmbeddingExtractorConfig(model=f'{S}/clone/spk.onnx', num_threads=2))
def to16(x, sr): return np.interp(np.arange(0, len(x), sr / 16000), np.arange(len(x)), x).astype(np.float32)
def emb(x16):
    s = spk.create_stream(); s.accept_waveform(16000, x16); s.input_finished(); e = np.array(spk.compute(s)); return e / np.linalg.norm(e)
NUM = {'3-4': 'üç dört', '30': 'otuz', '10': 'on', '8': 'sekiz', '5': 'beş', '3': 'üç', '2': 'iki', '1': 'bir'}
def norm(s):
    s = s.replace('I', 'ı').replace('İ', 'i').lower()
    for k, w in NUM.items(): s = re.sub(rf'(?<!\d){re.escape(k)}(?!\d)', w, s)
    return re.sub(r'[^a-zçğıöşü ]', '', s).split()
def cer(a, b):
    a, b = ' '.join(a), ' '.join(b); d = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        p, d[0] = d[0], i
        for j in range(1, len(b) + 1):
            p, d[j] = d[j], min(d[j] + 1, d[j-1] + 1, p + (a[i-1] != b[j-1]))
    return d[-1] / max(1, len(a))
r, rsr = sf.read(f'{S}/clone/ref.wav', dtype='float32'); REF = emb(to16(r, rsr))

allE, problems = [], []
for arg in sys.argv[1:]:
    reel, video = arg.split(':')
    plan = json.load(open(f'{S}/ahenk/plan_{reel}.json'))
    starts, keys, dur = plan['starts'], plan['keys'], plan['dur']
    wins = [(st - .08, (starts[i + 1] - .08) if i + 1 < len(starts) else dur) for i, st in enumerate(starts)]
    print(f'\n=== {reel}  ({video.split("/")[-1]}, {dur:.1f}s)')
    print(f'{"line":6} {"dur":>5} {"CER":>5} {"sim":>5} {"peak":>5} {"edge":>6} {"slack":>6}  heard')
    for i, k in enumerate(keys):
        x, sr = sf.read(f"{plan['norm']}/{k}.wav", dtype='float32')
        x16 = to16(x, sr); x16p = np.concatenate([np.zeros(4800, np.float32), x16, np.zeros(12800, np.float32)]); s = asr.create_stream(); s.accept_waveform(16000, x16p); asr.decode_stream(s); h = s.result.text.strip()
        c = cer(norm(TEXT[k]), norm(h)); e = emb(x16); sim = float(e @ REF); allE.append((f'{reel}/{k}', e))
        peak = float(np.abs(x).max()); edge = float(max(abs(x[0]), abs(x[-1])))
        end = starts[i] + len(x) / sr; slack = wins[i][1] - end
        flag = []
        if c > .08: flag.append('PRONUNCIATION')
        if sim < .75: flag.append('VOICE')
        if peak > .99: flag.append('CLIP')
        if slack < .1: flag.append('OVERRUN')
        print(f'{k:6} {len(x)/sr:5.2f} {c:5.2f} {sim:5.2f} {peak:5.2f} {edge:6.3f} {slack:6.2f}  {h}' + (('   <-- ' + ','.join(flag)) if flag else ''))
        if flag: problems.append((reel, k, flag))
    # final mix
    o = subprocess.run(['ffmpeg', '-nostdin', '-i', video, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1]; LRA = re.findall(r'LRA:\s+([\d.]+) LU', o)[-1]; TP = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', o)[-1]
    a = np.frombuffer(subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', video, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
    lv = []
    for i, k in enumerate(keys):
        x, sr = sf.read(f"{plan['norm']}/{k}.wav", dtype='float32'); a0 = int(starts[i] * 16000); a1 = int((starts[i] + len(x) / sr) * 16000)
        seg = a[a0:a1]; lv.append(20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9))
    vdur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], capture_output=True, text=True).stdout)
    print(f'mix: {I} LUFS, true peak {TP} dBFS, LRA {LRA} LU, line level spread {max(lv)-min(lv):.1f} dB, video {vdur:.2f}s vs plan {dur:.2f}s')

E = np.stack([e for _, e in allE]); c = E.mean(0); c /= np.linalg.norm(c); sims = E @ c
print(f'\nALL LINES: n={len(E)} voice consistency to centroid mean {sims.mean():.3f} min {sims.min():.3f} ({allE[int(np.argmin(sims))][0]}); pairwise min {(E @ E.T).min():.3f}')
print('PROBLEMS:', problems if problems else 'none')
