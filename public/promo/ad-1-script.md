# ad-1

Played at `/?marketing=ad-1`. The default call to action is `cta=demo`. `cta=ea`, `cta=install`, and `cta=none` change only the end card. `part=pain` stops after the dull sea. `part=pitch` starts at the switch.

Lines in quotes are on screen or spoken. **VO** is the narrator (recorded by Oriol, voice-changed in ElevenLabs). **Clerk** is the product's own voice, speaking to the shopper. Spoken lines are never written on the store. The VO never overlaps the clerk: VO between cards, clerk inside them.

The film says "chatbot" and "sales agent". "Salesperson" is only the struck word in the reveal, and the narrator's line about a physical store.

---

## 1. Lost in the catalog (desktop)

A desktop window titled "Your store". The shopper opens a product, goes back, bounces between two similar products, opens another, backs out.

**VO** `two-places`: "In every online store, a sale dies in two places."

**VO** `catalog`: "Lost in the catalog."

The Dull Chatbot panel opens. Chips: Track order, Returns, Contact us.

The shopper types: "Looking for something light I can take everywhere."

The bot answers: "You can browse our full collection. Use the filters to narrow by size and weight." Links: View collection, Size guide.

The cursor closes the chat. A grey veil covers the window and "LOST" stamps in grey, inside the rounded window.

## 2. The last doubt (phone)

The close-up pans to the next card. That card is a phone, still titled "Your store". The sea stays out of frame. A product page. The thumb scrolls to Add to cart, hovers, retreats to the specs, comes back, retreats.

**VO** `last-doubt`: "Or stuck on the last doubt."

The shopper types: "Will it fit my setup?"

The bot answers: "Recommendations vary by preference. Check each product page for details, or I can open a support ticket." Buttons: Open a ticket, No, thanks.

**VO** `salesperson`: "In a physical store, a salesperson catches both."

The thumb leaves. No X. A grey veil and "LOST" stamp the phone.

**VO** `loses-both`: "Online, a chatbot replies to both. And loses both."

## 3. The dull sea

The pullback starts on that phone. The desktop LOST is the card beside it. Every card is "Your store", in the browser bar next to the store icon. Most of them stamp "LOST". While the sea is still moving and blurred, this line comes up, holds, then fades out before the field is solid grey:

"Unattended visits. Lost sales."

**VO** `numbers-game`: "Online sales is a numbers game. And a chatbot doesn't play."

## 4. The switch

The grey fades out. A switch reads "Typical chatbot" and "Sales agent". The knob flips to Sales agent. That label moves to centre, grows, and bursts to white.

**VO** `change-that`: "Let's change that."

## 5. The reveal

The Bizmis mark.

**VO** `introducing`: "Introducing Bizmis."

Word by word: "Your store salesperson." Then "person" is struck, and the line reads "Your store sales agent."

**VO** `sales-agent`: "Your store's sales agent. Built to sell."

**VO** `catch-both`: "Now watch it catch both."

## 6. The same two cards, sold

Same two windows, including the pan. The cursor and the thumb stay put. The store moves. The real Bizmis card eases into the corner of the window, composer and all. The shopper types in that composer. The clerk speaks through the real widget, one sentence, captioned. No VO during that speech. The widget draws its own cards: "Products shown to you", "Product opened", "Added to cart". A short orange sweep marks whatever just changed.

Desktop, the same grid. The shopper types: "Looking for something light I can take everywhere."

**Clerk:** "Light and easy to carry, here are the three that fit. This one's the best of them."

While he speaks, the grid narrows to three, then the pick's page opens. Orange veil, white check, "SOLD".

**VO** `narrows`: "It narrows. It recommends."

Phone, the same product page. The shopper types: "Will it fit my setup? If so, add it."

**Clerk:** "It will. And if it doesn't, returns are free. Added, with the sleeve that goes with it."

While he speaks, the product is added, then a matching extra, and the cart badge goes to 2. "SOLD".

**VO** `closes`: "It answers like an expert, and closes. Then sells them one more thing."

## 7. The selling sea

The pullback starts on that phone. Every card is "Your store". Most of them stamp "SOLD". While the sea is still moving and blurred, this line comes up and stays, with the white Bizmis mark, through the orange field:

"Built to sell."

**VO** `all-day`: "For every shopper. All day long."

The sea washes to solid Bizmis orange.

## 8. Other stores, into the slot

From the orange field, the mark stays and "Built to sell." leaves. A fast pass of the real demo stores slows as it goes. The clerk wears each store's uniform. Sector labels, in order: Consumer electronics, Clothing & apparel, Books & stationery, Skincare & beauty, Gaming gear, Home & DIY, Car parts & accessories, Wine & spirits.

**VO** `any-store`: "Any store."

The pass ends on one empty slot: a dotted-outline window labelled "Your store", centred on the orange field. The wordmark is small, top-left.

## 9. End card

The slot stays on the orange field. Nothing is clickable. No glow, shine, particles, glass, or counters. By `cta`:

- `demo` (default): button "See it in action" and `bizmis.ai/demo`
- `ea`: eyebrow "First 50 stores. Free to run live." then "Join Early Access" and `bizmis.ai/early-access`
- `install`: eyebrow "Installs in one click." then "Install on Shopify". No URL.
- `none`: the wordmark only. No slot.

The button lands last and presses in. The cursor drifts onto it over the last 800 ms and rests. Hold ≥ 4 s.

**VO:** per `cta`. demo `see-it`: "See it in action." ea `join-fifty`: "Join the first fifty stores." install `install-shopify`: "Install it on Shopify." none: silence.

`&vo=1` prints the marker name as a small debug caption. The list is `PROMO_VO` in `film-engine.js` (`window.__promoVo`): scene, marker name, expected line. `catch-both` and `narrows` hold the next clerk line for their `guardMs`, so the narrator and the clerk never speak together. Picture retiming waits until the recorded VO is placed. Target total ≈ 60 s: pain 13 · dull sea 6 · switch + reveal 8 · pitch 14 · selling sea 6 · stores + end card 9.
