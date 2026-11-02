/**
 * Build-time only (src/seo: the static pages, their heads and llms.txt): all
 * five dictionaries, registered at once so getMessages works for any locale
 * without waiting. The app never imports this file; it loads one language at
 * a time (./index.ts, loadMessages).
 */
import { registerMessages } from "./index";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { ca } from "./ca";

registerMessages("en", en);
registerMessages("es", es);
registerMessages("fr", fr);
registerMessages("it", it);
registerMessages("ca", ca);
