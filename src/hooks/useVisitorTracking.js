import { createContext, useCallback, useContext, useEffect, useRef } from "react";

const SESSION_KEY = "portfolio_session_id";
const VisitorTrackingContext = createContext(null);

function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getOrCreateSessionId() {
  if (typeof window === "undefined") return null;

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

function patchBehavior(sessionId, behavior) {
  if (!sessionId) return;

  fetch("/api/visitors/behavior", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, behavior }),
  }).catch(console.error);
}

function useVisitorTrackingCore(enabled) {
  const trackedRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const sessionId = useRef(null);

  const trackContactClick = useCallback(() => {
    if (!enabled) return;
    patchBehavior(sessionId.current, { clickedContact: true });
  }, [enabled]);

  const trackGamePlayed = useCallback(() => {
    if (!enabled) return;
    patchBehavior(sessionId.current, { playedGame: true });
  }, [enabled]);

  useEffect(() => {
    if (!enabled || trackedRef.current) return;
    trackedRef.current = true;

    sessionId.current = getOrCreateSessionId();
    if (!sessionId.current) return;

    const visitorData = {
      sessionId: sessionId.current,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
      },
      language: navigator.language || null,
      referrer: document.referrer || null,
      connectionType: navigator.connection?.effectiveType || null,
      utm_source: new URLSearchParams(window.location.search).get("utm_source"),
      utm_medium: new URLSearchParams(window.location.search).get("utm_medium"),
      utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign"),
      behavior: {
        timeOnSite: 0,
        scrollDepth: 0,
        sectionsVisited: [],
        clickedContact: false,
        playedGame: false,
      },
    };

    fetch("/api/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visitorData),
    }).catch(console.error);

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      patchBehavior(sessionId.current, { scrollDepth: scrollPercent });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visitedSections = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target.id)
          .filter(Boolean);

        if (visitedSections.length > 0) {
          patchBehavior(sessionId.current, { sectionsVisited: visitedSections });
        }
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll("section[id]").forEach((section) => {
      sectionObserver.observe(section);
    });

    const timeInterval = setInterval(() => {
      const timeOnSite = Math.round((Date.now() - startTimeRef.current) / 1000);
      patchBehavior(sessionId.current, { timeOnSite });
    }, 30000);

    let scrollTimeout;
    const throttledScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        handleScroll();
        scrollTimeout = null;
      }, 2000);
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener("scroll", throttledScroll);
      sectionObserver.disconnect();

      const finalTime = Math.round((Date.now() - startTimeRef.current) / 1000);
      const payload = JSON.stringify({
        sessionId: sessionId.current,
        behavior: { timeOnSite: finalTime },
      });
      navigator.sendBeacon(
        "/api/visitors/behavior",
        new Blob([payload], { type: "application/json" })
      );
    };
  }, [enabled]);

  return { trackContactClick, trackGamePlayed };
}

export function VisitorTrackingProvider({ children, enabled = true }) {
  const value = useVisitorTrackingCore(enabled);
  return (
    <VisitorTrackingContext.Provider value={value}>{children}</VisitorTrackingContext.Provider>
  );
}

export function useVisitorTracking() {
  const context = useContext(VisitorTrackingContext);
  if (!context) {
    throw new Error("useVisitorTracking must be used within VisitorTrackingProvider");
  }
  return context;
}
