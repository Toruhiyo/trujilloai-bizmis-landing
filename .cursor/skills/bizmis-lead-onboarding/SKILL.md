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

Open the store in a browser and inspect the top navigation bar. The invite-card banner and avatar shirt must look like the store's brand identity. Apply one of two rules:

**Rule A (default) — Navbar has colour.** The navbar itself is coloured (red, dark navy, green…) OR the navbar is white/neutral but the logo displayed on it is colourful (e.g. Nanoleaf's green leaf wordmark, Jackery's orange wordmark). Replicate exactly: `primaryColor` = navbar bg, `logoColorOverlay` = `null` (native colours).

**Rule B (accent exception) — Navbar is colourless but the brand has a clear accent.** The navbar is white/light AND the logo on it is also colourless (plain black/white/grey wordmark), BUT the brand has a strong, distinctive accent colour visible elsewhere on the site (buttons, CTAs, section backgrounds). In this case, use the brand accent as `primaryColor` and tint the logo to contrast against it (`logoColorOverlay: "#ffffff"` for dark accents).

Examples:
- **Nanoleaf** → Rule A: white navbar + colourful green logo → `primaryColor: #FFFFFF`, `logoColorOverlay: null`
- **Mac Tools** → Rule A: red navbar + white logo → `primaryColor: #e31837`, `logoColorOverlay: null`
- **Molekule** → Rule B: white navbar + plain black wordmark, green accent (#108849) → `primaryColor: #108849`, `logoColorOverlay: #ffffff`
- **Hodinkee** → Rule A: white navbar + black logo, no clear accent → `primaryColor: #FFFFFF`, `logoColorOverlay: null`

Based on the extraction summary **and visual inspection of the store's navbar**, decide:

| Field | Decision criteria |
|-------|------------------|
| `primaryColor` | **Rule A**: navbar background colour. **Rule B**: brand accent colour. This becomes the invite-card banner bg AND the avatar shirt colour. |
| `textColor` | Store name text colour in the banner. For white/light `primaryColor`, use the brand accent or a dark colour. For dark `primaryColor`, leave `null` (defaults to white). |
| `logoColorOverlay` | **Rule A**: `null` (native colours). **Rule B**: `#ffffff` (or whatever contrasts with `primaryColor`). |
| `leadLogoScale` | Default 1.0. Increase for wide horizontal wordmarks (e.g. 1.6–1.8). |
| `secondaryColor` | Usually `null`. Set only if the brand has a clear secondary colour. |

**Logo selection**: ALWAYS use the full logo as it appears in the store's header/navbar. This is typically a wordmark (icon + text), NOT a favicon. The extraction's `header_img` candidates scored 50+ are preferred. If the scraper only found favicons, manually locate the header logo from the store's HTML or Shopify CDN (`/cdn/shop/files/`). Common patterns:
- Shopify stores: look for `<img>` in `<header>` → often at `//domain/cdn/shop/files/logo*.svg`
- Check both the main domain and any shop subdomain (e.g. `us-shop.nanoleaf.me`)

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

# Save the curated JSON
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

# Download assets
download_lead_assets(
    "newlead",
    logo_url=best_logo.get("url"),
    svg_source=best_logo.get("svg_source"),
    product_image_urls=product_urls,
)
```

### Step 6 — Generate avatar (automated)

After assets are saved, generate the clerk avatar using the avatar render skill:

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

Optional fields:
- `textColor`: store name text colour in banner. Set for white/light `primaryColor`.
- `logoColorOverlay`: hex to tint the logo. `null` = use native colours. Only set when native colours have poor contrast on `primaryColor`.
- `leadLogoScale`: logo size multiplier. Default 1.0, increase for wide wordmarks (1.6–1.8).
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
| Avatar shirt + banner don't match the store | First determine Rule A vs B, then re-check all fields. |
| Product image URLs return 404 | Try the store's shop subdomain CDN. Check that full paths (not truncated) are used. Some stores use different CDN hosts. |

## Lessons learned (update as new patterns emerge)

- **Two-rule brand composition**: Rule A (default) replicates the navbar. Rule B (accent exception) uses the brand accent when the navbar is colourless. The key discriminator is whether the logo on the navbar has distinctive colour — if yes, Rule A; if it's plain black/white/grey, check for a brand accent and use Rule B.
- **Favicons ≠ logos**: Favicons are often simplified icons (leaf, monogram). The invite card and avatar need the **full wordmark** as it appears in the navbar.
- **Prices must be exact**: Even rounding from `$179.99` to `$180` is wrong. Use the exact price string from the API. If uncertain, use the `products.json` price field.
- **JS-rendered sites**: Static HTTP parsing may miss header images on JS-heavy sites. Always try the Shopify shop subdomain as a fallback — Shopify themes render logos server-side. Some logos only exist in marketing PNGs on CDN (e.g. Jackery) — crop as needed.
- **Logo colour overlay is about contrast**: If native logo colours are visible on the shirt/banner colour, leave `logoColorOverlay: null`. Only override when contrast is poor. For Rule B leads, always set `logoColorOverlay` to a colour that contrasts with `primaryColor`.
