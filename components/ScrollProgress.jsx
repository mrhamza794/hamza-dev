"use client";

import { motion, useScroll, useSpring } from "framer-motion";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-9999 origin-left bg-linear-to-r from-purple-500 via-cyan-500 to-pink-500"
      style={{ scaleX }}
    />
  );
};

export default ScrollProgress;
