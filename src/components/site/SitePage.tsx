import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import FilmFooter from "@/components/landing/FilmFooter";
import { cn } from "@/lib/utils";
import "@/styles/bzl-site.css";
// big screens (wider than 1440): the page grows with the screen, as "/" does
import "@/styles/big-screen.css";

/**
 * The site's own pages (Pricing, FAQs, Early Access) in the v2 landing's look:
 * the landing's fonts, tokens and palette (mirrored in bzl-site.css, scoped
 * under .bzl-site), the shared navbar as it reads on "/" once scrolled, the
 * landing's film footer, and a white canvas under one soft warm glow.
 */
const SitePage = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("bzl-site flex min-h-screen flex-col", className)}>
    <Navbar />
    <main className="bzl-site-main relative flex-1">
      <div aria-hidden="true" className="bzl-site-glow" />
      {children}
    </main>
    {/* a direct child of .bzl-site, which styles it as on "/" */}
    <FilmFooter />
  </div>
);

export default SitePage;
