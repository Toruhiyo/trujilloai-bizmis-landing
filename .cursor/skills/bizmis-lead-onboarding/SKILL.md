# Bizmis Lead Onboarding Skill

Onboard a new lead (or update an existing one) from a store name and URL. The process is split into **automated extraction** (Python) and **cognitive curation** (LLM), following an iterative workflow: extract → review → curate → save → verify.

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
- Logo candidates ranked by score (inline SVGs in header/nav score highest)
- Product catalog (title, price, type, image URL)

### Step 2 — Curate brand (cognitive — LLM)

Based on the extraction summary, decide:

| Field | Decision criteria |
|-------|------------------|
| `primaryColor` | Pick from theme-color, CSS vars, or the dominant brand colour visible on the site. Must be a hex string. |
| `textColor` | Set to a dark hex (e.g. `#222222`) when primaryColor is very light (white, pastel). Leave `null` otherwise. |
| `logoColorOverlay` | Set to `#ffffff` when the logo would disappear on the brand colour (e.g. dark logo on dark shirt). Leave `null` to use native logo colours. Match the invite-card header logic. |
| `leadLogoScale` | Default 1.0. Increase for narrow/small logos (e.g. 1.8 for wide wordmarks). |
| `secondaryColor` | Usually `null`. Set only if the brand has a clear secondary colour. |

### Step 3 — Curate products (cognitive — LLM)

From the product list, pick **3 products** that:
- Are diverse (different categories/use cases, not colour variants of the same item)
- Are mid-to-high price tier (avoid the cheapest accessories)
- Represent the store's core offering
- Would make a compelling recommendation comparison

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
primaryColor       string       Hex colour for brand
secondaryColor     string|null  Secondary hex or null
pitchLine          string       One-sentence value prop
demoShopperPrompt  string       Shopper question for demo
demoBizmisReply    string       Bizmis follow-up for demo
demoProducts       array[3]     [{title, price, tag}, ...]
country            string       Market label
vertical           string       Industry vertical (snake_case)
subNiche           string       Sub-niche (snake_case, can be empty)
```

Optional fields: `textColor`, `logoColorOverlay`, `leadLogoScale`, `demoFooterLine`, `montageClerkCue`.

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
| Non-Shopify store (no products.json) | Products list will be empty. Browse the store manually and fill `demoProducts` by hand. |
| Logo is AVIF disguised as PNG | The `early_access_avatars._logo._ensure_real_png` re-encodes on avatar generation. |
| SVG logo not in header | Increase search scope or download from page source manually. |
| Very light primaryColor | Set `textColor` to a dark value for readability. |
| Logo disappears on brand colour | Set `logoColorOverlay` to `#ffffff`. |

## Iterative improvement process

1. Run automated extraction
2. LLM reviews and curates (cognitive tasks)
3. Save and generate assets
4. Visually verify in admin UI
5. Fix edge cases manually
6. If a pattern emerges across multiple leads, improve the extraction code
