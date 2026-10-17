# Writes colour-plan.json: the whole reel in order (tunnel, heroes, run with the quick stores, Your store)
import json, re, subprocess
from de import de
brands = json.loads(subprocess.check_output(['node','-e',"import('../_spec/brands24.mjs').then(m=>console.log(JSON.stringify(m.BRANDS.map(b=>({slug:b.slug,brand:b.brand,vertical:b.vertical,device:b.device,color:b.color,slot:b.slot,avatar:b.avatar,layout:b.layout,isNew:!b.fonts||true})))))"]))
by={b['slot']:b for b in brands}
def soft(h): 
    c=[int(h[i:i+2],16) for i in (1,3,5)]; return '#'+''.join('%02X'%round(v*0.55+255*0.45) for v in c)
seq=[]
for i in range(1,9): b=by[f'tunnel-{i}']; seq.append(dict(section='tunnel',slot=f'tunnel-{i}',slug=b['slug'],brand=b['brand'],device=b['device'],color=b['color'],kind='v24'))
for slug,brand,dev,col,cat in [('fashion','12 Weather Outfitters','phone','#F2C94C','hero'),('electronics','Meridian','desktop','#D1001A','hero'),('books','Paper and Pine Books','tablet','#2A5C42','hero'),('gaming','Pulse Forge','phone','#A855F7','hero')]:
    seq.append(dict(section='heroes',slot='hero-'+slug,slug=slug,brand=brand,device=dev,color=col,kind='hero (v13, unchanged)'))
quick=[('buildright-home','BuildRight Home','tablet','#A7C957'),('the-apricot-theory','The Apricot Theory','phone','#F7944D'),('rolling-district','Rolling District','desktop','#E02020'),('viniteca-marti','Viniteca Marti','desktop','#701C33')]
run=[by[f'run-{i}'] for i in range(1,15)]
r=iter(run)
for k in range(4):
    q=quick[k]; seq.append(dict(section='run',slot=f'quick-{k}',slug=q[0],brand=q[1],device=q[2],color=q[3],kind='quick (v8, voiced, unchanged)'))
    b=next(r); seq.append(dict(section='run',slot=b['slot'],slug=b['slug'],brand=b['brand'],device=b['device'],color=b['color'],kind='v24'))
for b in r: seq.append(dict(section='run',slot=b['slot'],slug=b['slug'],brand=b['brand'],device=b['device'],color=b['color'],kind='v24'))
seq.append(dict(section='end',slot='yours',slug='yours',brand='Your store',device='desktop',color='#F28C38',kind='end card'))
for i,s in enumerate(seq):
    s['n']=i; s['softColor']=soft(s['color'])
    s['dePrev']=round(de(s['color'],seq[i-1]['color']),1) if i else None
    s['dePrev2']=round(de(s['color'],seq[i-2]['color']),1) if i>1 else None
mine=[s for s in seq if s['kind']=='v24']
allp=[(round(de(a['color'],b['color']),1),a['slug'],b['slug']) for i,a in enumerate(seq) for b in seq[i+1:] if 'v24' in (a['kind'],b['kind'])]
json.dump(dict(sequence=seq,closestPairsInvolvingV24=sorted(allp)[:10],minAdjacent=min(s['dePrev'] for s in seq[1:])),open('colour-plan.json','w'),indent=1)
brands_dup=[s['brand'] for s in seq]; assert len(set(brands_dup))==len(brands_dup), 'brand repeat!'
print('unique brands', len(brands_dup), 'min adjacent dE', min(s['dePrev'] for s in seq[1:]))
for s in seq: print(s['n'], s['slot'], s['brand'], s['device'], s['color'], s['dePrev'], s['dePrev2'])
print(sorted(allp)[:10])
