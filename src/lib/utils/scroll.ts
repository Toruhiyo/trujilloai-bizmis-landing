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
