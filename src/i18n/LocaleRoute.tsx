import { Navigate, Outlet, useParams } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { LocaleProvider, useLocaleHref } from "./LocaleProvider";
import { DEFAULT_LOCALE, isLocale } from "./locales";

/**
 * Serves the public routes under an active locale. English is unprefixed, so
 * the `:locale` param is absent there; an unknown prefix is a 404, not a
 * silent fallback, otherwise `/xyz` would quietly render the home page.
 */
export const LocaleRoute = () => {
  const { locale: param } = useParams();
  const isUnknownPrefix = param !== undefined && !isLocale(param);
  const locale = isLocale(param) ? param : DEFAULT_LOCALE;

  return (
    <LocaleProvider locale={locale}>
      {isUnknownPrefix ? <NotFound /> : <Outlet />}
    </LocaleProvider>
  );
};

/** Redirects to the active locale's version of an internal path. */
export const LocalizedRedirect = ({ to }: { to: string }) => {
  const href = useLocaleHref();

  return <Navigate to={href(to)} replace />;
};
