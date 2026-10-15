import numpy as np, wave
SR=44100; D=36.0; n=int(SR*D); t=np.arange(n)/SR; out=np.zeros(n)
def note(m): return 440*2**((m-69)/12)
chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]  # Am F C G
for i in range(int(D/4.5)+1):
    a=i*4.5; ch=chords[i%4]
    seg=(t>=a)&(t<a+5.5); tt=t[seg]-a
    env=np.minimum(tt/1.2,1)*np.clip((5.5-tt)/1.5,0,1)
    for m in ch+[ch[0]-12]:
        f=note(m); out[seg]+=env*(np.sin(2*np.pi*f*tt)+.3*np.sin(2*np.pi*2*f*tt+.5))*.05
# soft pulse
beat=0.5
for k in range(int(D/beat)):
    a=k*beat; seg=(t>=a)&(t<a+.25); tt=t[seg]-a
    out[seg]+=np.sin(2*np.pi*55*tt)*np.exp(-tt*18)*(.22 if k%2==0 else .1)
rng=np.random.default_rng(1)
for a in (0.0,5.0,10.5,15.0,20.5,25.5):
    L=int(.6*SR); s0=int(max(a-.3,0)*SR); nz=rng.standard_normal(L)
    nz=np.convolve(nz,np.ones(30)/30,'same'); env=np.sin(np.linspace(0,np.pi,L))**2
    out[s0:s0+L]+=nz*env*.5
# ding at hook
seg=t<1.5; out[seg]+=np.sin(2*np.pi*1318*t[seg])*np.exp(-t[seg]*4)*.15
out*=np.clip((D-t)/2,0,1)
out=out/np.abs(out).max()*.7
d=(out*32767).astype(np.int16); st=np.stack([d,d],1)
w=wave.open('bed.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes()); w.close()
