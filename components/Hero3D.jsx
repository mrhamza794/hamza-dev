"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Mail, Briefcase, Code, Star } from "lucide-react";
import { PERSONAL_INFO } from "@/lib/constants";
import HeroCanvas from "./HeroCanvas";

const TypingSubtitle = ({ texts }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === texts[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), 2000);
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 75 : 150);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, texts]);

  return (
    <div className="text-base sm:text-lg md:text-xl font-medium text-cyan-400 font-inter mb-4 md:mb-5 flex items-center gap-2">
      <Code size={20} className="shrink-0 md:w-6 md:h-6" />
      <span>{texts[index].substring(0, subIndex)}</span>
      <span className="w-0.5 h-6 md:h-7 bg-cyan-400 animate-pulse ml-0.5" />
    </div>
  );
};

const LetterByLetter = ({ text }) => {
  const words = text.trim().split(/\s+/);
  const firstWordLen = words[0]?.length ?? 0;
  let idx = 0;

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.h1
      className="text-2xl min-[400px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-space mb-3 sm:mb-4 tracking-tight flex flex-wrap items-baseline gap-x-1.5 sm:gap-x-2 md:gap-x-3"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex flex-nowrap">
          {Array.from(word).map((letter, letterIndex) => {
            const i = idx++;
            const useGradient = words.length > 1 && i >= firstWordLen;
            return (
              <motion.span
                key={`${wordIndex}-${letterIndex}`}
                variants={child}
                className={useGradient ? "text-gradient" : ""}
              >
                {letter}
              </motion.span>
            );
          })}
        </span>
      ))}
    </motion.h1>
  );
};

const Hero3D = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  const stats = [
    { label: "Experience", value: PERSONAL_INFO.experience, icon: <Briefcase size={16} /> },
    { label: "Completed", value: "50+", icon: <Star size={16} /> },
    { label: "Technologies", value: "15+", icon: <Code size={16} /> },
  ];

  const subtitles = [
    "MERN Stack Developer",
    "Frontend Specialist",
    "UI/UX Enthusiast",
    "3D Graphics Designer",
  ];

  return (
    <section className="relative min-h-dvh flex items-center overflow-hidden pt-20 pb-8 sm:pt-24 sm:pb-10 md:pt-28 md:pb-12">
      <div className="absolute inset-0 z-0">
         <HeroCanvas />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-10 xl:gap-12 items-center">
          {/* Left Text Content */}
          <motion.div
            style={{ y: y1, opacity, scale }}
            className="glass-card bg-white/3! backdrop-blur-3xl! border-white/8! p-5 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl!"
          >
            {/* Greeting */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full glass-card bg-white/5 border-white/10 mb-4 sm:mb-5 text-slate-300 text-xs sm:text-sm font-medium"
            >
               <span className="animate-bounce text-base leading-none">👋</span> Hello, I'm
            </motion.div>

            {/* Name with Letter Animation */}
            <LetterByLetter text={PERSONAL_INFO.name} />

            {/* Typing Subtitle */}
            <TypingSubtitle texts={subtitles} />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="text-sm sm:text-base md:text-[0.95rem] lg:text-lg text-slate-300 mb-5 sm:mb-6 max-w-xl lg:max-w-none leading-snug sm:leading-relaxed"
            >
              {PERSONAL_INFO.bio}
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6"
            >
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="group rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 border bg-white/95 text-slate-900 shadow-[0_2px_8px_rgba(15,23,42,0.06)] border-slate-200/90 hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:border-cyan-500/35 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] dark:bg-slate-950/55 dark:text-white dark:border-white/10 dark:shadow-none dark:backdrop-blur-md dark:hover:-translate-y-1 dark:hover:border-white/15 dark:hover:shadow-[0_0_24px_rgba(139,92,246,0.25)]"
                >
                  <div className="mb-1.5 sm:mb-2 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div className="text-lg sm:text-xl font-bold tabular-nums text-gradient mb-0.5 leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide sm:tracking-widest leading-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="flex flex-wrap gap-3 sm:gap-4"
            >
              <button 
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl bg-linear-to-r from-purple-600 to-blue-600 font-space font-bold text-sm sm:text-base text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(37,99,235,0.45)] flex items-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                View My Work
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform sm:w-5 sm:h-5" />
              </button>
              
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl glass-card bg-transparent border-2 border-white/20 font-space font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:bg-white/10 hover:border-white/30 transition-all flex items-center gap-2"
              >
                Contact Me
                <Mail size={18} className="sm:w-5 sm:h-5" />
              </button>
            </motion.div>
          </motion.div>

          {/* Right Side - Empty space for 3D Scene to peek through better */}
          <div className="hidden lg:block h-full min-h-[min(420px,50dvh)]" />
        </div>
      </div>
    </section>
  );
};

export default Hero3D;
