export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

export const float = {
  animate: {
    y: [0, -20, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  }
};

export const glow = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(139, 92, 246, 0.3)",
      "0 0 60px rgba(139, 92, 246, 0.6)",
      "0 0 20px rgba(139, 92, 246, 0.3)"
    ],
    transition: { duration: 2, repeat: Infinity }
  }
};
