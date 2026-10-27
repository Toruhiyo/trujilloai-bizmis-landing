import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { HERO_FILM_ENABLED } from "./lib/film";
import AttributionTracker from "./components/AttributionTracker";
import { LocaleRoute, LocalizedRedirect } from "./i18n/LocaleRoute";
import { LocaleProvider } from "./i18n/LocaleProvider";
import { DEFAULT_LOCALE } from "./i18n/locales";
import AdFilm, { isAdFilmRequest } from "./promo/AdFilm";

// Every page is its own chunk, so "/" downloads only the film landing's code
// (and Pricing, FAQs, the admin and the email renders only theirs).
// Archived landing: the live landing never downloads it.
const IndexV1 = lazy(() => import("./pages/IndexV1"));
// The film-led landing: "/" renders it (unless VITE_HERO_FILM=0); /v2 keeps it at a stable URL.
const loadFilmLanding = () => import("./pages/FilmLanding");
const FilmLanding = lazy(loadFilmLanding);
// With VITE_HERO_FILM=0, "/" is the classic landing (pages/Index), untouched.
const ClassicIndex = lazy(() => import("./pages/Index"));
const FAQs = lazy(() => import("./pages/FAQs"));
const Contact = lazy(() => import("./pages/Contact"));
const EarlyAccess = lazy(() => import("./pages/EarlyAccess"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Slides = lazy(() => import("./pages/Slides"));
const ShopifyDeck = lazy(() => import("./pages/slides/ShopifyDeck"));
const AdminProtectedRoute = lazy(() => import("./components/admin/AdminProtectedRoute"));
const InviteCardsIndex = lazy(() => import("./pages/admin/InviteCardsIndex"));
const EarlyAccessCardPage = lazy(() => import("./pages/admin/EarlyAccessCardPage"));
const MockupRenderPage = lazy(() => import("./pages/email-renders/MockupRenderPage"));
const InstantlyExportPage = lazy(() => import("./pages/email-renders/InstantlyExportPage"));
const InstantlyLeadFieldsPage = lazy(() => import("./pages/email-renders/InstantlyLeadFieldsPage"));

// On a landing URL ("/", "/es", ...), fetch the film landing's chunk now, in
// parallel with React's first render, instead of after it.
if (
  HERO_FILM_ENABLED &&
  typeof window !== "undefined" &&
  /^\/(?:(?:es|fr|it|ca)\/?)?$/.test(window.location.pathname)
) {
  loadFilmLanding();
}

/** What shows while a page's chunk loads: the landing's own blank canvas. */
const pageFallback = <div className="min-h-screen studio-lighting-base" />;

const queryClient = new QueryClient();

/**
 * Public, localizable routes. Rendered twice: unprefixed (English, the
 * default) and nested under `/:locale` for es/fr/it/ca. Kept as a plain
 * function (not a JSX component) — `<Routes>` only flattens `Route`
 * elements and `Fragment`s, so a custom component wrapping them here
 * would be invisible to its route matching.
 */
const publicLocalizedRoutes = () => [
  <Route key="index" index element={HERO_FILM_ENABLED ? <FilmLanding /> : <ClassicIndex />} />,
  <Route key="v1" path="v1" element={<IndexV1 />} />,
  <Route key="v2" path="v2" element={<FilmLanding path="/v2" />} />,
  <Route key="faqs" path="faqs" element={<FAQs />} />,
  <Route key="contact" path="contact" element={<Contact />} />,
  <Route key="early-access" path="early-access" element={<EarlyAccess />} />,
  <Route
    key="join-waitlist"
    path="join-waitlist"
    element={<LocalizedRedirect to="/early-access" />}
  />,
  <Route key="pricing" path="pricing" element={<Pricing />} />,
  <Route key="unsubscribe" path="unsubscribe" element={<Unsubscribe />} />,
  <Route key="not-found" path="*" element={<NotFound />} />,
];

const App = () => {
  if (isAdFilmRequest()) return <AdFilm />;
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* (transitions keep the current page on screen while the next page's chunk loads) */}
      <BrowserRouter future={{ v7_startTransition: true }}>
        <AttributionTracker />
        <Suspense fallback={pageFallback}>
        <Routes>
          {/* English — default, unprefixed. */}
          <Route element={<LocaleRoute />}>
            {publicLocalizedRoutes()}
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<Terms />} />
          </Route>

          {/* es / fr / it / ca — locale-prefixed. Legal pages stay English:
              the binding version lives unprefixed, so /es/privacy redirects
              there instead of rendering a duplicate. */}
          <Route path="/:locale" element={<LocaleRoute />}>
            {publicLocalizedRoutes()}
            <Route path="privacy" element={<Navigate to="/privacy" replace />} />
            <Route path="terms" element={<Navigate to="/terms" replace />} />
          </Route>

          <Route path="admin" element={<AdminProtectedRoute />}>
            <Route index element={<Navigate to="slides" replace />} />
            <Route path="slides" element={<Slides />} />
            <Route path="slides/shopify" element={<ShopifyDeck />} />
            <Route path="invite-cards" element={<Outlet />}>
              <Route index element={<InviteCardsIndex />} />
              <Route path="early-access/:leadId" element={<EarlyAccessCardPage />} />
            </Route>
          </Route>
          {/* Isolated mockup render target for the Playwright screenshot pipeline. */}
          <Route path="email-renders/:leadId/mockup/:which" element={<MockupRenderPage />} />
          {/* Headless endpoint consumed by scripts/generate-instantly-template.mjs. */}
          <Route path="email-renders/instantly-html" element={<InstantlyExportPage />} />
          {/* Headless endpoint consumed by scripts/generate-instantly-lead-fields.mjs. */}
          <Route path="email-renders/instantly-lead-fields" element={<InstantlyLeadFieldsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route
            path="*"
            element={
              <LocaleProvider locale={DEFAULT_LOCALE}>
                <NotFound />
              </LocaleProvider>
            }
          />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
