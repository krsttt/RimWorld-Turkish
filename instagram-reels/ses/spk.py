import sys, glob, numpy as np, soundfile as sf, sherpa_onnx
ex = sherpa_onnx.SpeakerEmbeddingExtractor(sherpa_onnx.SpeakerEmbeddingExtractorConfig(model=sys.argv[1], num_threads=2))
def emb(p):
    x, sr = sf.read(p, dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    if sr != 16000: x = np.interp(np.arange(0, len(x), sr / 16000), np.arange(len(x)), x).astype(np.float32)
    s = ex.create_stream(); s.accept_waveform(16000, x); s.input_finished(); e = np.array(ex.compute(s)); return e / np.linalg.norm(e)
ref = emb(sys.argv[2]) if sys.argv[2] != '-' else None
files = sorted(sum([glob.glob(g) for g in sys.argv[3:]], []))
E = np.stack([emb(f) for f in files]); c = E.mean(0); c /= np.linalg.norm(c)
sims = E @ c; pair = E @ E.T
print(f'n={len(files)}  to-centroid mean {sims.mean():.3f} min {sims.min():.3f}  pairwise min {pair.min():.3f}' + (f'  to-reference mean {(E @ ref).mean():.3f}' if ref is not None else ''))
worst = np.argsort(sims)[:3]; print('  least similar:', ', '.join(f'{files[i].split("/")[-1]}={sims[i]:.2f}' for i in worst))
