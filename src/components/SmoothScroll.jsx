import { useEffect } from "react";
import Lenis from "lenis";
import { registerLenis, scrollToHash } from "@/lib/scroll";

const SmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({
      wrapper: document.documentElement,
      content: document.body,
      duration: 1.2,
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      lerp: 0.1,
    });

    registerLenis(lenis);

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    const scrollToInitialHash = () => {
      const { hash } = window.location;
      if (hash) scrollToHash(hash);
    };

    requestAnimationFrame(scrollToInitialHash);

    return () => {
      cancelAnimationFrame(rafId);
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
};

export default SmoothScroll;
