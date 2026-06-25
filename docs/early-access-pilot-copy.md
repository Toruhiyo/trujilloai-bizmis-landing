# Early-Access pilot copy + founder narrative (BIZ-176)

Draft for Lever-2 inbound (Linear BIZ-173). Grounded in the live hero (`src/components/Hero.tsx`)
and the EA invite copy (`src/data/leadEarlyAccessCopy.ts`). **Oriol to edit [bracketed] bits in his
real voice / confirm the canonical offer.** Brand voice: warm, human, in-store-associate metaphor,
"this isn't a chatbot."

---

## 1. Founder narrative (reusable asset — not one post; reused across DM/comment/page/call)

**One-liner (DM/comment opener):**
> I'm Oriol, founder of Bizmis — a voice-first AI store associate for Shopify. Think the in-store
> salesperson who greets a shopper, answers their questions, and points them to the right product —
> but on your storefront, 24/7. Not a chatbot.

**Two-paragraph (page blurb / call intro):**
> When you walk into a good store, someone greets you, reads what you need, answers the awkward
> pre-purchase question, and points you to the right thing. Online, we replaced all of that with a
> search bar and an FAQ page — then wondered why shoppers bounce. [optional personal hook: what made
> you see this firsthand]
>
> Bizmis puts that associate back on the storefront — voice-first, answering shoppers in real time,
> guiding them to buy, and quietly handling the questions that would've become support tickets. Voice
> AI finally got good enough to do this naturally, so I built it. We're letting a small group of
> Shopify stores use it free before the public launch and shaping the roadmap around what their
> shoppers actually ask.

---

## 2. Pilot-page copy (early-access)

- **Eyebrow:** Early Access · Limited to the first 50 Shopify stores
- **H1:** Put a great salesperson back on your storefront
- **Subhead:** Bizmis is a voice-first AI store associate for Shopify — it welcomes shoppers, answers
  their questions in real time, and guides them to buy, just like your best in-store associate.
  *This isn't a chatbot.*
- **What you get as an early-access store (the canonical 5-part offer):**
  - Free to use live\* — no commitment, no card
  - Priority support — a direct line to the founder
  - Priority feedback — shape the roadmap; your shoppers' questions decide what we build next
  - An early-access discount when you upgrade — your personal early-access code for any paid plan
  - Limited to the first 50 stores
- **How it works:** 1) Book a 30-min call (or try the live demo) → 2) I get Bizmis live on your store,
  configured for your catalog → 3) Watch it sell and deflect support; tell me what to build next.
- **Primary CTA:** Book a 30-min call with me → `https://calendly.com/oriol-bizmis/bizmis-onboarding`
- **Secondary:** See the live demo (`/demo`) · Or install it on Shopify now (`apps.shopify.com/bizmis`)
- **Trust line:** Built by Oriol Trujillo, founder. Questions? hello@bizmis.ai
- **Footnote:** \*Free plan = a one-time 1,200 credits of live usage (~120 voice minutes), no renewal.

---

## 3. Manual Phase-1 outreach templates (per the engagement playbook)

- **Solicitation-thread comment (disclosed):** "Disclosure: I'm the founder of one of these, grain of
  salt. For [their need] the honest options are [X], [Y], and the thing I built, Bizmis — [one-line
  fit]. [Genuinely useful extra on their actual question.] Happy to share more if helpful."
- **Problem-thread comment:** answer helpfully first, no pitch; mention Bizmis only if they ask.
- **DM opener (when warranted):** "Saw your post about [specific pain]. I'm building Bizmis (voice AI
  store associate for Shopify) — letting a few stores use it free before launch to shape it. Not a
  cold pitch; [their store] genuinely fits. Want me to set it up free, no commitment?"

---

## ⚠️ Finding: the live /join-waitlist page is STALE and off-offer

`src/pages/JoinWaitlist.tsx` still frames the product as **pre-launch** and advertises a **different
offer** than the current EA invite:
- `LAUNCH_DATE = "March 2026"` and copy like "be first when Bizmis launches" / "Join the Waitlist"
  — but it's June 2026 and the product is live (App Store listing active).
- EA benefits listed: **"50% Off First 3 Months", "VIP Onboarding", "Direct Roadmap Influence"** —
  whereas the EA invite copy (`leadEarlyAccessCopy.ts`) and BIZ-173 say **free to try live, no
  commitment, priority support, shape the roadmap, limited to N stores.**

This is the page Reddit traffic would land on → it would confuse/lose a merchant. **Recommend:** replace
with the pilot copy above (single CTA, current free-trial offer), and **confirm the canonical offer**
(free-live-trial vs 50%-off-3-months) before it goes live.
