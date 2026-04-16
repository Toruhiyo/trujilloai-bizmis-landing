# Bizmis Landing Page — Copy & Structure

This document describes the **sections**, **copy**, and **content structure** of the Bizmis landing page (main index route).

---

## Page order (top to bottom)

1. **Hero** (`#hero`)
2. **Benefits** (contains 3 benefit sections + shared intro)
   - Benefit 1: Boost Sales (`#benefit-1` is not a separate id; first section is shared with Benefit 1)
   - Benefit 2: Customer Support (`#benefit-2`)
   - Benefit 3: Store Insights (`#benefit-3`)
3. **Setup** (`#setup`) — Plug & Play
4. **Customization** (`#customization`) — Personalization
5. **CTA** (`#final-cta`) — Final call-to-action + Early Access card
6. **Footer**

---

## 1. Navbar (global, within Hero when at top)

- **Nav links:** Features, Setup, Pricing, FAQs
- **Primary CTA:** “Install Now” (with Shopify icon) → scrolls to Setup or install flow
- **Logo:** Bizmis (links to top / clears hash)

---

## 2. Hero

**Structure:** Full-viewport section with headline, subcopy, and primary CTA. Desktop: two columns (copy left, avatar image right). Mobile: stacked (copy above image).

**Copy:**

- **Headline (H1):**
  - Line 1: **Boost Profits,**
  - Line 2: **Selling The Human Way**
- **Subline (paragraph):**
  - **This isn't a chatbot.** Bizmis speaks naturally—welcoming your customers, answering their questions, and guiding them to buy with confidence, just like the best in-store salesperson would.
- **Primary CTA (button):**
  - Label: **Install Now**
  - Subtext (desktop): _One-click install, ready in minutes_
- **Secondary line:**
  - _Also available for [custom websites](link to contact)_

---

## 3. Benefits (Features block)

The Benefits block is one scrollable area that contains **three benefit sections**. Each has a section badge, headline, subline, and its own internal structure.

---

### 3.1 Benefit 1 — Boost Sales

**Section badge:** Boost Sales (icon: shopping cart)

**Headline (H1):**  
**Convert. Upsell. Retain.**

**Subline:**  
Bizmis acts like a great in-store associate — guiding shoppers, increasing cart value, and creating the kind of personal, warm experience that brings customers back.

**Structure:**

1. **Subbenefits (flip cards) — 3 pillars**
   - Each card has:
     - **Front:** Title only (large)
     - **Back:** Subtitle + body copy
   - **Pillar 1**
     - Title: **Convert More Visitors**
     - Subtitle: Remove Buying Hesitation
     - Body: Bizmis answers questions instantly and guides shoppers to the right product — so more visitors feel confident enough to buy.
   - **Pillar 2**
     - Title: **Increase Order Value**
     - Subtitle: Smart Upsells & Add-Ons
     - Body: Smart recommendations, upgrades, and complementary products appear naturally during the conversation.
   - **Pillar 3**
     - Title: **Build Customer Loyalty**
     - Subtitle: Personal Shopping Experience
     - Body: A warm, personal shopping experience customers remember — and come back for.

2. **Demo / visual**
   - **SpeakDiscoverBuy** — “Speak → Discover → Buy” pipeline (avatar, product cards, customer). No separate headline; visual only.

---

### 3.2 Benefit 2 — Customer Support

**Section badge:** Customer Support (icon: comments)

**Headline (H2):**  
**Save hours on support.**  
**Earn loyal customers.**

**Subline:**  
Watch real-time satisfaction metrics and live customer reviews flowing in—proof that Bizmis delivers exceptional support 24/7.

**Structure:**

1. **Voice support demo (VoiceSupportScene)**
   - Animated scene: customer card + customer message + waveform + action badge + resolution message + Bizmis avatar. Looping support cases (from `support-cases.ts`), e.g. return policy, order tracking, shipping, address change, cancel, warranty, start return.
   - No headline above the scene.

2. **Business outcomes (KPI strip)**
   - One horizontal row of 3 pill/badges (not aligned to cards below):
     - **Save support hours** (clock icon)
     - **Earn better reviews** (star icon)
     - **Grow repeat sales** (redo/cycle icon)

3. **Feature cards (enabling capabilities) — 3 cards**
   - **24/7 Instant Support**  
     Customers get help the moment they need it — no waiting, no frustration, no bad reviews from unanswered questions.
   - **Problem Resolution**  
     Quick, accurate solutions that turn frustrated customers into satisfied advocates.
   - **Empathetic Support**  
     AI that understands customer emotions and responds with genuine care and understanding.

---

### 3.3 Benefit 3 — Store Insights

**Section badge:** Store Insights (icon: chart line)

**Headline (H2):**  
**Learn. Tune. Grow.**

**Subline:**  
See where buyers hesitate, what they ask, and which paths convert—so you fix less, save hours, and invest where revenue grows.

**Structure:**

- **Two-column layout (desktop):** left = Tabbed Session Replay (visual), right = 3 feature cards. Mobile: order flips (cards first, then replay).
- **Feature cards (3):**
  1. **Session Replays**  
     Jump straight to drop-offs and hesitation points. Fix once, prevent abandoned carts, and recover at-risk sales.
  2. **Auto-Tagged Sessions**  
     Conversations auto-group by topic and intent. Update one FAQ/policy, cut repeat tickets, and reduce support load.
  3. **Funnel Insights**  
     See conversion paths, drop-offs, and product impact at a glance. Prioritize high-ROI fixes and back the winners.

---

## 4. Setup (Plug & Play)

**Section badge:** Plug and Play (icon: Shopify)

**Headline (H2):**  
**One-Click Setup, Instant Selling & Support**

**Subline:**  
Install the Bizmis Shopify app and start selling and supporting customers immediately.

**Structure:**

1. **Integration diagram**
   - **“Your Shopify Store Data”** (container label)
   - **5 data cards** (list, not 1:1 with benefits):
     - **Store Website** — Vision, mission and core values
     - **Products Catalog** — Collections, inventory, purchase orders
     - **Discounts** — All current promotions
     - **Customers** — Customer sales and support records
     - **Orders** — Customer order history
   - Central **Bizmis avatar** with connectors from each card (and optional “shiny” dots).
   - No extra headline between diagram and trust line.

2. **Trust badges (single row)**
   - One-click setup • Always synced • Ready in minutes
   - (Icons: bolt, sync, shopping cart; separated by dots.)

3. **CTA**
   - Button: **Install Bizmis on Shopify** (Shopify icon)
   - Tagline: _Start selling and supporting customers now._

---

## 5. Customization (Personalization)

**Section badge:** Personalization (icon: paint brush)

**Headline (H2):**  
**Make It _Truly Yours_**

**Subline:**  
Build authentic relationships that drive customer loyalty through personalized voice and appearance customization.

**Structure:**

- **Two-column layout:** Left = avatar + clothing/haircut carousels; Right = 2 feature blocks + voice demo.
- **Feature 1 — Personal Avatar**  
  Creating genuine connections by making your sales representative sound and look like you.
- **Feature 2 — Voice Cloning**  
  Authentic customer interactions through replication of your unique speaking style and personality.
- **Voice demo**
  - Toggle: **Original Voice** | **Cloned Voice**
  - Audio player for comparison.

(No separate “subbenefits” row; the two features act as the capability layer.)

---

## 6. CTA (Final CTA)

**Structure:** Two columns: left = headline + value prop + bullets + buttons; right = Early Access card.

**Left column copy:**

- **Headline (H2):**  
  **Install on Shopify in 1 click. Start selling today.**
- **Paragraph:**  
  Bizmis greets visitors, answers their questions, and guides them to checkout—fully synced with your Shopify products, discounts, and orders.
- **Bullets:**
  - Greets and qualifies shoppers
  - Compares products & recommends
  - Handles support and reduces tickets
- **Primary button:** **Join the Waitlist** (Shopify icon)
- **Secondary button:** **Talk to sales**
- **Microline:**  
  _Cancel anytime • [GDPR-ready](/privacy) • Built for Shopify_

**Right column — Early Access card:**

- **Badge:** Early Bird
- **Title:** **Be First. _Sell More._**
- **Subline:**  
  Join the exclusive group of first 50 merchants shaping the future of conversational commerce.
- **Benefits (3):**
  1. **50% Off First 3 Months** — Lock in our lowest launch pricing.
  2. **Direct Roadmap Influence** — Your feature requests get priority status.
  3. **VIP Onboarding** — Personal setup & Onboarding session included.
- **Footer line:** _Limited spots available_
- **Button:** **Claim Early Bird Offer**

---

## 7. Footer

**Structure:** Multi-column: logo + tagline + “Built for Shopify” block; then Product, Support, Legal.

**Copy:**

- **Tagline (under logo):**  
  Your store's best salesperson, working 24/7 to boost sales, provide support, and understand your customers.
- **Built for Shopify:**  
  “Built for” + Shopify logo (image).
- **Product:** Features, Pricing, Demo (links)
- **Support:** Contact, FAQs (links)
- **Legal:** Privacy Policy, Terms of Service (links)
- **Copyright:** © [year] Bizmis. All rights reserved.

---

## Summary: section → content type

| Section       | Section badge    | Headline / promise       | Internal content                                                         |
| ------------- | ---------------- | ------------------------ | ------------------------------------------------------------------------ |
| Hero          | —                | Boost Profits, Selling…  | Subline, Install Now, custom websites                                    |
| Benefit 1     | Boost Sales      | Convert. Upsell. Retain. | 3 flip-card subbenefits + SpeakDiscoverBuy demo                          |
| Benefit 2     | Customer Support | Save hours… Earn loyal…  | VoiceSupportScene + 3 KPI pills + 3 feature cards                        |
| Benefit 3     | Store Insights   | Learn. Tune. Grow.       | TabbedSessionReplay + 3 feature cards                                    |
| Setup         | Plug and Play    | One-Click Setup…         | Diagram (5 data cards + avatar) + trust badges + Install CTA             |
| Customization | Personalization  | Make It Truly Yours      | 2 feature blocks (Avatar, Voice) + voice toggle + carousels              |
| CTA           | —                | Install on Shopify…      | Value prop, 3 bullets, Join Waitlist / Talk to sales + Early Access card |
| Footer        | —                | —                        | Tagline, Built for Shopify, Product / Support / Legal links, copyright   |

---

## Dynamic / data-driven copy

- **Benefit 2 — VoiceSupportScene:**  
  Customer quotes, resolution actions, and agent responses come from `src/data/support-cases.ts` (e.g. return policy, order tracking, shipping, address change, cancel order, warranty, start return). These rotate in a loop; no copy is hardcoded in the scene component for the dialogue text.
- **Footer year:** From `getCurrentYear()`.

All other copy in this document is static in the listed components (Hero, Benefits, Setup, Customization, CTA, EarlyAccessCard, Footer).
