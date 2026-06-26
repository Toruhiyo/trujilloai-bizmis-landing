// Extend Window interface to include our custom property
declare global {
  interface Window {
    isProgrammaticScroll?: boolean;
    lastProgrammaticScrollTime?: number;
  }
}

const SECTION_SCROLL_GAP_PX = 8;
const FALLBACK_NAVBAR_HEIGHT_PX = 64;

export const getSectionScrollOffset = (): number => {
  const nav = document.getElementById("site-navbar");
  const navHeight =
    nav?.getBoundingClientRect().height ?? FALLBACK_NAVBAR_HEIGHT_PX;

  return navHeight + SECTION_SCROLL_GAP_PX;
};

export const scrollToTop = (behavior: ScrollBehavior = "smooth"): void => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior,
  });
};

export const scrollToElement = (
  elementId: string,
  behavior: ScrollBehavior = "smooth"
): void => {
  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  const offset = getSectionScrollOffset();
  const top =
    element.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top, behavior });
};

export const scrollToSection = (
  sectionId: string,
  updateUrl: boolean = true,
  behavior: ScrollBehavior = "smooth"
): void => {
  const cleanSectionId = sectionId.replace("#", "");

  // Set programmatic scroll flag and timestamp to prevent URL override during scroll
  window.isProgrammaticScroll = true;
  window.lastProgrammaticScrollTime = Date.now();

  if (updateUrl) {
    const newUrl = `${window.location.pathname}#${cleanSectionId}`;
    window.history.pushState({ section: cleanSectionId }, "", newUrl);
  }

  // Clear the flag after scroll animation completes
  const scrollDuration = behavior === "smooth" ? 2000 : 300;
  setTimeout(() => {
    window.isProgrammaticScroll = false;
  }, scrollDuration);

  scrollToElement(cleanSectionId, behavior);
};

const scrollToHashWhenReady = (
  hash: string,
  behavior: ScrollBehavior = "smooth"
): void => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToSection(hash, false, behavior);
    });
  });
};

export const setupScrollToSectionOnLoad = (): (() => void) => {
  const handleInitialScroll = () => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        scrollToHashWhenReady(hash);
      }, 150);
    }
  };

  const handleHashChange = () => {
    const hash = window.location.hash;
    if (hash) {
      scrollToHashWhenReady(hash);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", handleInitialScroll);
  } else {
    handleInitialScroll();
  }

  window.addEventListener("hashchange", handleHashChange);

  return () => {
    document.removeEventListener("DOMContentLoaded", handleInitialScroll);
    window.removeEventListener("hashchange", handleHashChange);
  };
};

export const setupScrollToUrlUpdater = (sectionIds: string[]): (() => void) => {
  // Completely disable automatic URL updating
  // Only manual navigation (clicking links, typing URLs) should change the hash

  // Return a no-op cleanup function
  return () => {
    // No cleanup needed since we're not setting up any observers
  };
};
