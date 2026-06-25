"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";

/** callback receives context; return a cleanup fn or nothing */
export function useGSAP(callback, deps = []) {
  const scopeRef = useRef(null);

  useEffect(() => {
    if (!scopeRef.current) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isDesktop, isMobile, reduceMotion } = context.conditions;
        return callback({ gsap, ScrollTrigger, scope: scopeRef.current, isDesktop, isMobile, reduceMotion });
      }
    );

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scopeRef;
}
