import sys,numpy as np,subprocess
raw=subprocess.run(['ffmpeg','-v','error','-i',sys.argv[1],'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout
x=np.frombuffer(raw,np.float32); sr=16000; fl=640; f0=[]
for i in range(0,len(x)-fl,320):
    fr=x[i:i+fl]-x[i:i+fl].mean()
    if np.sqrt((fr**2).mean())<0.02: continue
    ac=np.correlate(fr,fr,'full')[fl-1:]
    lo,hi=sr//400,sr//70
    k=lo+np.argmax(ac[lo:hi])
    if ac[k]/ac[0]>0.5: f0.append(sr/k)
print('median F0 Hz:',round(float(np.median(f0)),1),'frames',len(f0))
