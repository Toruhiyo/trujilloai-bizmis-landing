# Bizmis Lead Onboarding Skill

Onboard a new lead (or update an existing one) from a store name and URL. The process is split into **automated extraction** (Python) and **cognitive curation** (LLM), following an iterative workflow: extract → review → curate → save → verify.

## Philosophy — Continuous improvement

This pipeline follows a strict iterative improvement cycle:

1. **Manually solve the problem** — analyse the store, look for patterns, identify what can be automated and what requires judgement.
2. **Automate** what's repetitive to save cognitive load (human or LLM).
3. **Manually review** every automated output to detect edge cases and errors.
4. **Improve the automation** with learnings from manual corrections when a pattern emerges. Accept that true edge cases will always need manual fixes — do not over-engineer for marginal gain.

Every time a manual fix is applied, ask: "Could this have been caught by the automation?" If yes and the fix is straightforward, update the extraction code. If not, document it in the "Common edge cases" table below.

## When to use

Use this skill when the user asks to:
- Add a new lead/store to the early-access program
- Re-extract or refresh data for an existing lead
- Onboard a batch of new leads
- Fix or update brand colours, products, or copy for a lead

## Prerequisites

- Python 3.11+ with Pillow installed (use the studio venv: `/Users/oriol/Projects/Bizmis/trujilloai-bizmis-studio/.venv/bin/python`)
- Run scripts from the landing repo root: `/Users/oriol/Projects/Bizmis/trujilloai-bizmis-landing`
- The `scripts/lead_onboarding/` package must be importable (add `scripts/` to `sys.path`)

## Workflow

### Step 1 — Extract (automated)

Run the extraction toolkit to scrape brand data, logos, and products:

```python
import sys, os
sys.path.insert(0, "scripts")
from lead_onboarding import extract_store_data

data = extract_store_data("https://example-store.com")
print(data.summary())
```

Review the output summary. It contains:
- Store name (from OG tags / `<title>`)
- Theme color and CSS variable colour candidates
- Logo candidates ranked by score (header images score 50+, favicons score 20–30)
- Product catalog (title, price, type, image URL)

**Important**: The scraper's best guess may still be wrong. Always visually inspect the store's navbar to verify the logo and colours match. If the scraper only found favicons, find the header logo manually (see Step 2).

### Step 2 — Curate brand (cognitive — LLM)

Brand curation is split into **two independent compositions** that may share values or differ depending on the store:

1. **Invite-card top bar** — replicates the store's landing page navbar look.
2. **Avatar shirt** — chooses the best shirt colour and stamp to make the avatar look like a branded store clerk, independently of the top bar.

Take your time on this step. The visual composition is critical for the email's impact.

#### 2a — Invite-card top bar

Open the store and inspect the top navigation bar. Apply one of two rules:

**Rule A (default) — Navbar has colour.** The navbar itself is coloured (red, dark navy, green…) OR the navbar is white/neutral but the logo displayed on it is colourful (e.g. a green wordmark, an orange wordmark). Replicate exactly: `primaryColor` = navbar bg, `logoColorOverlay` = `null` (native colours).

**Rule B (accent exception) — Navbar is colourless but the brand has a clear accent.** The navbar is white/light AND the logo on it is also colourless (plain black/white/grey wordmark), BUT the brand has a strong, distinctive accent colour visible elsewhere on the site (buttons, CTAs, section backgrounds). In this case, use the brand accent as `primaryColor` and tint the logo to contrast against it (`logoColorOverlay: "#ffffff"` for dark accents).

| Field | Decision criteria |
|-------|------------------|
| `primaryColor` | **Rule A**: navbar background colour. **Rule B**: brand accent colour. |
| `textColor` | Store name text colour in the banner. For white/light `primaryColor`, use the brand accent or a dark colour. For dark `primaryColor`, leave `null` (defaults to white). |
| `logoColorOverlay` | **Rule A**: `null` (native colours). **Rule B**: `#ffffff` (or whatever contrasts with `primaryColor`). |
| `leadLogoScale` | Default 1.0. Increase for wide horizontal wordmarks (e.g. 1.6–1.8). |
| `secondaryColor` | Usually `null`. Set only if the brand has a clear secondary colour. |

**Logo selection for top bar**: ALWAYS use the full logo as it appears in the store's header/navbar. This is typically a wordmark (icon + text), NOT a favicon.

#### 2b — Avatar shirt composition

Decide the shirt colour and stamp image **independently** from the top bar. The goal is to make the avatar look like a branded store clerk — not to repeat the invite-card banner.

**Shirt colour rules**:
1. If the store has a **clear primary / accent colour** visible in buttons, CTAs, UI widgets (not just in the logo) → use that colour as `avatarShirtColor`.
2. If the navbar is already coloured and that colour *is* the brand primary → the shirt colour will match the top bar naturally (no need to set `avatarShirtColor`; it falls back to `primaryColor`).
3. If no clear primary colour exists → omit `avatarShirtColor` (falls back to `primaryColor`).

**Stamp image rules**:
1. If a **compact brand icon** (leaf, flame, geometric mark, etc.) can be found or extracted — use it as `avatarStampImage`. Icons read better on a shirt than full wordmarks.
2. If no compact icon exists, the full logo (`logo.png`) is used automatically. This is fine for stores whose wordmark is compact enough.

**Stamp tint rules** (readability on the shirt colour):
- If shirt colour is **the same as** the top bar colour and the top bar logo already has good contrast → stamp tint can match `logoColorOverlay` (or be omitted if both are `null`).
- If shirt colour is **different from** the top bar → choose a stamp tint that contrasts against the shirt: `#ffffff` for dark/mid shirts, `#000000` or the brand primary for light shirts, or `null` if the native icon colours already contrast well.

| Field | Decision criteria |
|-------|------------------|
| `avatarShirtColor` | Brand primary / accent hex. `null` = falls back to `primaryColor`. |
| `avatarStampColorOverlay` | Stamp tint hex for contrast on the shirt. `null` = native colours. |
| `avatarStampImage` | Filename in the lead folder (e.g. `"icon.svg"`). `null` = uses `logo.png`. |

#### Pattern archetypes — how top bar and shirt relate

| Archetype | Top bar | Shirt | When to apply |
|-----------|---------|-------|---------------|
| **Coloured navbar = brand primary** | Coloured bg, white/contrasting wordmark | Same colour, same or compact icon | The navbar bg is already the brand's primary colour. Shirt naturally matches. No need to set `avatarShirtColor`. |
| **White navbar + colourful logo + accent colour in UI** | White bg, colourful wordmark | Use the accent/primary colour (from buttons, CTAs), compact icon tinted white | The navbar is white but the brand has a clear primary used in UI widgets. A white shirt would look bland and duplicate the banner; using the accent colour makes the avatar feel like a real employee. If a compact icon (leaf, flame, monogram) exists, prefer it over the full wordmark. |
| **White navbar + colourful logo + no separate accent** | White bg, colourful wordmark | Falls back to top bar (white shirt, native wordmark) | The logo colour is distinctive but there's no separate UI accent. Shirt matches top bar. |
| **White navbar + colourless logo + brand accent** | Uses accent as bg (Rule B), white wordmark | Same as top bar | Rule B already used the accent for the top bar. Shirt matches naturally. |
| **White navbar + colourless logo + no accent** | White bg, native wordmark | Falls back to top bar (white shirt, native wordmark) | No colour to use anywhere. Shirt = top bar. |

**Key principle**: Browse the store's UI beyond the navbar — buttons, CTAs, section backgrounds, badges. If there's a clear primary / accent colour used consistently, that's the shirt colour. If the navbar already uses it, they match naturally. If the navbar is white/neutral and the accent is elsewhere, the shirt should use the accent to avoid redundancy with the banner.

#### Logo & icon sourcing

- **Full wordmark** for the top bar: inspect `<header>` / `<nav>` HTML. Shopify stores: `//domain/cdn/shop/files/logo*.svg`. Check shop subdomains.
- **Compact icon** for the shirt stamp: check favicon, apple-touch-icon, og:image with icon crop, or extract from the SVG logo if it has a separable icon part. Save as `icon.svg` or `icon.png` in the lead folder.

### Step 3 — Curate products (cognitive — LLM)

From the product list, pick **3 products** that:
- Are diverse (different categories/use cases, not colour variants of the same item)
- Are mid-to-high price tier (avoid the cheapest accessories)
- Represent the store's core offering
- Would make a compelling recommendation comparison

**CRITICAL: NEVER guess prices.** Every price MUST come from the extraction's product catalog (Step 1) or from the store's Shopify `products.json` API. If the product list is empty (non-Shopify store), browse the store manually and copy-paste exact prices from product pages.

Write each as:
```json
{ "title": "Product Name", "price": "$XX", "tag": "One-word category" }
```

### Step 4 — Write copy (cognitive — LLM)

Generate these fields in the store's voice and domain:

| Field | Description |
|-------|-------------|
| `pitchLine` | One sentence: how Bizmis helps THIS store's shoppers. Pattern: "Help/Guide [audience] [action] by [criteria]." |
| `demoShopperPrompt` | Realistic shopper question in first person. Natural voice, specific need. |
| `demoBizmisReply` | Conversational follow-up that narrows the need. Start with "Got it —" and offer a binary choice. |
| `demoFooterLine` | Rephrase of pitchLine as a caption. Pattern: "Guides [audience] by [criteria]." |

### Step 5 — Save and generate assets (automated)

```python
from lead_onboarding import save_lead, download_lead_assets

# Pick the best logo candidate
best_logo = data.logos[0]  # or whichever scored best after review

# Pick product image URLs for the 3 chosen products
product_urls = [
    "https://cdn.shopify.com/.../product-a.webp",
    "https://cdn.shopify.com/.../product-b.webp",
    "https://cdn.shopify.com/.../product-c.webp",
]

# Save the curated JSON (include avatar fields when shirt differs from top bar)
lead_data = {
    "id": "newlead",
    "storeName": "New Lead Store",
    "storeDomain": "newlead.com",
    "leadContactName": null,
    "leadContactLastName": null,
    "content": "",
    "primaryColor": "#...",
    "secondaryColor": null,
    "textColor": null,
    "logoColorOverlay": null,
    "avatarShirtColor": "#..." or null,      # null → falls back to primaryColor
    "avatarStampColorOverlay": "#..." or null, # null → falls back to logoColorOverlay
    "avatarStampImage": "icon.svg" or null,    # null → uses logo.png
    "pitchLine": "...",
    "demoShopperPrompt": "...",
    "demoBizmisReply": "...",
    "demoProducts": [...],
    "demoFooterLine": "...",
    "montageClerkCue": null,
    "country": "USA",
    "vertical": "...",
    "subNiche": "..."
}

save_lead("newlead", lead_data)

# Download assets (including compact icon if using avatarStampImage)
download_lead_assets(
    "newlead",
    logo_url=best_logo.get("url"),
    svg_source=best_logo.get("svg_source"),
    product_image_urls=product_urls,
)
```

If a custom stamp image was chosen (`avatarStampImage`), download or extract it into `public/invite-cards/leads/<id>/` with the chosen filename before generating the avatar.

### Step 6 — Generate avatar (automated)

After assets are saved, **update the lead's entry in `scripts/early_access_avatars/_config.py :: LEAD_REGISTRY`** with the avatar-specific fields:

```python
# Add to LEAD_REGISTRY in _config.py:
{"id": "newlead", "primary_color": "#...", "logo_color_overlay": ...,
 "shirt_color": "#...", "stamp_color_overlay": "...", "stamp_image": "..."},
# Only include shirt_color / stamp_color_overlay / stamp_image when they
# differ from primary_color / logo_color_overlay / default "logo.png".
```

Then generate the clerk avatar:

```python
from early_access_avatars import generate_lead
generate_lead("newlead")
```

See the [Bizmis Avatar Render skill](../../skills/bizmis-avatar-render/SKILL.md) for details and troubleshooting.

### Step 7 — Update product manifest (automated)

Run the product manifest sync to pick up the new lead's product image extensions:

```bash
npm run sync:product-manifest
```

### Step 8 — Update leads loader (manual)

Add the new lead's JSON import to `src/data/leads/index.ts`:

```typescript
import newlead from "./newlead.json";
// ... add to RAW_LEADS array
```

### Step 9 — Verify (cognitive — LLM)

Open the admin UI at `/admin/invite-cards/early-access/<lead-id>` and check:
- Logo visibility and contrast against the brand colour banner
- Product images load correctly
- Copy reads naturally
- Clerk avatar renders with correct shirt colour and logo stamp
- Email HTML size is reasonable (< 50 KB)

## JSON Schema

Each lead file lives at `src/data/leads/<id>.json`. Required fields:

```
id                 string       Kebab-case identifier (matches filename)
storeName          string       Display name
storeDomain        string       Domain without protocol
leadContactName    string|null  Contact first+last or null
leadContactLastName string|null Reserved
content            string       Custom HTML message (usually empty)
primaryColor       string       Hex — navbar background colour (often #FFFFFF)
secondaryColor     string|null  Secondary hex or null
pitchLine          string       One-sentence value prop
demoShopperPrompt  string       Shopper question for demo
demoBizmisReply    string       Bizmis follow-up for demo
demoProducts       array[3]     [{title, price, tag}, ...] — prices MUST be exact
country            string       Market label
vertical           string       Industry vertical (snake_case)
subNiche           string       Sub-niche (snake_case, can be empty)
```

Optional fields — invite-card top bar:
- `textColor`: store name text colour in banner. Set for white/light `primaryColor`.
- `logoColorOverlay`: hex to tint the top-bar logo. `null` = use native colours.
- `leadLogoScale`: logo size multiplier. Default 1.0, increase for wide wordmarks (1.6–1.8).

Optional fields — avatar shirt (independent from top bar):
- `avatarShirtColor`: hex for the avatar shirt. `null` = falls back to `primaryColor`.
- `avatarStampColorOverlay`: hex tint for the shirt stamp. `null` = native colours.
- `avatarStampImage`: filename in the lead folder used as shirt stamp (e.g. `"icon.svg"`). `null` = uses `logo.png`.

Optional fields — email copy:
- `demoFooterLine`: caption-style rephrase of pitchLine.
- `montageClerkCue`: custom text for the montage clerk cue.

Derived by the TS loader (NOT stored in JSON):
- `couponCode`: auto-generated as `BIZMIS-EARLY-ACCESS-<ID_UPPERCASE>`
- `orderInBatch`: position in the `RAW_LEADS` array (1-based)
- `logoImagePath`: `/invite-cards/leads/<id>/logo.png`
- `clerkAvatarImagePath`: `/invite-cards/leads/<id>/clerk-avatar.png`
- `product{A,B,C}ImagePath`: from `leadEarlyAccessProductManifest.ts`

## Updating an existing lead

```python
from lead_onboarding import refresh_lead

fresh = refresh_lead("molekule", "https://molekule.com")
print(fresh.summary())
# Review changes, then selectively update the JSON
```

## Package structure

```
scripts/lead_onboarding/
  __init__.py    Public API: extract_store_data, save_lead, download_lead_assets, refresh_lead
  _config.py     Paths, constants, field lists
  _brand.py      Brand colour extraction (HTTP, HTMLParser)
  _logo.py       Logo extraction (inline SVG, favicon, OG image)
  _products.py   Product catalog (Shopify products.json)
  _assets.py     Image download and optimisation (Pillow)
  _json_io.py    JSON read/write/validate
```

## Common edge cases

| Issue | Solution |
|-------|----------|
| Non-Shopify store (no products.json) | Products list will be empty. Browse the store manually and copy exact prices. NEVER fabricate prices. |
| Logo is AVIF disguised as PNG | The `early_access_avatars._logo._ensure_real_png` re-encodes on avatar generation. |
| Scraper only finds favicons, not header logo | Browse the store, inspect the `<header>` / `<nav>` HTML manually. Check shop subdomains (e.g. `us-shop.domain.me`). Shopify logos are usually at `/cdn/shop/files/logo*.svg`. |
| SVG logo needs PNG conversion | Use `early_access_avatars._logo.svg_to_png(svg_path, png_path, width=400)`. |
| White navbar + colourful logo | Rule A: `primaryColor: #FFFFFF`, `logoColorOverlay: null`. Set `textColor` to brand accent or dark colour. |
| White navbar + colourless logo + brand accent | Rule B: `primaryColor` = accent colour, `logoColorOverlay: #ffffff`. |
| White navbar + colourless logo + no accent | Rule A: `primaryColor: #FFFFFF`, `logoColorOverlay: null`. |
| Dark/coloured navbar | Rule A: `primaryColor` = navbar bg. Logo is usually white — set `logoColorOverlay: #ffffff` only if native logo is dark. |
| Avatar shirt + banner don't match the store | Top bar and shirt are independent — re-evaluate each separately. |
| Shirt looks same as top bar, too repetitive | Find a compact icon and/or use a different brand colour for the shirt. |
| No compact icon for stamp | Use the full wordmark — it's fine if compact enough. Don't force-create icons. |
| Product image URLs return 404 | Try the store's shop subdomain CDN. Check that full paths (not truncated) are used. Some stores use different CDN hosts. |

## Lessons learned (update as new patterns emerge)

- **Top bar and shirt are independent compositions**: The invite-card top bar replicates the navbar (Rule A/B). The avatar shirt is curated separately — pick the best brand colour and a compact icon where available. They may end up the same (when the navbar is already the brand primary) or different (when the navbar is white/neutral but the brand has a clear accent colour in buttons/CTAs).
- **Two-rule top bar composition**: Rule A (default) replicates the navbar. Rule B (accent exception) uses the brand accent when the navbar is colourless. The key discriminator is whether the logo on the navbar has distinctive colour — if yes, Rule A; if it's plain black/white/grey, check for a brand accent and use Rule B.
- **Favicons vs. logos vs. icons**: The **top bar** always uses the full wordmark. The **shirt stamp** prefers a compact icon (favicon, extracted SVG element) when available; falls back to the full wordmark.
- **Prices must be exact**: Even rounding from `$179.99` to `$180` is wrong. Use the exact price string from the API. If uncertain, use the `products.json` price field.
- **JS-rendered sites**: Static HTTP parsing may miss header images on JS-heavy sites. Always try the Shopify shop subdomain as a fallback — Shopify themes render logos server-side. Some logos only exist in marketing PNGs on CDN — crop as needed.
- **Tint is about contrast on the surface**: For the top bar, tint the logo for contrast against `primaryColor`. For the shirt, tint the stamp for contrast against `avatarShirtColor`. These decisions are independent.
