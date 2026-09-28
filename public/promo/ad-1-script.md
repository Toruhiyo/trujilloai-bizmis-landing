# ad-1

Played at `/?marketing=ad-1`. The default call to action is `cta=demo`. `cta=ea`, `cta=install`, and `cta=none` change only the end card. `part=pain` stops after the dull sea. `part=pitch` starts at the switch.

Lines in quotes are on screen or spoken. **VO** is the narrator (recorded by Oriol, voice-changed in ElevenLabs). **Clerk** is the product's own voice, speaking to the shopper. Spoken lines are never written on the store. The VO never overlaps the clerk: VO between cards, clerk inside them.

The film says "chatbot" and "sales agent". "Salesperson" is only the struck word in the reveal, and the narrator's line about a physical store.

---

## 1. Lost in the catalog (desktop)

The first close-up opens on a large "Your store" in the center, like the page arriving, with no spinner. That title leaves and the desktop window is there, titled "Your store" in the browser bar. The shopper opens a product, goes back, bounces between two similar products, opens another, backs out.

**VO** `two-places`: "In every online store, a sale dies in two places."

**VO** `catalog`: "Lost in the catalog."

The Dull Chatbot panel opens. Chips: Track order, Returns, Contact us.

The shopper types: "Looking for something light I can take everywhere."

The bot answers: "You can browse our full collection. Use the filters to narrow by size and weight." Links: View collection, Size guide.

The cursor closes the chat. A grey veil covers the window and "LOST" stamps in grey, inside the rounded window.

## 2. The last doubt (phone)

The desktop window leaves. The next card is a phone on its own, still titled "Your store". It is not inside the desktop window. The sea stays out of frame. A product page, laid out for the phone. The thumb scrolls to Add to cart, hovers, retreats to the specs, comes back, retreats.

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

Word by word: "Your store salesperson." A line draws through the middle of "person", then that word leaves and the line reads "Your store sales agent." "sales agent" is Bizmis orange.

**VO** `sales-agent`: "Your store's sales agent. Built to sell."

**VO** `catch-both`: "Now watch it catch both."

## 6. The same two cards, sold

Same two windows, including the pan. Each window is centered on the screen. Phone and tablet show no arrow cursor. The phone is its own frame. Catalog, comparison, and product page reflow for the phone and the tablet. The cursor and the thumb stay put. The store moves. The real Bizmis card, in light mode, eases into the corner of the desktop window, composer and all. The shopper types in that composer, and that line is sent. The bubble stays the shopper's words. A failed send does not show a retry control. Behind the scenes the agent receives `Say this: "{the clerk's line}"`. On the phone the widget switches to its mobile bar, docked in a band at the bottom of the phone, clear of the product and the comparison. The clerk speaks through the real widget, one sentence, captioned. No VO during that speech. The widget draws its own cards: "Products shown to you", "Product opened", "Added to cart". A short orange sweep marks whatever just changed.

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

From the orange field the picture eases to white. "Built to sell." leaves. The mark is off during the pass. No clerk. A pass of larger store frames starts near a second each and slows toward about three seconds. Behind each frame, a soft light in that store's own color. Sector and store names use that color, large and bold. Sector labels, in order: Consumer electronics, Clothing & apparel, Books & stationery, Skincare & beauty, Gaming gear, Home & DIY, Car parts & accessories, Wine & spirits. The wordmark is never black.

**VO** `any-store`: "Any store."

## 9. End card

The frames leave. The field stays white. Nothing is clickable. No window, button, cursor, glow, shine, or glass. By `cta`:

- `demo` (default): "See it in action" and `bizmis.ai/demo`
- `ea`: "First 50 stores. Free to run live." then "Join Early Access" and `bizmis.ai/early-access`
- `install`: "Installs in one click." then "Install on Shopify". No URL.
- `none`: the wordmark only.

The line fades up and holds ≥ 4 s. The wordmark is Bizmis orange and sits centered above the line.

**VO:** per `cta`. demo `see-it`: "See it in action." ea `join-fifty`: "Join the first fifty stores." install `install-shopify`: "Install it on Shopify." none: silence.

`&vo=1` prints the marker name as a small debug caption. The list is `PROMO_VO` in `film-engine.js` (`window.__promoVo`): scene, marker name, expected line. `catch-both` and `narrows` hold the next clerk line for their `guardMs`, so the narrator and the clerk never speak together. Picture retiming waits until the recorded VO is placed. Target total ≈ 60 s: pain 13 · dull sea 6 · switch + reveal 8 · pitch 14 · selling sea 6 · stores + end card 9.
