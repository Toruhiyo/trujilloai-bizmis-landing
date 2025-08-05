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

  if (updateUrl) {
    const newUrl = `${window.location.pathname}#${cleanSectionId}`;
    window.history.pushState({ section: cleanSectionId }, "", newUrl);
  }

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
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const sectionId = entry.target.id;
          const currentHash = window.location.hash.replace("#", "");

          if (sectionId && sectionId !== currentHash) {
            const newUrl =
              sectionId === "hero"
                ? window.location.pathname
                : `${window.location.pathname}#${sectionId}`;

            window.history.replaceState({ section: sectionId }, "", newUrl);
          }
        }
      });
    },
    {
      threshold: [0.5],
      rootMargin: "-20% 0px -20% 0px",
    }
  );

  sectionIds.forEach((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      observer.observe(element);
    }
  });

  return () => {
    observer.disconnect();
  };
};
