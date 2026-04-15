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

**Rule B (accent exception) — Navbar is colourless but the brand has a clear accent.** The navbar is white/light AND the logo on it is also colourless (plain black/white/grey wordmark), BUT the brand has a strong, distinctive accent colour visible elsewhere on the site (buttons, CTAs, section backgrounds). In this case, use the brand accent as `primaryColor` and tint the logo to contrast against it (`logoColorOverlay: "#ffffff"` for dark accents). **Rule B requires the logo to be a flat mark** — if the logo is a detailed emblem, use Rule C instead (dark banner + accent) so the emblem keeps native colours.

**Rule C (dark navbar + separate accent) — Navbar is dark but the brand accent is a different colour.** The navbar is dark (black/charcoal) AND the brand has a strong accent colour (red, blue, etc.) used in CTAs/buttons that is NOT the navbar background. In this case, set `bannerColor` to the dark navbar colour and `primaryColor` to the brand accent. The accent drives product-card borders, browser dots, and waveform glow while the banner stays true to the navbar.

| Field              | Decision criteria                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `primaryColor`     | **Rule A**: navbar background colour. **Rule B**: brand accent colour. **Rule C**: brand accent colour.                                                                 |
| `bannerColor`      | **Rule C only**: navbar background hex (e.g. `#252525`). `null`/omitted for Rules A and B (banner defaults to `primaryColor`).                                          |
| `textColor`        | Store name text colour in the banner. For white/light `primaryColor`, use the brand accent or a dark colour. For dark `primaryColor`, leave `null` (defaults to white). |
| `logoColorOverlay` | **Rule A**: `null`. **Rule B**: `#ffffff` (flat marks only — if emblem, use Rule C instead). **Rule C**: `null`. See logo tint decision table below.                    |
| `secondaryColor`   | Usually `null`. Set only if the brand has a clear secondary colour.                                                                                                     |

**Logo selection for top bar**: ALWAYS use the full logo as it appears in the store's header/navbar. This is typically a wordmark (icon + text), NOT a favicon.

#### Logo tint decision (critical — applies to both banner and shirt stamp)

Before setting `logoColorOverlay` or `stamp_color_overlay`, classify the logo:

| Category                 | Description                                                                                                                                                                         | Examples                                                                                     | Can tint?                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Flat mark**            | Simple wordmark, silhouette, or flat geometric symbol. One shape, no internal detail.                                                                                               | "FLOYD" text, Nike swoosh, Apple logo, "pura" in a circle                                    | **Yes** — safe to recolour to a single solid colour.                  |
| **Flat wordmark + icon** | Text next to a simple icon/monogram. Both elements are flat with no internal contrast.                                                                                              | gorjana "gg" + text, Nanoleaf leaf + text                                                    | **Yes** — safe to recolour; internal separations are just whitespace. |
| **Detailed emblem**      | Badge, crest, roundel, or seal with internal text, fine lines, contrast between foreground/background, or multiple graphic elements that rely on colour differences for legibility. | UroTuning eagle roundel, Bulova "150" anniversary mark, sports team crests, university seals | **No** — tinting destroys internal detail. Preserve native colours.   |

**Decision rule**: Recolour to a solid tint only when doing so preserves legibility and all internal detail. If the logo has internal separations that depend on colour contrast to be readable (text inside a circle, an icon inside a badge, fine lines within a crest), those separations will vanish under a flat tint — keep native colours instead.

**When you cannot tint but need contrast**: Choose a banner/shirt colour that naturally contrasts with the logo's existing colours. For a logo with dark elements on a light internal background (like UroTuning), a dark banner provides the needed contrast without destroying detail.

#### 2b — Avatar shirt composition

Decide the shirt colour and stamp image **independently** from the top bar. The goal is to make the avatar look like a branded store clerk — not to repeat the invite-card banner.

**Shirt colour rules**:

1. If the store has a **clear primary / accent colour** visible in buttons, CTAs, UI widgets (not just in the logo) → use that colour as `avatarShirtColor`.
2. If the navbar is already coloured and that colour _is_ the brand primary → the shirt colour will match the top bar naturally (no need to set `avatarShirtColor`; it falls back to `primaryColor`).
3. If no clear primary colour exists → omit `avatarShirtColor` (falls back to `primaryColor`).

**Stamp image rules**:

1. If a **compact brand icon** (leaf, flame, geometric mark, etc.) can be found or extracted — use it as `avatarStampImage`. Icons read better on a shirt than full wordmarks.
2. If no compact icon exists, the full logo (`logo.png`) is used automatically. This is fine for stores whose wordmark is compact enough.

**Stamp tint rules** (readability on the shirt colour):

First, classify the stamp image using the same logo tint decision table above (flat mark → can tint, detailed emblem → cannot tint). Then:

- **Flat mark/wordmark on a dark/mid shirt** → tint `#ffffff` for contrast.
- **Flat mark/wordmark on a light shirt** → tint `#000000` or the brand primary.
- **Detailed emblem** → set `stamp_color_overlay: null` (native colours). The shirt colour **must** provide natural contrast for the emblem — use the same colour as the banner background (e.g. dark/neutral), **never** a bright accent that the emblem was not designed to sit on. If the emblem is too complex for the small stamp area, find a simpler compact icon instead.
- If shirt colour matches top bar and the top bar logo already contrasts → stamp tint can match `logoColorOverlay`.

| Field                     | Decision criteria                                                          |
| ------------------------- | -------------------------------------------------------------------------- |
| `avatarShirtColor`        | Brand primary / accent hex. `null` = falls back to `primaryColor`.         |
| `avatarStampColorOverlay` | Stamp tint hex for contrast on the shirt. `null` = native colours.         |
| `avatarStampImage`        | Filename in the lead folder (e.g. `"icon.svg"`). `null` = uses `logo.png`. |

#### Pattern archetypes — how top bar and shirt relate

| Archetype                                                 | Top bar                                    | Shirt                                                                         | When to apply                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Coloured navbar = brand primary**                       | Coloured bg, white/contrasting wordmark    | Same colour, same or compact icon                                             | The navbar bg is already the brand's primary colour. Shirt naturally matches. No need to set `avatarShirtColor`.                                                                                                                                                                           |
| **White navbar + colourful logo + accent colour in UI**   | White bg, colourful wordmark               | Use the accent/primary colour (from buttons, CTAs), compact icon tinted white | The navbar is white but the brand has a clear primary used in UI widgets. A white shirt would look bland and duplicate the banner; using the accent colour makes the avatar feel like a real employee. If a compact icon (leaf, flame, monogram) exists, prefer it over the full wordmark. |
| **White navbar + colourful logo + no separate accent**    | White bg, colourful wordmark               | Falls back to top bar (white shirt, native wordmark)                          | The logo colour is distinctive but there's no separate UI accent. Shirt matches top bar.                                                                                                                                                                                                   |
| **White navbar + colourless logo + brand accent**         | Uses accent as bg (Rule B), white wordmark | Same as top bar                                                               | Rule B already used the accent for the top bar. Shirt matches naturally.                                                                                                                                                                                                                   |
| **White navbar + colourless logo + no accent**            | White bg, native wordmark                  | Falls back to top bar (white shirt, native wordmark)                          | No colour to use anywhere. Shirt = top bar.                                                                                                                                                                                                                                                |
| **Dark navbar + accent colour in UI (Rule C, flat icon)** | Dark bg via `bannerColor`, native logo     | Uses accent as `primaryColor`, compact icon tinted white                      | The navbar is dark/charcoal and the logo is multi-colour but has a separable flat icon/monogram. Use `bannerColor` for the dark navbar, `primaryColor` for the accent. Tint only the flat compact icon for the stamp.                                                                      |
| **Dark navbar + accent colour in UI (Rule C, emblem)**    | Dark bg via `bannerColor`, native logo     | **Same dark colour as banner**, untinted emblem stamp                         | Same as above but the logo is a detailed emblem (no separable flat icon). The shirt must also use the banner colour so the untinted emblem stays readable. A bright accent shirt would destroy emblem legibility. `primaryColor` still drives accents (product borders, dots, price text). |

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

| Field                | Description                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| `pitchLine`          | One sentence: how Bizmis helps THIS store's shoppers. Pattern: "Help/Guide [audience] [action] by [criteria]." |
| `salesShopperPrompt` | Realistic shopper question in first person. Natural voice, specific need.                                      |
| `salesBizmisReply`   | Conversational follow-up that narrows the need. Start with "Got it —" and offer a binary choice.               |
| `salesFooterLine`    | Rephrase of pitchLine as a caption. Pattern: "Guides [audience] by [criteria]."                                |
| `montageShopperCue`  | Montage shopper line. Vague exploring intent, max 80 chars. See rules below.                                   |
| `montageClerkCue`    | Montage clerk line. Full sentence with product name and reason, max 80 chars. See rules below.                 |

#### Montage cue copywriting rules

The invite card montage shows a mini assisted-sales story: a shopper asks for help, Bizmis recommends a product with a reason. These are different from `salesShopperPrompt`/`salesBizmisReply` (which are specific Q&A for the assisted-sales demo).

**`montageShopperCue`** (appears at the top of the montage, italic, in curly quotes added by the renderer):

- Max 80 characters (quotes are NOT stored, only the inner text)
- Vague exploring intent: the shopper knows WHAT they want but not WHICH product
- First person, natural voice, slightly uncertain
- Domain-relevant to the store's niche
- Pattern: `"I want/need [desire] but [uncertainty]."` or `"Looking for [category], not sure [dimension]."`
- Never use em-dash characters. Use commas, periods, or "but" instead.

**`montageClerkCue`** (appears below the product cards, product name auto-highlighted in bold + primaryColor):

- Max 80 characters
- Full sentence including the product name written naturally (no dynamic injection)
- Confident recommendation with a short reason showing domain expertise
- Pattern: `"The [Product Name], [short reason]."` or `"[Product Name] is perfect for [reason]."`
- The product name MUST match `salesProducts[salesRecommendedIndex].title` exactly
- Never use em-dash characters. Use commas, periods, or natural connectors.
- The renderer finds the product title via string match and highlights it in bold + primaryColor.

Examples:

- Guitar amps: shopper `I want great tone at home but don't know which amp.` / clerk `The Spark MINI, big tone at bedroom-friendly volume.`
- Jewelry: shopper `I'd love to layer necklaces but not sure where to begin.` / clerk `The Birthstone Halo Charm, a perfect first layering piece.`
- Auto parts: shopper `My E46 needs new control arms, not sure what level.` / clerk `The E46 Control Arm Kit, OEM fit with upgrade durability.`

#### Customer support demo copywriting rules

The invite card includes a second mockup (phone format) showing a customer support interaction. This demonstrates that Bizmis handles post-sale support using the store's policies.

**Key constraint: scenarios must be genuinely post-sale** (the customer already purchased and received the product). NEVER use pre-sale questions (fitment checks, warranty inquiries, product comparisons). NEVER use negative/drama scenarios (returns, refunds, complaints). Good post-sale topics: setup/pairing help, missing hardware, firmware issues, care after use, order tracking, quality guarantee claims. Choose the most natural scenario per store's vertical.

Fields (all max 60 characters, no em-dashes):

| Field                | Description                                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supportShopperCue`  | Customer's post-sale support issue mentioning a product they already own. Pattern: `"My [Product] [specific issue after delivery/use]."`                         |
| `supportClerkCue`    | Bizmis response resolving the issue. Pattern: `"[Positive resolution mentioning Product]."`                                                                      |
| `supportPolicyName`  | The policy/guide chip: `"Troubleshooting Guide"`, `"Shipping Support"`, `"Quality Guarantee"`, `"Setup Guide"`, `"Care Guide"`, etc.                             |
| `supportProductName` | The specific product name referenced in both cues. Highlighted in bold by the renderer. Can be any product the store sells (not limited to the 3 demo products). |

**Closed list of policy types** (use ONLY these values for `supportPolicyName`):

| Policy type             | When to use                                                                       | Example scenarios                                                      |
| ----------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `Troubleshooting Guide` | Device not working as expected, resets, error codes, firmware, pairing issues     | Won't pair, display error, firmware failed, hum/noise, won't power on  |
| `Care Guide`            | Cleaning, maintenance routines, material care, consumable replacement, charging   | Stain removal, wash instructions, filter replacement, battery charging |
| `Warranty Policy`       | Defect after purchase, broken/cracked parts, lifetime coverage claims             | Cracked tool, scratched crystal, loose clasp, stuck zipper             |
| `Installation Guide`    | Physical assembly, mounting, torque specs, fitment after install, rattles/wobbles | Wobbly leg, exhaust rattle, dimmer compatibility, bolt torque          |
| `Setup Guide`           | Initial WiFi pairing, first-time configuration, calibration, adjustment           | WiFi setup, headset tightening, camera recalibration                   |
| `Shipping Support`      | Missing parts in shipment, wrong item delivered, incomplete kit                   | Missing bolt bag, missing intake manifold, wrong part shipped          |
| `Service Guide`         | Scheduled maintenance intervals, professional service recommendations             | Watch running fast (service interval), routine service schedule        |

Examples:

- Guitar amps: shopper `My Spark MINI firmware update failed halfway through.` / clerk `No worries, restart your Spark MINI and retry via USB.` / policy `Troubleshooting Guide`
- Jewelry: shopper `My Birthstone Halo Charm arrived with a loose clasp.` / clerk `We'll send a replacement Birthstone Halo Charm today.` / policy `Quality Guarantee`
- Auto parts: shopper `My Control Arm Kit E46 is missing one bolt bag.` / clerk `We'll ship the missing Control Arm Kit E46 hardware now.` / policy `Shipping Support`

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
    "bannerColor": null,              # Rule C only: navbar bg when ≠ primaryColor
    "textColor": null,
    "logoColorOverlay": null,         # NEVER set for multi-colour logos
    "avatarShirtColor": "#..." or null,      # null → falls back to primaryColor
    "avatarStampColorOverlay": "#..." or null, # null → falls back to logoColorOverlay
    "avatarStampImage": "icon.svg" or null,    # null → uses logo.png
    "pitchLine": "...",
    "salesShopperPrompt": "...",
    "salesBizmisReply": "...",
    "salesProducts": [...],
    "salesRecommendedIndex": 0,
    "salesFooterLine": "...",
    "montageShopperCue": "...",
    "montageClerkCue": "...",
    "supportShopperCue": "...",
    "supportClerkCue": "...",
    "supportPolicyName": "...",
    "supportProductName": "...",
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

### Step 6 — Choose avatar character and generate (cognitive + automated)

#### 6a — Choose the avatar characters (sales + support)

Each lead gets **two** avatars: a **sales avatar** (`avatar_id`) for the assisted-sales montage and a **support avatar** (`support_avatar_id`) for the customer support phone mockup.

**Critical rule: the support avatar MUST be the opposite gender from the sales avatar.** This is non-negotiable.

**Available avatars:**

| ID       | Gender | Persona archetype                                                             |
| -------- | ------ | ----------------------------------------------------------------------------- |
| `adrian` | M      | Nerdy/friendly (orange glasses) — tech, education, gadgets, approachable      |
| `amber`  | F      | Warm — lifestyle brands, home/decor, beauty                                   |
| `echo`   | M      | Hipster (beard + headphones) — audio, music, creative, cycling                |
| `kiran`  | M      | Tech-savvy — electronics, SaaS, broadcast, smart home                         |
| `luca`   | M      | European/design — furniture, fashion, Euro automotive                         |
| `matt`   | M      | Professional/classic (tie) — heritage, luxury, B2B, trade, established brands |
| `mia`    | F      | Modern/cute (dark bob + bangs) — beauty, skincare, younger audience           |
| `teo`    | M      | Casual (baseball cap) — automotive, outdoor, blue-collar, garage              |
| `victor` | M      | Edgy/bold (orange buzz, ear piercing) — streetwear, gaming, energy            |
| `will`   | M      | Authoritative — security, professional services, mid-century design           |
| `yue`    | F      | Fashion-forward (glasses + dress) — jewelry, women's fashion, editorial       |
| `yusuke` | M      | Refined — Japanese culture, watches, minimalist, precision                    |

GREA
**Sales avatar selection** (apply in order):

1. **Sector gender fit** — feminine-leaning sectors (jewelry, beauty, fashion, shapewear, fragrance) → `amber` or `yue`. Masculine-leaning sectors (automotive, tools, security, exhaust, engine) → clearly male avatar.
2. **Direct trait match** — Echo for audio brands (headphones), Yusuke for JDM, Yue for women's jewelry.
3. **Vertical fit** — automotive/garage → Teo. Luxury/watches → Yusuke or Matt. Home/lifestyle → Amber or Luca. Tech/electronics → Kiran.
4. **Brand tone** — playful/casual → Teo or Echo. Professional/B2B → Will or Matt. Refined → Yusuke or Luca.
5. **Matt exclusion** — Matt's tie persona does NOT fit highly technical products (power stations, electronics hardware) or blue-collar verticals (mechanic tools, automotive parts). Use Kiran, Teo, or Victor instead.
6. **Distribution is lead-driven** — avatar selection depends entirely on brand fit, NOT on even distribution across the pool. Duplicates are fine when the persona matches.

**Support avatar selection** (after sales avatar is chosen):

- Sales avatar is male → support = `amber` or `yue` (pick whichever fits the brand better)
- Sales avatar is female → support = any male avatar that fits the brand tone

**Render format differences:**

|               | Sales avatar             | Support avatar         |
| ------------- | ------------------------ | ---------------------- |
| Output file   | `sales-avatar.png`       | `support-avatar.png`   |
| Widget format | Desktop (`mobile=False`) | Mobile (`mobile=True`) |
| Framing       | `upper_body`             | `head`                 |
| Animation     | `presenting_left`        | `idle_neutral`         |
| Expression    | `E`                      | `E`                    |
| Widget state  | `listening`              | `speaking`             |

#### 6b — Update registry and generate

After assets are saved, **update the lead's entry in `scripts/early_access_avatars/_config.py :: LEAD_REGISTRY`** with the avatar-specific fields:

```python
# Add to LEAD_REGISTRY in _config.py:
{"id": "newlead", "primary_color": "#...", "logo_color_overlay": ...,
 "avatar_id": "echo", "support_avatar_id": "amber",
 "shirt_color": "#...", "stamp_color_overlay": "...", "stamp_image": "..."},
# avatar_id and support_avatar_id are required.
# support_avatar_id MUST be opposite gender from avatar_id.
# Only include shirt_color / stamp_color_overlay / stamp_image when they
# differ from primary_color / logo_color_overlay / default "logo.png".
```

Then generate both avatars:

```python
from early_access_avatars import generate_lead, generate_support_lead

generate_lead("newlead")
generate_support_lead("newlead")
# Override for testing: generate_lead("newlead", avatar_id="will")
```

**Widget wave ring colour:** Python `resolve_widget_wave_color()` mirrors `deriveMontagePalette()` in `leadEarlyAccessEmailHtml.ts`: pick accent (primary if contrast on white ≥ 1.8, else `textColor` if it passes, else primary), apply caption correction (if contrast &lt; 2.4 clamp HSL lightness ≤ 52 and saturation ≤ 65), then if still extremely light (luminance &gt; 0.85) use slate `#475569`. That hex is passed as `--wave-color` to Blender so the ring matches the email (policy chip, montage product accent, waveforms).

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

### Step 9 — Visual verification (browser + cognitive)

Use browser MCP tools to screenshot both the live store and the generated invite card, then visually compare them to catch logo/colour mismatches before shipping.

**Prerequisites**: Dev server running (`npm run dev`) so the admin preview is available at `localhost:8080`.

**Per-lead process:**

1. `browser_navigate` to `https://{storeDomain}` — capture the store's real header/navbar.
2. `browser_navigate` to `http://localhost:8080/admin/invite-cards/early-access/{leadId}` — capture the generated invite card.
3. Visually compare both screenshots against this checklist:

| Check                    | What to look for                                                                                                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Banner ↔ navbar          | Banner background colour must match the store's navbar background. If navbar is dark but accent is elsewhere, `bannerColor` must be set separately from `primaryColor`.                                                                                                              |
| Logo match               | Invite card logo matches the store's header wordmark (shape, text). Must NOT be a product sub-brand or favicon.                                                                                                                                                                      |
| Logo tint decision       | **Classify the logo**: flat mark/wordmark → may be tinted. Detailed emblem/badge/roundel with internal text or contrast → MUST show native colours. If a detailed emblem appears as a flat single-colour blob, this is wrong — remove the tint (`logoColorOverlay: null`).           |
| Stamp tint decision      | Same classification for the shirt stamp. If a detailed emblem stamp lost its internal detail, remove the tint (`stamp_color_overlay: null`).                                                                                                                                         |
| Stamp ↔ shirt legibility | If the stamp is an untinted emblem, the shirt colour **must** be a colour the emblem was designed to sit on (typically the same dark/neutral banner colour). A bright accent shirt under an untinted emblem destroys legibility — fix by setting `shirt_color` to the banner colour. |
| Colour match             | `primaryColor` accent (product card borders, browser dots, waveform) matches the store's brand accent / dominant CTA colour.                                                                                                                                                         |
| Logo legibility          | Logo is readable on the banner (sufficient contrast with the banner background).                                                                                                                                                                                                     |
| Avatar shirt             | Shirt colour looks branded (not default/generic). Stamp is legible on the shirt. For untinted emblems, shirt must match banner background.                                                                                                                                           |
| Montage shopper cue      | Shopper line relates to the store's niche and reads as a vague exploring question (not a specific product query). Max 80 chars. No em-dashes.                                                                                                                                        |
| Montage clerk cue        | Clerk line references the correct recommended product (matching `salesProducts[salesRecommendedIndex].title` exactly) with a plausible domain reason. Max 80 chars. No em-dashes. Product name appears highlighted in bold + primaryColor in the rendered preview.                   |
| Support avatar           | Support avatar uses a different character than the sales avatar and is the opposite gender. Mobile widget format.                                                                                                                                                                    |
| Support shopper cue      | Customer question mentions a specific product, relates to a positive policy topic (NOT returns/refunds). Max 60 chars. No em-dashes.                                                                                                                                                 |
| Support clerk cue        | Bizmis response resolves the question naturally, references the same product. Max 60 chars. No em-dashes. Product name highlighted in bold + accent.                                                                                                                                 |
| Support policy chip      | Tool chip reads "Answered via {policy}" with a relevant policy name (Warranty, Care Guide, Shipping, etc.). Not "Return Policy".                                                                                                                                                     |

4. If any check fails → fix the issue (re-download logo, adjust `bannerColor`/`primaryColor`/`logoColorOverlay` in the JSON and `_config.py`, regenerate avatar) → re-screenshot the invite card → re-verify.

**Common fixes:**

| Symptom                                              | Fix                                                                                                                                                                                                         |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Banner is brand accent but navbar is dark            | Set `bannerColor` to navbar colour, keep `primaryColor` as the accent (Rule C).                                                                                                                             |
| Emblem/badge logo appears as flat single-colour blob | Logo is a detailed emblem that was wrongly tinted. Set `logoColorOverlay: null` to restore native colours. Choose a banner colour with natural contrast.                                                    |
| Shirt stamp lost internal detail (flat blob)         | Set `stamp_color_overlay: null`. If the emblem is too complex at stamp size, find a simpler compact icon (`avatarStampImage`).                                                                              |
| Untinted emblem on bright/accent shirt (unreadable)  | The emblem was not designed for that background. Set `shirt_color` to the same colour as `bannerColor` (the dark/neutral colour the emblem naturally sits on). `primaryColor` still drives product accents. |
| Product accents look wrong colour                    | `primaryColor` drives accents. Adjust it to the brand's CTA/button colour.                                                                                                                                  |
| Shirt matches banner but should be different         | Set `shirt_color` / `avatarShirtColor` explicitly to the brand accent. (Only valid for flat-mark stamps that can be tinted for contrast — never for untinted emblems.)                                      |

**Batching strategy**: Process ~5 leads per batch. For each batch, screenshot all store headers, then all invite cards, compare, fix issues, re-verify.

### Step 10 — Final check (cognitive — LLM)

Open the admin UI at `/admin/invite-cards/early-access/<lead-id>` and check:

- Logo visibility and contrast against the brand colour banner
- Product images load correctly
- Copy reads naturally
- Assisted-sales avatar renders with correct shirt colour and logo stamp
- Support avatar renders in mobile format with a different character (opposite gender)
- Support mockup shows per-lead content (not hardcoded fallbacks)
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
salesShopperPrompt  string      Assisted-sales demo: shopper question (specific product need)
salesBizmisReply    string      Assisted-sales demo: Bizmis follow-up (binary choice)
salesProducts       array[3]   [{title, price, tag}, ...] — prices MUST be exact
salesRecommendedIndex  0|1|2   Index into salesProducts for the recommended pick
montageShopperCue  string       Montage shopper line (vague exploring, max 80 chars)
montageClerkCue    string       Montage clerk line (product name + reason, max 80 chars)
supportShopperCue  string       Support demo: customer question (max 60 chars)
supportClerkCue    string       Support demo: Bizmis response (max 60 chars)
supportPolicyName  string       Support demo: policy chip label (e.g. "Warranty Policy")
supportProductName string       Support demo: product to highlight in both cues
country            string       Market label
vertical           string       Industry vertical (snake_case)
subNiche           string       Sub-niche (snake_case, can be empty)
```

Optional fields — invite-card top bar:

- `bannerColor`: banner background hex when it differs from `primaryColor` (Rule C). `null`/omitted = uses `primaryColor`.
- `textColor`: store name text colour in banner. Set for white/light `primaryColor`.
- `logoColorOverlay`: hex to tint the top-bar logo. `null` = use native colours. NEVER set for multi-colour logos.
  Optional fields — avatar shirt (independent from top bar):
- `avatarShirtColor`: hex for the avatar shirt. `null` = falls back to `primaryColor`.
- `avatarStampColorOverlay`: hex tint for the shirt stamp. `null` = native colours.
- `avatarStampImage`: filename in the lead folder used as shirt stamp (e.g. `"icon.svg"`). `null` = uses `logo.png`.

Optional fields — email copy:

- `salesFooterLine`: caption-style rephrase of pitchLine.
- `montageShopperCue`: vague exploring shopper line for the montage (max 80 chars). See Step 4 rules.
- `montageClerkCue`: full clerk recommendation for the montage with product name and reason (max 80 chars). See Step 4 rules.

Derived by the TS loader (NOT stored in JSON):

- `couponCode`: auto-generated as `BIZMIS-EARLY-ACCESS-<ID_UPPERCASE>`
- `orderInBatch`: position in the `RAW_LEADS` array (1-based)
- `logoImagePath`: `/invite-cards/leads/<id>/logo.png`
- `salesAvatarImagePath`: `/invite-cards/leads/<id>/sales-avatar.png`
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

| Issue                                              | Solution                                                                                                                                                                                        |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Non-Shopify store (no products.json)               | Products list will be empty. Browse the store manually and copy exact prices. NEVER fabricate prices.                                                                                           |
| Logo is AVIF disguised as PNG                      | The `early_access_avatars._logo._ensure_real_png` re-encodes on avatar generation.                                                                                                              |
| Scraper only finds favicons, not header logo       | Browse the store, inspect the `<header>` / `<nav>` HTML manually. Check shop subdomains (e.g. `us-shop.domain.me`). Shopify logos are usually at `/cdn/shop/files/logo*.svg`.                   |
| SVG logo needs PNG conversion                      | Use `early_access_avatars._logo.svg_to_png(svg_path, png_path, width=400)`.                                                                                                                     |
| White navbar + colourful logo                      | Rule A: `primaryColor: #FFFFFF`, `logoColorOverlay: null`. Set `textColor` to brand accent or dark colour.                                                                                      |
| White navbar + colourless logo + brand accent      | Rule B: `primaryColor` = accent colour, `logoColorOverlay: #ffffff`.                                                                                                                            |
| White navbar + colourless logo + no accent         | Rule A: `primaryColor: #FFFFFF`, `logoColorOverlay: null`.                                                                                                                                      |
| Dark/coloured navbar                               | Rule A: `primaryColor` = navbar bg. Logo is usually white — set `logoColorOverlay: #ffffff` only if native logo is dark.                                                                        |
| Dark navbar + brand accent ≠ navbar bg (flat icon) | Rule C: `bannerColor` = navbar bg, `primaryColor` = accent. `logoColorOverlay: null`. Set `shirt_color` to accent in `_config.py`, tint stamp white.                                            |
| Dark navbar + brand accent ≠ navbar bg (emblem)    | Rule C: `bannerColor` = navbar bg, `primaryColor` = accent. `logoColorOverlay: null`. Set `shirt_color` to **banner colour** (not accent) so emblem stays legible. `stamp_color_overlay: null`. |
| Detailed emblem/badge tinted to one colour         | Remove `logoColorOverlay` (set to `null`). Classify first: flat marks can tint, detailed emblems/badges/roundels with internal contrast cannot. Also remove `stamp_color_overlay`.              |
| Avatar shirt + banner don't match the store        | Top bar and shirt are independent — re-evaluate each separately.                                                                                                                                |
| Shirt looks same as top bar, too repetitive        | Find a compact icon and/or use a different brand colour for the shirt.                                                                                                                          |
| No compact icon for stamp                          | Use the full wordmark — it's fine if compact enough. Don't force-create icons.                                                                                                                  |
| Product image URLs return 404                      | Try the store's shop subdomain CDN. Check that full paths (not truncated) are used. Some stores use different CDN hosts.                                                                        |

## Lessons learned (update as new patterns emerge)

- **Top bar and shirt are independent compositions**: The invite-card top bar replicates the navbar (Rule A/B). The avatar shirt is curated separately — pick the best brand colour and a compact icon where available. They may end up the same (when the navbar is already the brand primary) or different (when the navbar is white/neutral but the brand has a clear accent colour in buttons/CTAs).
- **Two-rule top bar composition**: Rule A (default) replicates the navbar. Rule B (accent exception) uses the brand accent when the navbar is colourless. The key discriminator is whether the logo on the navbar has distinctive colour — if yes, Rule A; if it's plain black/white/grey, check for a brand accent and use Rule B.
- **Favicons vs. logos vs. icons**: The **top bar** always uses the full wordmark. The **shirt stamp** prefers a compact icon (favicon, extracted SVG element) when available; falls back to the full wordmark.
- **Prices must be exact**: Even rounding from `$179.99` to `$180` is wrong. Use the exact price string from the API. If uncertain, use the `products.json` price field.
- **JS-rendered sites**: Static HTTP parsing may miss header images on JS-heavy sites. Always try the Shopify shop subdomain as a fallback — Shopify themes render logos server-side. Some logos only exist in marketing PNGs on CDN — crop as needed.
- **Tint is about contrast on the surface**: For the top bar, tint the logo for contrast against the banner colour. For the shirt, tint the stamp for contrast against `avatarShirtColor`. These decisions are independent.
- **Logo tint classification is a first-class decision**: Every logo must be classified before any tint is applied. Flat marks (wordmarks, silhouettes, simple geometric symbols) can safely be recoloured to a solid tint. Detailed emblems, badges, roundels, and crests (anything with internal text, fine lines, or elements that rely on colour contrast to be legible) must keep native colours — tinting destroys internal detail and turns them into unrecognizable blobs. UroTuning's eagle roundel is the canonical example of a logo that must never be tinted. This classification must be double-checked in visual QA.
- **Banner ≠ accent when navbar is dark**: When the store's navbar is dark (charcoal/black) and the brand accent (buttons, CTAs) is a different colour, use `bannerColor` for the dark navbar and `primaryColor` for the accent. This was the UroTuning lesson: dark navbar (#252525) with red accent (#CC0000). The banner must visually replicate the navbar, while the accent drives product cards, browser dots, and price text.
- **Shirt colour for untinted emblems must match the banner, not the accent**: When a logo is a detailed emblem that cannot be tinted, the shirt stamp also cannot be tinted. The stamp will display in its native colours, so the shirt must use a background that the emblem was designed to sit on — typically the same dark/neutral banner colour. Placing an untinted emblem on a bright accent colour (e.g. red) destroys legibility because the emblem's internal colours clash with the background. UroTuning is the canonical example: the eagle roundel is unreadable on red, but perfectly legible on the dark #252525 banner colour. Rule of thumb: **if `stamp_color_overlay` is `null`, then `shirt_color` should equal `bannerColor` (or `primaryColor` if no banner override)**.
