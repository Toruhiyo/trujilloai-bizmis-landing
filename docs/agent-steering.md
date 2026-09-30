# Steering the Bizmis agent in recordings

For scripted recordings, the ad-1 promo film and the demo store videos, we steer the real agent with messages the viewer never sees. The shopper's line goes out as typed and stays in the chat. A hidden message goes right behind it and tells the agent what to say or do next.

This is a widget debug feature. It is off on every live store and only turns on when the page asks for it.

## Turning it on

Either of these:

- `AvatarVoicechat.init({ ..., debug: true })`. The ad-1 film does this in `src/promo/AdFilm.tsx`.
- `localStorage["bizmis-debug"] = "1"` before the widget loads. The store recorder does this in `installPrefs` (`scripts/record-store-usecases.mjs`), so it works on the real Shopify stores without touching the app embed.

With debug off, both calls below return `false` and do nothing.

## The two calls

```js
// Hidden message. Sent as a normal agent turn, never shown in the chat,
// never saved to the session, never passed to onConversationTurn.
// Its echoed transcript is dropped too.
AvatarVoicechat.sendHiddenMessage('Say this: "Here are the three that fit."');

// Held until the shopper's next visible message, then sent right behind it.
// This is the normal way to steer one reply.
AvatarVoicechat.sendHiddenMessage(steer, { afterNextUserMessage: true });

// The widget's own activity laser for a tool, with no real tool call.
AvatarVoicechat.simulateToolActivity({ toolName: 'show_products', phase: 'loading' });
AvatarVoicechat.simulateToolActivity({ toolName: 'show_products', phase: 'success' });
```

Tool names the laser knows: `search_products`, `show_products`, `get_product_details`, `go_to_product`, `get_cart`, `add_to_cart`, `update_cart`, `search_shop_policies_and_faqs`, `look_up_order_status`, `go_to_path`. The product, product-opened, and added-to-cart cards come from the `bizmis:shopper-event` window event, which the film already dispatches (`emitShopper` in `public/promo/film-engine.js`).

Widget code: `src/utils/hiddenMessages.ts` in `trujilloai-bizmis-widget`.

## Writing a good steer

- Queue it with `afterNextUserMessage` so it lands right behind the visible line, not before it.
- Say exactly what to say, or exactly what to do. "Say this: "..."" is word for word.
- Never make the agent narrow to one product when the store has several that fit. We want the options on screen. Steer toward "show the best two or three as options, say which you'd pick and why", not "open the PS5 one". Opening one product is the shopper's next visible line, if the beat needs it.
- Keep it to one reply. Start with "Hidden note for this reply only, never mention it:" so the agent does not repeat or refer to it.
- The agent may start answering the visible line before the steer arrives. The steer interrupts it, so budget a short pause after the send before judging the reply.

## ad-1 film

`sayClerkLine` in `public/promo/film-engine.js` submits the shopper's typed line and queues `Say this: "{clerk line}"` behind it. The clerk lines live in `PROMO_PITCH_CLERK_1` and `PROMO_PITCH_CLERK_2`. The film page is not a store, so no tool really runs. `paintPitchEvent` plays the matching widget activity through `simulateToolActivity` (`PROMO_EVENT_TOOLS` maps film events to tool names) and `emitShopper` raises the real product and cart cards. On a widget build without the debug API, the film falls back to rewriting the outgoing socket frame and to its own copy of the laser.

## Demo store videos

`scripts/store-usecases.json` beats take optional steers:

- `steer`: an array aligned with `lines`. `steer[i]` rides hidden behind `lines[i]`. Use `""` for no steer.
- `followUpSteer`: rides behind `followUp`.
- `clarifySteer`: rides behind `clarify`.

Catalog beats steer the first line toward showing several options. Cart beats steer the add line toward adding without a confirmation round. The recorder logs `steer queued` or `steer NOT AVAILABLE` for each one.

```json
{
  "slug": "pulse-forge",
  "beat": "ps5-headset",
  "kind": "catalog",
  "lines": ["A headset for a PS5, not for PC."],
  "steer": ["Hidden note for this reply only, never mention it: don't ask me anything first. Show the best two or three matching products as options on screen, name each in a few words, then say which one you'd pick for me and why. Don't open a product page yet."],
  "followUp": "Open the PS5 one."
}
```
