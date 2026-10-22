# CIEDE2000 colour distance helpers for the reel colour plan
import math
def srgb2lab(h):
    h=h.lstrip('#'); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
    r,g,b=f(r),f(g),f(b)
    X=(0.4124*r+0.3576*g+0.1805*b)/0.95047; Y=(0.2126*r+0.7152*g+0.0722*b); Z=(0.0193*r+0.1192*g+0.9505*b)/1.08883
    t=lambda v: v**(1/3) if v>0.008856 else 7.787*v+16/116
    return (116*t(Y)-16, 500*(t(X)-t(Y)), 200*(t(Y)-t(Z)))
def de(a,b):
    L1,a1,b1=srgb2lab(a); L2,a2,b2=srgb2lab(b)
    C1=math.hypot(a1,b1); C2=math.hypot(a2,b2); Cb=(C1+C2)/2
    G=0.5*(1-math.sqrt(Cb**7/(Cb**7+25**7)))
    a1p,a2p=(1+G)*a1,(1+G)*a2; C1p,C2p=math.hypot(a1p,b1),math.hypot(a2p,b2)
    h1p=math.degrees(math.atan2(b1,a1p))%360; h2p=math.degrees(math.atan2(b2,a2p))%360
    dL=L2-L1; dC=C2p-C1p
    dh=h2p-h1p
    if C1p*C2p==0: dh=0
    elif dh>180: dh-=360
    elif dh<-180: dh+=360
    dH=2*math.sqrt(C1p*C2p)*math.sin(math.radians(dh/2))
    Lb=(L1+L2)/2; Cbp=(C1p+C2p)/2
    if C1p*C2p==0: hb=h1p+h2p
    elif abs(h1p-h2p)>180: hb=(h1p+h2p+360)/2
    else: hb=(h1p+h2p)/2
    T=1-0.17*math.cos(math.radians(hb-30))+0.24*math.cos(math.radians(2*hb))+0.32*math.cos(math.radians(3*hb+6))-0.2*math.cos(math.radians(4*hb-63))
    dth=30*math.exp(-((hb-275)/25)**2); RC=2*math.sqrt(Cbp**7/(Cbp**7+25**7))
    SL=1+0.015*(Lb-50)**2/math.sqrt(20+(Lb-50)**2); SC=1+0.045*Cbp; SH=1+0.015*Cbp*T; RT=-math.sin(math.radians(2*dth))*RC
    return math.sqrt((dL/SL)**2+(dC/SC)**2+(dH/SH)**2+RT*(dC/SC)*(dH/SH))
