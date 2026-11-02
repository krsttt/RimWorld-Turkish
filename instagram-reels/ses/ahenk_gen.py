"""Ahenk (VoxCPM2 + Turkish LoRA) line generator with Whisper-based selection.

Usage: python gen.py <whisper_dir> <out_dir> [ONLY=keys] [NSEED=n]
Instruction format, as trained: "(English instruction)Turkish text".
"""
import json, os, re, sys, time, warnings
warnings.filterwarnings('ignore')
import numpy as np, torch, soundfile as sf, sherpa_onnx
from voxcpm import VoxCPM
from voxcpm.model.voxcpm import LoRAConfig

HERE = os.path.dirname(os.path.abspath(__file__))
M, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
torch.set_num_threads(4)

CHEER = 'Cheerful and warm, smiling while speaking.'
BRIGHT = 'Bright, upbeat and happy, smiling while speaking.'
WARM = 'Warm, patient and reassuring, full of understanding.'
CALM = 'Calm and reassuring, low and even.'
JOBS = {  # key: (max seconds, instruction, text)
 'r1_0': (3.0, BRIGHT, 'Sekiz saat masa başındaysan,'),
 'r1_1': (2.3, BRIGHT, 'Bu hesap senin için.'),
 'r1_2': (3.5, CHEER, 'Ben fizyoterapistim. Bugün ilk günüm!'),
 'r1_3': (3.9, WARM, 'Boyun ağrısı, bel ağrısı, kola vuran uyuşma.'),
 'r1_4': (3.7, WARM, 'Sekiz saat oturmanın faturası, hep bu üç yere çıkıyor.'),
 'r1_5': (3.3, CHEER, 'Burada, ofiste yapılacak hareketler göstereceğim.'),
 'r1_6': (2.9, CHEER, 'Her biri otuz saniye, masadan kalkmadan.'),
 'r1_7': (4.3, BRIGHT, 'Hangisiyle başlayalım? Yorumlara, boyun, ya da bel yaz.'),
 'r1_8': (3.1, BRIGHT, 'Sekiz saat senin, otuz saniyesi benim.'),
 'r2_0': (2.9, BRIGHT, 'Akşam boynun ağrıyorsa, on saniye ver.'),
 'r2_1': (2.8, CHEER, 'Başın, yaklaşık beş kilo.'),
 'r2_2': (3.4, WARM, 'Ekrana bakarken, farkında olmadan öne kayıyor.'),
 'r2_3': (3.4, WARM, 'Boynun arkası, o beş kiloyu bütün gün tutuyor.'),
 'r2_4': (2.4, CHEER, 'Dik otur, karşıya bak.'),
 'r2_5': (3.4, CHEER, 'Çeneni düz geriye doğru it, çift çene yapar gibi.'),
 'r2_6': (4.2, CHEER, 'Üç saniye tut, bırak. On tekrar.'),
 'r2_7': (2.9, CHEER, 'Başını eğme, sadece geriye kaydır.'),
 'r2_8': (1.95, BRIGHT, 'Günde üç dört kez yap.'),
 'r2_9': (2.5, CALM, 'Kolunda uyuşma varsa, önce muayene ol.'),
 'r2_10': (2.85, BRIGHT, 'Bunu kaydet, akşam boynun ağrıyınca aç.'),
}
ONLY = os.environ.get('ONLY'); NSEED = int(os.environ.get('NSEED', '2')); STEPS = int(os.environ.get('STEPS', '10'))
if ONLY: JOBS = {k: JOBS[k] for k in ONLY.split(',')}

t0 = time.time()
cfg = json.load(open(os.path.join(HERE, 'lora_config.json')))['lora_config']
tts = VoxCPM.from_pretrained(os.path.join(HERE, 'vox'), load_denoiser=False, optimize=False,
                             lora_config=LoRAConfig(**cfg), lora_weights_path=HERE)
SR = tts.tts_model.sample_rate
print(f'loaded in {time.time()-t0:.0f}s, sr {SR}', flush=True)
asr = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+'/small-encoder.int8.onnx', decoder=M+'/small-decoder.int8.onnx',
                                                 tokens=M+'/small-tokens.txt', language='tr', task='transcribe', num_threads=4)
NUM = {'3-4': 'üç dört', '30': 'otuz', '10': 'on', '8': 'sekiz', '5': 'beş', '3': 'üç'}
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
    e = np.convolve(np.abs(x), np.ones(480) / 480, 'same'); idx = np.where(e > 0.004 * max(1e-6, np.abs(x).max()) / 0.3)[0]
    if len(idx) == 0: return x
    m = int(.10 * SR); return x[max(0, idx[0] - m): idx[-1] + m]
def squeeze_pauses(x, max_gap=.35):
    """shorten internal silences longer than max_gap seconds"""
    fr = int(.02 * SR); n = len(x) // fr
    if n < 3: return x
    en = np.array([np.sqrt(np.mean(x[i*fr:(i+1)*fr] ** 2)) for i in range(n)])
    th = max(1e-4, en.max() * .03); keep = []; run = 0; lim = int(max_gap / .02)
    for i in range(n):
        run = run + 1 if en[i] < th else 0
        if run <= lim: keep.append(x[i*fr:(i+1)*fr])
    keep.append(x[n*fr:]); return np.concatenate(keep)
def hear(x):
    y = np.interp(np.arange(0, len(x), SR / 16000), np.arange(len(x)), x).astype(np.float32)
    s = asr.create_stream(); s.accept_waveform(16000, y); asr.decode_stream(s); return s.result.text.strip()

res = {}
for k, (mx, ins, text) in JOBS.items():
    best = None
    for seed in range(NSEED):
        torch.manual_seed(seed); np.random.seed(seed)
        t1 = time.time()
        w = tts.generate(text=f'({ins}){text}', cfg_value=2.0, inference_timesteps=STEPS, normalize=False)
        x = squeeze_pauses(trim(np.asarray(w, dtype=np.float32).reshape(-1)))
        dur = len(x) / SR; h = hear(x); c = cer(norm(text), norm(h))
        f0dur = time.time() - t1
        score = c + (10 if dur > mx else 0)
        print(f'  {k} seed{seed} {dur:4.2f}s gen {f0dur:4.0f}s CER {c:.2f} -> {h}', flush=True)
        if best is None or score < best[0]: best = (score, dur, h, x)
        if score == 0: break
    sc, dur, h, x = best
    x = x / max(1e-9, np.abs(x).max()) * .95
    sf.write(os.path.join(OUT, f'{k}.wav'), x, SR)
    res[k] = text
    print(f'{k:6} {dur:4.2f}s/{mx}  score {sc:.2f} | {text} -> {h}', flush=True)
json.dump(res, open(os.path.join(OUT, f'chosen_{ONLY or "all"}.json'.replace(',', '_')), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
