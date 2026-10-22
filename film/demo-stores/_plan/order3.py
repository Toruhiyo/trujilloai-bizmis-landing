import random, math
exec(open('order2.py').read().split("res=[]")[0])
TUNB=['halcyon-optics','kumo-tea','sora-ceramics','powderline','tidewater','maison-cacao','liora','grindline']
def full(run):
    global RUN; RUN=run; return seqof(TUNB)
def obj(s):
    a=min(de(s[i][1],s[i-1][1]) for i in range(12,len(s)))
    b=min(de(s[i][1],s[i-2][1]) for i in range(12,len(s)))
    c=min(de(s[i][1],s[i-3][1]) for i in range(12,len(s)))
    return min(a,b+9,c+14)
random.seed(3); best=None
pool=RUN[:]
for trial in range(40):
    cur=pool[:]; random.shuffle(cur); cs=obj(full(cur))
    for it in range(3000):
        a,b=random.sample(range(14),2); n=cur[:]; n[a],n[b]=n[b],n[a]; ns=obj(full(n))
        if ns>=cs or random.random()<math.exp((ns-cs)/0.4): cur,cs=n,ns
    if not best or cs>best[0]: best=(cs,cur)
print(best)
s=full(best[1])
for i,(n,c) in enumerate(s[11:],11): print(i,n,c,' '.join(f"{de(c,s[j][1]):.0f}" for j in range(max(0,i-3),i)))
