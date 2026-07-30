/** Locales served by the public marketing site. `en` is the unprefixed default. */
export const LOCALES = ["en", "es", "fr", "it", "ca"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Endonyms — a language picker reads best in the language it offers. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  it: "Italiano",
  ca: "Català",
};

/** Short label for the compact switcher trigger. */
export const LOCALE_SHORT_NAMES: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  fr: "FR",
  it: "IT",
  ca: "CA",
};

/** BCP 47 tags for `<html lang>`, `hreflang` and `Intl` formatters. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: "en",
  es: "es-ES",
  fr: "fr-FR",
  it: "it-IT",
  ca: "ca-ES",
};

export const isLocale = (value: string | undefined): value is Locale =>
  value !== undefined && (LOCALES as readonly string[]).includes(value);

/**
 * Locales whose translated nav labels run long enough to overlap the
 * language switcher / CTA cluster in the centered desktop navbar. These
 * locales drop the "Benefits" and "Setup" jump links from the desktop nav.
 */
export const COMPACT_DESKTOP_NAV_LOCALES: readonly Locale[] = [
  "es",
  "fr",
  "it",
  "ca",
];

/** Best supported locale for a browser language list, default when none match. */
export const matchLocale = (preferred: readonly string[]): Locale => {
  for (const language of preferred) {
    const base = language.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
};
