import sys, numpy as np, subprocess, warnings; warnings.filterwarnings('ignore')
import pyworld as pw
sr=16000
x=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',sys.argv[1],'-ac','1','-ar',str(sr),'-f','f64le','-'],capture_output=True).stdout,np.float64).copy()
f0,t=pw.harvest(x,sr,frame_period=5); sp=pw.cheaptrick(x,f0,t,sr)
v=f0>0; env=np.log(sp[v]+1e-12)
fr=np.linspace(0,sr/2,sp.shape[1])
# formant peaks per frame from smoothed envelope
F1=[];F2=[]
for e in env:
    pk=[i for i in range(2,len(e)-2) if e[i]>e[i-1] and e[i]>e[i+1] and 200<fr[i]<3500]
    if len(pk)>=2: F1.append(fr[pk[0]]); F2.append(fr[pk[1]])
cent=(np.exp(env)*fr).sum(1)/np.exp(env).sum(1)
print(f"F0 {np.median(f0[v]):.0f}Hz  F0 p10-p90 {np.percentile(f0[v],10):.0f}-{np.percentile(f0[v],90):.0f}  F1 {np.median(F1):.0f}  F2 {np.median(F2):.0f}  centroid {np.median(cent):.0f}")
