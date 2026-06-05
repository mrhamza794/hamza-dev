/** Device capability tiers — used to degrade heavy effects without changing layout. */

export const PERF_TIERS = {
  REDUCED: "reduced",
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

export function getPerformanceTier() {
  if (typeof window === "undefined") return PERF_TIERS.MEDIUM;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return PERF_TIERS.REDUCED;
  }

  const connection = navigator.connection;
  if (connection?.saveData) return PERF_TIERS.LOW;
  if (connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g") {
    return PERF_TIERS.LOW;
  }

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = navigator.deviceMemory ?? 4;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  if (isMobile || isTouch) return PERF_TIERS.LOW;

  const isHighEnd = cores >= 8 && memory >= 8;
  if (isHighEnd) return PERF_TIERS.HIGH;

  return PERF_TIERS.MEDIUM;
}

export function shouldUseScrollProgress(tier) {
  return tier === PERF_TIERS.HIGH;
}

export function shouldUseCustomCursor(tier) {
  if (typeof window === "undefined") return false;
  return tier === PERF_TIERS.HIGH && window.matchMedia("(pointer: fine)").matches;
}

export function applyPerformanceClass(tier) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.remove("perf-reduced", "perf-low", "perf-medium", "perf-high");
  root.classList.add(`perf-${tier}`);
}
