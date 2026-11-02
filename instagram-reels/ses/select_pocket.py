import sys, wave, io, re, json, numpy as np, sherpa_onnx, subprocess
from pocket_tts_turkish import TurkishTTS
VOICE, M = sys.argv[1], sys.argv[2]
tts = TurkishTTS.from_pretrained()
asr = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+'/small-encoder.int8.onnx', decoder=M+'/small-decoder.int8.onnx', tokens=M+'/small-tokens.txt', language='tr', task='transcribe', num_threads=4)
SR = tts.sample_rate
# key: (max seconds, [candidate texts])
JOBS = {
 'r1_0': (3.0, ['Sekiz saat masa başındaysan,']),
 'r1_1': (2.2, ['Bu hesap senin için.', 'Bu hesap, senin.']),
 'r1_2': (3.4, ['Ben fizyoterapistim. Bugün ilk günüm.']),
 'r1_3': (3.8, ['Boyun ağrısı, bel ağrısı, kola vuran uyuşma.']),
 'r1_4': (3.6, ['Sekiz saat oturmanın faturası, hep bu üç yere çıkıyor.']),
 'r1_5': (3.2, ['Burada, ofiste yapılacak hareketler göstereceğim.']),
 'r1_6': (2.8, ['Her biri otuz saniye, masadan kalkmadan.']),
 'r1_7': (4.2, ['Hangisiyle başlayalım? Yorumlara, boyun, ya da bel yaz.']),
 'r1_8': (3.1, ['Sekiz saat senin, otuz saniyesi benim.']),
 'r2_0': (2.9, ['Akşam boynun ağrıyorsa, on saniye ver.']),
 'r2_1': (2.8, ['Başın, yaklaşık beş kilo.']),
 'r2_2': (3.3, ['Ekrana bakarken, farkında olmadan öne kayıyor.']),
 'r2_3': (3.3, ['Boynun arkası, o beş kiloyu bütün gün tutuyor.']),
 'r2_4': (2.3, ['Dik otur, karşıya bak.', 'Dik otur. Karşıya bak.']),
 'r2_5': (3.3, ['Çeneni düz geriye doğru it, çift çene yapar gibi.']),
 'r2_6': (4.2, ['Üç saniye tut, bırak. On tekrar.']),
 'r2_7': (2.8, ['Başını eğme, sadece geriye kaydır.']),
 'r2_8': (1.9, ['Günde üç dört kez yap.']),
 'r2_9': (2.45, ['Kolunda uyuşma varsa, önce muayene ol.']),
 'r2_10': (2.8, ['Bunu kaydet, akşam boynun ağrıyınca aç.']),
}
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
def synth(t, seed):
    x = np.asarray(tts.generate(t, voice=VOICE, seed=seed), dtype=np.float32).reshape(-1)
    e = np.convolve(np.abs(x), np.ones(240) / 240, 'same'); idx = np.where(e > 0.004)[0]
    m = int(.10 * SR); return x[max(0, idx[0] - m): idx[-1] + m]
def hear(x):
    y = np.interp(np.arange(0, len(x), SR / 16000), np.arange(len(x)), x).astype(np.float32)
    s = asr.create_stream(); s.accept_waveform(16000, y); asr.decode_stream(s); return s.result.text.strip()
import os
ONLY = os.environ.get('ONLY','').split(',') if os.environ.get('ONLY') else None
NSEED = int(os.environ.get('NSEED','4'))
if ONLY: JOBS = {k: JOBS[k] for k in ONLY}
chosen = {}
for k, (mx, texts) in JOBS.items():
    best = None
    for t in texts:
        for seed in range(NSEED):
                x = synth(t, seed)
                dur = len(x) / SR; h = hear(x); c = cer(norm(t), norm(h))
                score = c + (10 if dur > mx else 0)
                if best is None or score < best[0]: best = (score, t, h, dur, x)
    sc, t, h, dur, x = best
    x = x / max(1e-9, np.abs(x).max()) * 0.95; sf = (x * 32767).astype(np.int16)
    with wave.open(f'{k}.wav', 'wb') as wf: wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes(sf.tobytes())
    chosen[k] = t
    print(f'{k:6} {dur:4.2f}s/{mx}  CER {sc:.2f} | {t}  ->  {h}', flush=True)
json.dump(chosen, open('chosen_%s.json' % ('_'.join(ONLY) if ONLY else 'all'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
