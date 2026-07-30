import type { Locale } from "../locales";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { ca } from "./ca";

export type { Messages } from "./en";

const DICTIONARIES = { en, es, fr, it, ca } as const;

export const getMessages = (locale: Locale) => DICTIONARIES[locale];
