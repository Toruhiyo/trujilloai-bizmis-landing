import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

type PublicPageLayoutProps = {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  /**
   * Page defines its own #hero (with Navbar inside, like the landing Hero).
   * Layout skips the default fixed navbar + top padding.
   */
  hasHero?: boolean;
};

const PublicPageLayout = ({
  children,
  className,
  mainClassName,
  hasHero = false,
}: PublicPageLayoutProps) => {
  if (hasHero) {
    return (
      <div className={cn("min-h-screen flex flex-col", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      <Navbar />
      <main className={cn("flex-1 pt-12 sm:pt-16", mainClassName)}>
        {children}
      </main>
    </div>
  );
};

export default PublicPageLayout;
