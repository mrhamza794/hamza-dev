/** Shared scroll helper — keeps nav/footer anchors in sync with Lenis */

let lenisInstance = null;

export function registerLenis(instance) {
  lenisInstance = instance ?? null;
}

export function getLenis() {
  return lenisInstance;
}

/** Navbar bottom edge + section scroll-margin (matches CSS scroll-mt-*) */
export function getScrollOffset(element, extraGap = 12) {
  const nav = document.querySelector("nav");
  const navBottom = nav?.getBoundingClientRect().bottom ?? 88;
  const scrollMarginTop = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;

  return navBottom + scrollMarginTop + extraGap;
}

export function scrollToHash(hash, offset) {
  const id = hash.replace(/^#/, "");
  if (!id) return false;

  const element = document.getElementById(id);
  if (!element) return false;

  const totalOffset = offset ?? getScrollOffset(element);

  if (lenisInstance) {
    lenisInstance.scrollTo(element, { offset: -totalOffset, immediate: false });
    return true;
  }

  const top = element.offsetTop - totalOffset;
  window.scrollTo({ top, behavior: "smooth" });
  return true;
}

export function onLenisScroll(callback) {
  if (!lenisInstance) return () => {};

  lenisInstance.on("scroll", callback);
  return () => lenisInstance.off("scroll", callback);
}
