import { useEffect, useRef } from "react";
import { onLenisScroll } from "@/lib/scroll";

const DEFAULT_SCOPE = "main[data-home-scroll]";

export function useHomeScrollProgress(scopeSelector = DEFAULT_SCOPE) {
  const progressRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let frame = null;

    const compute = () => {
      const scope = document.querySelector(scopeSelector);
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (!scope) {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        progressRef.current = Math.min(1, Math.max(0, scrollTop / max));
        return;
      }

      const scopeTop = scope.offsetTop;
      const max = Math.max(1, scope.offsetHeight - window.innerHeight);
      const scrolled = scrollTop - scopeTop;

      progressRef.current = Math.min(1, Math.max(0, scrolled / max));
    };

    // Lenis fires its own scroll event in addition to the native one —
    // batching to a single rAF per tick avoids redundant recompute.
    const scheduleUpdate = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        compute();
        frame = null;
      });
    };

    compute();

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    const unsubscribeLenis = onLenisScroll(scheduleUpdate);
    const refreshTimeout = setTimeout(compute, 400);

    return () => {
      clearTimeout(refreshTimeout);
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      unsubscribeLenis();
    };
  }, [scopeSelector]);

  return progressRef;
}