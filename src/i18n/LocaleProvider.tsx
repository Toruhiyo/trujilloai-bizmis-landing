import { createContext, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DEFAULT_LOCALE, LOCALE_TAGS, type Locale } from "./locales";
import { getMessages, type Messages } from "./messages";
import { localizePath, splitLocaleFromPath, translateHref } from "./paths";

interface LocaleContextValue {
  locale: Locale;
  messages: Messages;
  /** Prefixes an internal path with the active locale. */
  href: (path: string) => string;
  /** Navigates to the current page in another locale. */
  switchLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  locale: Locale;
  children: ReactNode;
}

export const LocaleProvider = ({ locale, children }: LocaleProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.lang = LOCALE_TAGS[locale];
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => {
    const { path } = splitLocaleFromPath(location.pathname);

    return {
      locale,
      messages: getMessages(locale),
      href: (target: string) => translateHref(target, locale),
      switchLocale: (next: Locale) =>
        navigate(
          {
            pathname: localizePath(path, next),
            search: location.search,
            hash: location.hash,
          },
          { replace: true },
        ),
    };
  }, [locale, location.hash, location.pathname, location.search, navigate]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
};

const useLocaleContext = (): LocaleContextValue => {
  const context = useContext(LocaleContext);

  if (context === null) {
    throw new Error("useLocaleContext must be used inside a LocaleProvider");
  }

  return context;
};

export const useLocale = () => useLocaleContext().locale;

/** Active dictionary. Shaped by the English messages, so keys are type-checked. */
export const useMessages = (): Messages => useLocaleContext().messages;

/** Locale-aware href builder for internal links and programmatic navigation. */
export const useLocaleHref = () => useLocaleContext().href;

export const useSwitchLocale = () => useLocaleContext().switchLocale;

/** Locale tag for `Intl` formatters, safe to use outside a route tree. */
export const localeTag = (locale: Locale = DEFAULT_LOCALE) =>
  LOCALE_TAGS[locale];
