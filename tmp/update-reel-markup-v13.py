"""v13 (theme primaries from ~/Projects/Bizmis/ShopifyThemes/*/config/settings_data.json color_primary): Write the store-reel items (with merchant copy: feat -> ben) into public/promo/film-markup.html
(script#promo-store-reel): the four v11 heroes in play order (Fashion,
Electronics, Books, Gaming; cut by scripts/cut-store-reel-v11.py), then the
v8 ambient takes for the conveyor lead-in and the whip."""
import re, json, subprocess
P = 'public/promo/film-markup.html'
said = json.load(open('public/promo/stores/reel/v13/said.json'))
dur = lambda f: float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout)
V8 = '/promo/stores/reel/v8'; V11 = '/promo/stores/reel/v13'   # v13 re-records (fashion carried over from v11)
def hero(name, **kw):
    d = dur(f'public{V11}/{name}.mp4')
    item = {'video': f'{V11}/{name}.mp4', 'ambientStart': 0.6, 'hero': True, 'start': 0, 'dur': round(d - 0.05, 2), **kw}
    if name in said and 'said' not in kw: item['said'] = said[name]
    return item
amb = lambda slug, device, color, category, feat, ben: {'video': f'{V8}/ambient-{slug}.mp4', 'ambient': f'{V8}/ambient-{slug}.mp4', 'device': device,
                                               'color': color, 'category': category, 'feat': feat, 'ben': ben, 'hero': False, 'ambientStart': 0.6}
fashion_words = "Women's rain coats for city trips, in quiet colors?".split()
items = [
    hero('fashion', ambient=f'{V8}/ambient-12-weather-outfitters.mp4', device='phone', color='#F2C94C', category='Fashion & apparel', feat='Narrows the catalog', ben='Browsers become buyers',
         keys=[[0.1, 2.6]], saidKind='typed',
         said=[[round(0.15 + i * (2.4 / len(fashion_words)), 2), w] for i, w in enumerate(fashion_words)]),
    hero('electronics', ambient=f'{V8}/ambient-meridian.mp4', device='desktop', color='#D1001A', category='Consumer electronics', feat='Compares the options', ben='Undecided shoppers decide'),
    hero('books', ambient=f'{V8}/ambient-paper-and-pine-books.mp4', device='tablet', color='#2A5C42', category='Bookstores', feat="Knows what they're viewing", ben='Recommendations that sell'),
    hero('gaming', ambient=f'{V8}/ambient-pulse-forge.mp4', device='phone', color='#A855F7', category='Gaming gear', feat='Suggests the perfect add-on', ben='Bigger baskets', sfx=[[6.9, 'cart']]),
    amb('the-apricot-theory', 'phone', '#F7944D', 'Skincare & beauty', 'Matches the routine', 'Confident first purchases'),
    amb('buildright-home', 'tablet', '#A7C957', 'Home & DIY', 'Explains the specs', 'Fewer returns'),
    amb('rolling-district', 'desktop', '#E02020', 'Car parts & accessories', 'Checks the fit', 'Orders without doubts'),
    amb('viniteca-marti', 'desktop', '#701C33', 'Wine & spirits', 'Pairs it with the meal', 'More bottles per order'),
]
s = open(P).read()
m = re.search(r'(<script[^>]*id="promo-store-reel"[^>]*>)(.*?)(</script>)', s, re.S)
s = s[:m.start(2)] + '\n' + json.dumps(items, ensure_ascii=False) + '\n' + s[m.end(2):]
open(P, 'w').write(s)
for it in items: print(it['category'], it.get('dur', ''), it['video'])
