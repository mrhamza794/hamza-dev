"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

const TRAIL_DOTS = 5;

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  
  // Store trail positions
  const trailRef = useRef(Array(TRAIL_DOTS).fill({ x: -100, y: -100 }));
  const [trail, setTrail] = useState(Array(TRAIL_DOTS).fill({ x: -100, y: -100 }));

  useEffect(() => {
    // Only show custom cursor on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setIsVisible(true);

    const moveCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handlePointerEntry = () => setIsPointer(true);
    const handlePointerLeave = () => setIsPointer(false);

    window.addEventListener("mousemove", moveCursor);

    const attachListeners = () => {
      const clickables = document.querySelectorAll('a, button, input, textarea, [role="button"], [role="tab"]');
      clickables.forEach((el) => {
        el.addEventListener("mouseenter", handlePointerEntry);
        el.addEventListener("mouseleave", handlePointerLeave);
      });
      return clickables;
    };

    let clickables = attachListeners();

    // Re-attach listeners when pathname changes or slightly later to catch late-rendered dynamic imports
    const timeout = setTimeout(() => {
       clickables.forEach(el => {
          el.removeEventListener("mouseenter", handlePointerEntry);
          el.removeEventListener("mouseleave", handlePointerLeave);
       });
       clickables = attachListeners();
    }, 1000);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      clickables.forEach((el) => {
        el.removeEventListener("mouseenter", handlePointerEntry);
        el.removeEventListener("mouseleave", handlePointerLeave);
      });
      clearTimeout(timeout);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isVisible) return;

    let animationFrameId;
    
    const updateTrail = () => {
      const currentPositions = [...trailRef.current];
      
      // The first dot follows the main cursor
      currentPositions[0] = {
        x: currentPositions[0].x + (position.x - currentPositions[0].x) * 0.3,
        y: currentPositions[0].y + (position.y - currentPositions[0].y) * 0.3,
      };

      // Following dots follow the previous dot
      for (let i = 1; i < TRAIL_DOTS; i++) {
        currentPositions[i] = {
          x: currentPositions[i].x + (currentPositions[i - 1].x - currentPositions[i].x) * 0.25,
          y: currentPositions[i].y + (currentPositions[i - 1].y - currentPositions[i].y) * 0.25,
        };
      }

      trailRef.current = currentPositions;
      setTrail(currentPositions);
      
      animationFrameId = requestAnimationFrame(updateTrail);
    };
    
    updateTrail();
    return () => cancelAnimationFrame(animationFrameId);
  }, [position, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <div
        className="fixed pointer-events-none z-9999 rounded-full transition-transform duration-150 will-change-transform"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "10px",
          height: "10px",
          backgroundImage: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)",
          transform: `translate(-50%, -50%) scale(${isPointer ? 3 : 1})`,
          boxShadow: "0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)",
          filter: isPointer ? "blur(1px)" : "blur(0px)",
        }}
      />
      
      {trail.map((pos, index) => (
         <div
           key={index}
           className="fixed pointer-events-none z-9998 rounded-full mix-blend-screen will-change-transform"
           style={{
             left: `${pos.x}px`,
             top: `${pos.y}px`,
             width: `${8 - index}px`,
             height: `${8 - index}px`,
             backgroundColor: index % 2 === 0 ? "#8B5CF6" : "#06B6D4",
             opacity: isPointer ? 0 : 0.8 - (index * 0.15),
             transform: "translate(-50%, -50%)",
             boxShadow: `0 0 ${10 - index}px currentColor`,
           }}
         />
      ))}
    </>
  );
};

export default CustomCursor;
