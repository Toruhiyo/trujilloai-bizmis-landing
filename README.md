# Bizmis Landing Site

The marketing site for **Bizmis** at [bizmis.ai](https://bizmis.ai) — landing page, pricing, FAQs, privacy policy, terms of service, and the asset/template generators for the outbound email campaigns.

This repo is **not part of the Bizmis runtime** — a standalone Vite + React site deployed independently to Vercel.

This README covers setup, scripts, and structure. For the Bizmis system context, see [Landing Site (Notion)](https://www.notion.so/357985ebf15f81b1a359c403ed79da8a). For the broader docs, see the [Bizmis Docs hub on Notion](https://www.notion.so/356985ebf15f811aacb9c5c0710b2552).

---

## Documentation

- **[Landing Site (Notion)](https://www.notion.so/357985ebf15f81b1a359c403ed79da8a)** — landing site's role in the Bizmis system.
- **[Bizmis Docs hub (Notion)](https://www.notion.so/356985ebf15f811aacb9c5c0710b2552)** — broader product, engineering, brand, marketing, and policy docs.
- **[Landing Page Copy & Structure (Notion)](https://www.notion.so/357985ebf15f81dba6e9fed4ef739e09)** — single source of truth for landing copy + section structure (auto-generated from this repo via the `retrieve-bizmis-landing-content` skill).
- **[Landing FAQs (Notion)](https://www.notion.so/357985ebf15f81a5b610fed4ef739e09)** — canonical FAQs (auto-generated from `src/data/faqs.ts` via the `retrieve-bizmis-faqs` skill).

---

## Canonical sources of truth in this repo

These files are the canonical source for content that appears on the live site **and** is referenced from the Bizmis docs hub:

| Canonical content | Source file |
|---|---|
| Landing page copy + section structure | `src/pages/Index.tsx` (and `src/components/`) |
| Pricing tiers + Early Bird logic | `src/components/Pricing.tsx` |
| FAQs (questions, answers, categories) | `src/data/faqs.ts` |
| Privacy Policy text | `src/pages/PrivacyPolicy.tsx` |
| Terms of Service text | `src/pages/Terms.tsx` |
| Brand colors + constants | `src/lib/bizmisBrandColors.ts` |

When any of these change, the corresponding Notion stub page automatically reflects the change via the retrieval skills — no manual sync needed.

---

## Prerequisites

- Node.js 18+
- npm

---

## Setup

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:8080` (Vite default).

---

## Scripts

### Build / dev

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR. |
| `npm run build` | Production build (runs `prebuild` first to sync lead manifests). |
| `npm run build:dev` | Development-mode build (with lead manifest sync). |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |

### Outbound funnel asset generators

These scripts power the Bizmis cold-outbound campaign assets (per-lead invite cards, early-access mockups, Instantly email templates). See the [Bizmis cold outbound funnel skills](https://www.notion.so/356985ebf15f81c9b8f3e51974c53474) (Go-to-Market) for the full pipeline.

| Script | Description |
|---|---|
| `npm run sync:lead-product-manifest` | Sync the per-lead product manifest from upstream sources. |
| `npm run fetch:lead-early-access-assets` | Fetch generated early-access assets per lead. |
| `npm run generate:mock-lead-invite-assets` | Generate per-lead mockup invite assets (PNG renders). |
| `npm run generate:montage-waveform` | Generate the waveform PNG used in support montages. |
| `npm run generate:email-compositions` | Generate composed email images. |
| `npm run generate:instantly-template` | Generate the Instantly email template HTML from the React invite-card source. |
| `npm run generate:instantly-lead-fields` | Generate the Instantly per-lead custom field set. |

---

## Project structure

```
├── src/
│   ├── pages/             # Route-level pages (Index, PrivacyPolicy, Terms, etc.)
│   ├── components/        # React components (Hero, Pricing, FAQs sections, etc.)
│   ├── data/              # Static data (faqs.ts, support-cases.ts, etc.)
│   ├── hooks/             # React hooks
│   ├── lib/               # Utilities + brand constants (bizmisBrandColors.ts)
│   └── styles/            # Global CSS
├── public/                # Static assets served as-is
├── scripts/               # Outbound funnel + asset generation scripts
├── email-templates/       # Cold-outbound email templates (Instantly source)
├── index.html             # Vite entry HTML
├── vite.config.ts         # Vite config
├── tailwind.config.ts     # Tailwind config
├── components.json        # shadcn/ui config
└── vercel.json            # Vercel rewrites + headers
```

---

## Tech stack

- [Vite](https://vitejs.dev/) — build tool.
- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/).
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives).
- [react-router-dom](https://reactrouter.com/) — client-side routing.
- [@tanstack/react-query](https://tanstack.com/query) — server state.
- [PostHog](https://posthog.com/) — product analytics.
- [Playwright](https://playwright.dev/) + [sharp](https://sharp.pixelplumbing.com/) — image generation in `scripts/`.
- [@emailjs/browser](https://www.emailjs.com/) — contact form delivery.

---

## Deployment

The site deploys to **Vercel** automatically on push to the production branch. `vercel.json` configures:

- **Rewrites**: SPA fallback — all routes serve `index.html` so client-side routing works.
- **Headers**: `X-Robots-Tag: all` to allow indexing.

The site is served at [bizmis.ai](https://bizmis.ai) (apex domain) and `www.bizmis.ai`.

---

## Known issues

- **Stale prerender in `index.html`** — the deployed HTML ships a static prerender block that doesn't always match the live React render (e.g., it lists 10+ FAQ items when the live page filters / paginates). Tracked in [BIZ-28](https://linear.app/bizmis/issue/BIZ-28). For agents querying landing content, use the `retrieve-bizmis-landing-content` and `retrieve-bizmis-faqs` skills (both read source files, not the prerendered HTML).
- **Footer broken links** — tracked in [BIZ-26](https://linear.app/bizmis/issue/BIZ-26).
