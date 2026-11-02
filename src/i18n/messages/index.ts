import type { Locale } from "../locales";
import { en, type Messages } from "./en";

export type { Messages } from "./en";

/**
 * The dictionaries the app has. English (the default, and what the types
 * follow) ships with the app; the other four are each their own chunk, loaded
 * when a page in that language is shown (loadMessages), so a visitor downloads
 * only their language. The build (src/seo) registers all five up front
 * (./all.ts), for the static pages, llms.txt and the heads.
 */
const loaded: Partial<Record<Locale, Messages>> = { en };
const pending: Partial<Record<Locale, Promise<Messages>>> = {};

const IMPORTERS: Record<Exclude<Locale, "en">, () => Promise<Messages>> = {
  es: () => import("./es").then((m) => m.es),
  fr: () => import("./fr").then((m) => m.fr),
  it: () => import("./it").then((m) => m.it),
  ca: () => import("./ca").then((m) => m.ca),
};

/** True once the locale's dictionary is here (getMessages can be called). */
export const hasMessages = (locale: Locale) => loaded[locale] !== undefined;

/** Fetches a locale's dictionary (once; later calls share the same promise). */
export const loadMessages = (locale: Locale): Promise<Messages> => {
  const ready = loaded[locale];
  if (ready) return Promise.resolve(ready);
  if (locale === "en") return Promise.resolve(en);
  pending[locale] ??= IMPORTERS[locale]().then((messages) => {
    loaded[locale] = messages;
    return messages;
  });
  return pending[locale]!;
};

/** Adds a dictionary that is already in memory (the build, src/i18n/messages/all.ts). */
export const registerMessages = (locale: Locale, messages: Messages) => {
  loaded[locale] = messages;
};

/** The locale's dictionary; it must have been loaded (LocaleProvider waits for it). */
export const getMessages = (locale: Locale): Messages => {
  const messages = loaded[locale];
  if (!messages) throw new Error(`[i18n] the "${locale}" messages are not loaded yet`);
  return messages;
};
