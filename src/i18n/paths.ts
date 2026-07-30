import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales";

/** Routes that exist in English only — the legal texts are the binding version. */
export const ENGLISH_ONLY_PATHS = ["/privacy", "/terms"] as const;

export const isEnglishOnlyPath = (path: string) =>
  ENGLISH_ONLY_PATHS.some(
    (englishOnly) => path === englishOnly || path.startsWith(`${englishOnly}/`),
  );

const withLeadingSlash = (path: string) =>
  path.startsWith("/") ? path : `/${path}`;

/** Splits `/es/pricing` into its locale and the locale-free `/pricing`. */
export const splitLocaleFromPath = (
  pathname: string,
): { locale: Locale; path: string } => {
  const [, firstSegment = "", ...rest] = pathname.split("/");

  if (!isLocale(firstSegment)) {
    return { locale: DEFAULT_LOCALE, path: withLeadingSlash(pathname) };
  }

  return { locale: firstSegment, path: `/${rest.join("/")}` };
};

/** Prefixes a locale-free path for the target locale. English stays unprefixed. */
export const localizePath = (path: string, locale: Locale): string => {
  const normalized = withLeadingSlash(path);

  if (locale === DEFAULT_LOCALE || isEnglishOnlyPath(normalized)) {
    return normalized;
  }

  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
};

/** Same path in another locale, preserving hash and query. */
export const translateHref = (href: string, locale: Locale): string => {
  if (/^[a-z]+:/i.test(href) || href.startsWith("//")) return href;

  const [pathWithQuery = "", hash = ""] = href.split("#");
  const [path = "", query = ""] = pathWithQuery.split("?");

  if (path === "") {
    return href;
  }

  const { path: bare } = splitLocaleFromPath(path);

  return [
    localizePath(bare, locale),
    query && `?${query}`,
    hash && `#${hash}`,
  ]
    .filter(Boolean)
    .join("");
};
