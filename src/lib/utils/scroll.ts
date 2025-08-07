// Extend Window interface to include our custom property
declare global {
  interface Window {
    isProgrammaticScroll?: boolean;
    lastProgrammaticScrollTime?: number;
  }
}

export const scrollToTop = (behavior: ScrollBehavior = "smooth"): void => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior,
  });
};

export const scrollToElement = (
  elementId: string,
  behavior: ScrollBehavior = "smooth",
  offset: number = 0
): void => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition =
      element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior,
    });
  }
};

export const scrollToSection = (
  sectionId: string,
  updateUrl: boolean = true,
  behavior: ScrollBehavior = "smooth",
  offset: number = 80
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

  scrollToElement(cleanSectionId, behavior, offset);
};

export const setupScrollToSectionOnLoad = (): (() => void) => {
  const handleInitialScroll = () => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        scrollToSection(hash, false, "smooth");
      }, 100);
    }
  };

  const handleHashChange = () => {
    const hash = window.location.hash;
    if (hash) {
      scrollToSection(hash, false, "smooth");
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
