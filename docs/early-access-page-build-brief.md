# Build brief — dedicated `/early-access` page (for the coder AI)

**Context.** Repo `trujilloai-bizmis-landing` (Vite + React + React Router + Tailwind + shadcn/ui).
We're driving inbound traffic (Reddit, later more) to a free Early-Access pilot. We need a dedicated,
conversion-focused **`/early-access`** page. The existing `/join-waitlist` page is **stale** (pre-launch
framing: `LAUNCH_DATE="March 2026"`, "Join the Waitlist", and an off-offer "50% off first 3 months")
and must NOT be the landing target. Copy source of truth: `docs/early-access-pilot-copy.md`.

## Goal
A single-purpose page whose one job is: a qualified Shopify merchant books a 30-min onboarding call.
One primary CTA. Benefit-led, on-brand, fast.

## Route
- Add `<Route path="/early-access" element={<EarlyAccess />} />` in `src/App.tsx`.
- New page component `src/pages/EarlyAccess.tsx`.
- **Reconcile the stale page:** redirect `/join-waitlist` → `/early-access` (product is live; "waitlist"
  is obsolete), and update any nav/footer/CTA links that point to `/join-waitlist`. If you prefer to
  keep a "notify me" form, fix its copy too — but the inbound target is `/early-access`.

## Reuse (don't reinvent)
- Brand tokens: `src/lib/bizmisBrandColors.ts`, Tailwind `gradient-warm`, primary `#F9A353`, warm bg.
- Components: `@/components/ui/button`, `@/components/Seo`, the site Navbar + Footer used by other pages,
  `lucide-react` icons. Match the visual language of `JoinWaitlist.tsx` / `Hero.tsx` (warm, rounded, soft shadows).
- URL constants from `src/lib/bizmisUrls.ts` — **use these, don't hardcode:**
  - Primary CTA → `BIZMIS_BOOK_A_CALL_URL` (`https://calendly.com/oriol-bizmis/bizmis-onboarding`)
  - Demo → `BIZMIS_DEMO_STORE_URL` (`/demo`) via `openBizmisDemoStore()`
  - Install → `BIZMIS_SHOPIFY_APP_LISTING_URL` via `openBizmisShopifyAppListing()`

## Page structure & copy (verbatim from `early-access-pilot-copy.md`)
1. **Eyebrow:** "Early Access · Limited to the first 50 Shopify stores"
2. **H1:** "Put a great salesperson back on your storefront"
3. **Subhead:** "Bizmis is a voice-first AI store associate for Shopify — it welcomes shoppers, answers
   their questions in real time, and guides them to buy, just like your best in-store associate. *This
   isn't a chatbot.*"
4. **Founder note** (short, builds trust) — the 2-paragraph founder narrative from the copy doc.
5. **Offer block — the canonical 5-part offer** (icon + label each):
   - Free to use live\* — no subscription, no commitment (NOT "no card" — Shopify Billing needs a card)
   - Priority support — a direct line to the founder
   - Priority feedback — shape the roadmap; your shoppers' questions decide what we build next
   - An early-access discount when you upgrade — your personal early-access code for any paid plan
   - Limited to the first 50 stores
6. **How it works (3 steps):** Book a 30-min call (or try the live demo) → I get Bizmis live on your
   store, configured for your catalog → Watch it sell & deflect support; tell me what to build next.
7. **Primary CTA button:** "Book a 30-min call with me" → `BIZMIS_BOOK_A_CALL_URL` (new tab).
8. **Secondary links (smaller):** "See the live demo" (`openBizmisDemoStore`) · "Or install on Shopify now"
   (`openBizmisShopifyAppListing`).
9. **Trust line:** "Built by Oriol Trujillo, founder. Questions? hello@bizmis.ai"
10. **Footnote (small):** "*Free plan = a one-time 1,200 credits of live usage (~120 voice minutes), no renewal."

## Behaviour / non-functional
- **SEO:** use `<Seo title="Bizmis Early Access — free pilot for 50 Shopify stores" description="…" path="/early-access" />`.
- **Analytics:** fire PostHog `cta_clicked` with `{ location: "early_access", cta_type: "book_call" | "view_demo" | "install" }` on each CTA (mirror `Hero.tsx`).
- **Responsive + accessible:** match the existing breakpoints/patterns; semantic headings; buttons have aria where needed.
- **Scarcity:** static "first 50" is fine (no live remaining-count backend). If a count is wanted later, wire a constant.

## Do NOT
- No "launches March 2026" / "Join the Waitlist" / "be first when we launch" framing — the product is live.
- No "50% off first 3 months" — the upgrade discount is delivered via a per-store early-access **coupon
  code** (see `Pricing.tsx` coupon flow); state it as "an early-access discount when you upgrade," not a fixed %.
- No invented social proof / testimonials.
