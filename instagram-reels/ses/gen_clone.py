"""One consistent voice for every line: VoxCPM2 'ultimate cloning' from a single reference clip.

usage: MODE=lora|base python gen_clone.py jobs.json out_dir   (jobs.json: {key: text})
Picks, per line, the take with the lowest Whisper character error, then the highest speaker similarity to the reference.
"""
import json, os, re, sys, time, warnings
warnings.filterwarnings('ignore')
import numpy as np, torch, soundfile as sf, sherpa_onnx
from voxcpm import VoxCPM
from voxcpm.model.voxcpm import LoRAConfig

S = '/tmp/claude-0/-home-user-RimWorld-Turkish/db99d8a9-580e-542a-b548-df16cc4ac28f/scratchpad'
A = f'{S}/ahenk'; M = f'{S}/dl/sherpa-onnx-whisper-small'
REF = f'{S}/clone/ref.wav'
REF_TEXT = ('Karşılaştırma isteyenlere eski ve yeni paketi yan yana anlatırız; farkı müşteri kendisi görür. '
            'Akşam olduğunda kısa bir değerlendirme yaparız: hangi sorular arttı, hangi açıklama iyi çalıştı, nerede zorlandık?')
jobs = json.load(open(sys.argv[1], encoding='utf-8')); OUT = sys.argv[2]; os.makedirs(OUT, exist_ok=True)
MODE = os.environ.get('MODE', 'lora'); NSEED = int(os.environ.get('NSEED', '2')); STEPS = int(os.environ.get('STEPS', '10'))
ONLY = os.environ.get('ONLY')
if ONLY: jobs = {k: jobs[k] for k in ONLY.split(',')}
torch.set_num_threads(4)

t0 = time.time()
if MODE == 'lora':
    cfg = json.load(open(f'{A}/lora_config.json'))['lora_config']
    tts = VoxCPM.from_pretrained(f'{A}/vox', load_denoiser=False, optimize=False, lora_config=LoRAConfig(**cfg), lora_weights_path=A)
else:
    tts = VoxCPM.from_pretrained(f'{A}/vox', load_denoiser=False, optimize=False)
SR = tts.tts_model.sample_rate
print(f'[{MODE}] loaded in {time.time()-t0:.0f}s', flush=True)

asr = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+'/small-encoder.int8.onnx', decoder=M+'/small-decoder.int8.onnx',
                                                 tokens=M+'/small-tokens.txt', language='tr', task='transcribe', num_threads=4)
spk = sherpa_onnx.SpeakerEmbeddingExtractor(sherpa_onnx.SpeakerEmbeddingExtractorConfig(model=f'{S}/clone/spk.onnx', num_threads=2))
def to16(x, sr): return np.interp(np.arange(0, len(x), sr / 16000), np.arange(len(x)), x).astype(np.float32)
def emb(x16):
    s = spk.create_stream(); s.accept_waveform(16000, x16); s.input_finished(); e = np.array(spk.compute(s)); return e / np.linalg.norm(e)
r, rsr = sf.read(REF, dtype='float32'); REF_E = emb(to16(r if r.ndim == 1 else r.mean(1), rsr))
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
def trim(x):
    e = np.convolve(np.abs(x), np.ones(480) / 480, 'same'); th = 0.012 * np.abs(x).max(); idx = np.where(e > th)[0]
    if len(idx) == 0: return x
    m = int(.10 * SR); return x[max(0, idx[0] - m): idx[-1] + m]
def squeeze(x, max_gap=.35):
    fr = int(.02 * SR); n = len(x) // fr
    en = np.array([np.sqrt(np.mean(x[i*fr:(i+1)*fr] ** 2)) for i in range(n)]); th = max(1e-4, en.max() * .03)
    keep, run, lim = [], 0, int(max_gap / .02)
    for i in range(n):
        run = run + 1 if en[i] < th else 0
        if run <= lim: keep.append(x[i*fr:(i+1)*fr])
    keep.append(x[n*fr:]); return np.concatenate(keep)

for k, text in jobs.items():
    if os.path.exists(f'{OUT}/{k}.wav') and not os.environ.get('FORCE'):
        print(f'{k} exists, skipped', flush=True); continue
    best = None
    for seed in range(NSEED):
        torch.manual_seed(seed); np.random.seed(seed); t1 = time.time()
        w = tts.generate(text=text, prompt_wav_path=REF, prompt_text=REF_TEXT, reference_wav_path=REF,
                         cfg_value=2.0, inference_timesteps=STEPS, normalize=False)
        x = squeeze(trim(np.asarray(w, dtype=np.float32).reshape(-1))); x16 = to16(x, SR)
        x16p = np.concatenate([np.zeros(4800, np.float32), x16, np.zeros(12800, np.float32)]); s = asr.create_stream(); s.accept_waveform(16000, x16p); asr.decode_stream(s); h = s.result.text.strip()
        c = cer(norm(text), norm(h)); sim = float(emb(x16) @ REF_E)
        print(f'  {k} seed{seed} {len(x)/SR:4.2f}s {time.time()-t1:4.0f}s CER {c:.2f} sim {sim:.3f} -> {h}', flush=True)
        key = (round(c, 2), -sim)
        if best is None or key < best[0]: best = (key, x, h, sim, c)
        if c == 0 and sim > float(os.environ.get('SIMT', '.80')): break
    _, x, h, sim, c = best
    sf.write(f'{OUT}/{k}.wav', x / max(1e-9, np.abs(x).max()) * .95, SR)
    print(f'{k:6} {len(x)/SR:4.2f}s CER {c:.2f} sim {sim:.3f} | {text} -> {h}', flush=True)
