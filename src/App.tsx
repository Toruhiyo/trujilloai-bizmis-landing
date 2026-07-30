import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import FAQs from "./pages/FAQs";
import Contact from "./pages/Contact";
import EarlyAccess from "./pages/EarlyAccess";
import Pricing from "./pages/Pricing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Slides from "./pages/Slides";
import ShopifyDeck from "./pages/slides/ShopifyDeck";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import InviteCardsIndex from "./pages/admin/InviteCardsIndex";
import EarlyAccessCardPage from "./pages/admin/EarlyAccessCardPage";
import MockupRenderPage from "./pages/email-renders/MockupRenderPage";
import InstantlyExportPage from "./pages/email-renders/InstantlyExportPage";
import InstantlyLeadFieldsPage from "./pages/email-renders/InstantlyLeadFieldsPage";
import NotFound from "./pages/NotFound";
import Unsubscribe from "./pages/Unsubscribe";
import AttributionTracker from "./components/AttributionTracker";
import { LocaleRoute, LocalizedRedirect } from "./i18n/LocaleRoute";
import { LocaleProvider } from "./i18n/LocaleProvider";
import { DEFAULT_LOCALE } from "./i18n/locales";

const queryClient = new QueryClient();

/**
 * Public, localizable routes. Rendered twice: unprefixed (English, the
 * default) and nested under `/:locale` for es/fr/it/ca. Kept as a plain
 * function (not a JSX component) — `<Routes>` only flattens `Route`
 * elements and `Fragment`s, so a custom component wrapping them here
 * would be invisible to its route matching.
 */
const publicLocalizedRoutes = () => [
  <Route key="index" index element={<Index />} />,
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AttributionTracker />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
