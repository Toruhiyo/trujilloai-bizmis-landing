import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import FAQs from "./pages/FAQs";
import Contact from "./pages/Contact";
import JoinWaitlist from "./pages/JoinWaitlist";
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
import NotFound from "./pages/NotFound";
import AttributionTracker from "./components/AttributionTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AttributionTracker />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/join-waitlist" element={<JoinWaitlist />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
