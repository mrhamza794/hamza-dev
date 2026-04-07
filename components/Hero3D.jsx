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
    <div className="text-2xl font-medium text-cyan-400 font-inter mb-6 flex items-center gap-2">
      <Code size={24} />
      <span>{texts[index].substring(0, subIndex)}</span>
      <span className="w-1 h-8 bg-cyan-400 animate-pulse ml-1" />
    </div>
  );
};

const LetterByLetter = ({ text }) => {
  const letters = Array.from(text);
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
      className="text-5xl md:text-8xl font-bold font-space mb-6 tracking-tight flex flex-wrap"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={child}
          className={index >= 6 ? "text-gradient ml-2 md:ml-4" : ""}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
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
    { label: "Experience", value: PERSONAL_INFO.experience, icon: <Briefcase size={18} /> },
    { label: "Completed", value: "50+", icon: <Star size={18} /> },
    { label: "Technologies", value: "15+", icon: <Code size={18} /> },
  ];

  const subtitles = [
    "MERN Stack Developer",
    "Frontend Specialist",
    "UI/UX Enthusiast",
    "3D Graphics Designer",
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
         <HeroCanvas />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-center">
          {/* Left Text Content */}
          <motion.div
            style={{ y: y1, opacity, scale }}
            className="glass-card bg-white/3! backdrop-blur-3xl! border-white/8! p-8 md:p-16 rounded-[2.5rem]!"
          >
            {/* Greeting */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-card bg-white/5 border-white/10 mb-8 text-slate-300 text-sm font-medium"
            >
               <span className="animate-bounce">👋</span> Hello, I'm
            </motion.div>

            {/* Name with Letter Animation */}
            <LetterByLetter text="Hamza Choudhary" />

            {/* Typing Subtitle */}
            <TypingSubtitle texts={subtitles} />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="text-lg md:text-xl text-slate-300 mb-12 max-w-xl leading-relaxed"
            >
              {PERSONAL_INFO.bio}
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
            >
              {stats.map((stat, i) => (
                <div 
                  key={stat.label} 
                  className="glass-card bg-black/20! p-6 rounded-2xl hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all group"
                >
                  <div className="text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gradient mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest">
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
              className="flex flex-wrap gap-6"
            >
              <button 
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative px-8 py-4 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 font-space font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                View My Work
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 rounded-xl glass-card bg-transparent border-2 border-white/20 font-space font-bold text-white hover:bg-white/10 hover:border-white/30 transition-all flex items-center gap-3"
              >
                Contact Me
                <Mail size={20} />
              </button>
            </motion.div>
          </motion.div>

          {/* Right Side - Empty space for 3D Scene to peek through better */}
          <div className="hidden lg:block h-full min-h-[500px]" />
        </div>
      </div>
    </section>
  );
};

export default Hero3D;
