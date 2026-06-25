import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Briefcase, Code, Star, MapPin } from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { SiNextdotjs, SiNodedotjs, SiReact, SiTailwindcss, SiTypescript } from "react-icons/si";
import { PERSONAL_INFO } from "@/lib/constants";
import { useGSAP } from "@/hooks/useGSAP";
import HeroCanvas from "./HeroCanvas";
import Logo from "./Logo";

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
    <div className="hero-tagline text-base sm:text-lg font-medium text-cyan-400 font-inter flex items-center gap-2">
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
      className="hero-name text-2xl min-[400px]:text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold font-space tracking-tight flex flex-wrap items-baseline gap-x-1.5 sm:gap-x-2 md:gap-x-3 leading-[1.1]"
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
  const scopeRef = useGSAP(({ gsap, scope, isMobile, reduceMotion }) => {
    if (reduceMotion) return;

    const section = scope.querySelector("#home") || scope;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: isMobile ? 0.4 : 0.6,
      },
    });

    tl.to(
      ".hero-visual",
      {
        scale: isMobile ? 1 : 1.15,
        rotateY: isMobile ? 0 : 8,
        duration: 0.35,
      },
      0.3
    );
    tl.to(
      [".hero-badge", ".hero-tagline"],
      {
        opacity: 0.4,
        y: -20,
        duration: 0.3,
      },
      0.3
    );

    tl.to(
      ".hero-name",
      {
        scale: 0.9,
        opacity: 0,
        y: -60,
        duration: 0.3,
      },
      0.65
    );
    tl.to(
      [".hero-description", ".hero-stats", ".hero-ctas"],
      {
        opacity: 0,
        y: -40,
        duration: 0.25,
      },
      0.65
    );
    tl.to(
      ".hero-visual",
      {
        scale: isMobile ? 1 : 0.7,
        opacity: 0,
        duration: 0.3,
      },
      0.7
    );
    tl.to(".hero-orb-1", { x: -150, y: -100, opacity: 0, duration: 0.35 }, 0.65);
    tl.to(".hero-orb-2", { x: 150, y: 100, opacity: 0, duration: 0.35 }, 0.65);

    return () => tl.scrollTrigger?.kill();
  }, []);

  const stats = [
    { label: "Experience", value: PERSONAL_INFO.experience, icon: <Briefcase size={16} /> },
    { label: "Completed", value: "50+", icon: <Star size={16} /> },
    { label: "Technologies", value: "15+", icon: <Code size={16} /> },
  ];

  const subtitles = [
    "MERN Stack Developer",
    "Frontend Specialist",
    "UI/UX Enthusiast",
    "RESTful API Engineer",
  ];

  const heroStack = [
    { Icon: SiNextdotjs, label: "Next.js", color: "text-slate-900 dark:text-white" },
    { Icon: SiReact, label: "React", color: "text-cyan-600 dark:text-cyan-400" },
    { Icon: SiTypescript, label: "TypeScript", color: "text-blue-600 dark:text-blue-400" },
    { Icon: SiNodedotjs, label: "Node.js", color: "text-emerald-600 dark:text-emerald-400" },
    { Icon: Code, label: "REST APIs", color: "text-violet-600 dark:text-violet-400" },
    { Icon: SiTailwindcss, label: "Tailwind", color: "text-sky-600 dark:text-sky-400" },
  ];

  return (
    <section id="home" ref={scopeRef} className="relative hero-viewport__inner">
      <div className="relative flex h-full min-h-0 w-full items-stretch">
          <div className="absolute inset-0 z-1 pointer-events-none">
            <HeroCanvas />
          </div>

          <div className="relative z-20 isolate mx-auto flex h-full min-h-0 w-full max-w-[1800px] px-4 py-4 sm:px-6 sm:py-5 lg:px-10 lg:py-6 xl:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="hero-panel relative flex min-h-0 flex-1 flex-col rounded-xl sm:rounded-2xl lg:rounded-3xl border border-white/15 bg-linear-to-br from-white/9 via-white/4 to-transparent shadow-[0_8px_40px_rgba(15,23,42,0.06)] backdrop-blur-md backdrop-saturate-125 dark:border-white/10 dark:from-white/[0.07] dark:via-white/3 dark:to-transparent dark:shadow-[0_12px_48px_rgba(0,0,0,0.25)] dark:backdrop-blur-md"
            >
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-purple-500/4 via-transparent to-cyan-500/6" />
              <div
                className="hero-orb-1 pointer-events-none absolute -left-16 top-1/4 h-48 w-48 rounded-full bg-purple-500/20 blur-[80px]"
                aria-hidden
              />
              <div
                className="hero-orb-2 pointer-events-none absolute -right-16 bottom-1/4 h-48 w-48 rounded-full bg-cyan-500/20 blur-[80px]"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 dark:ring-white/5" />

              <div className="hero-content-grid relative grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto p-4 sm:gap-8 sm:p-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(240px,0.38fr)] lg:gap-x-10 lg:overflow-hidden lg:p-8 xl:gap-x-14">
                <div className="hero-main-col flex min-h-0 min-w-0 flex-col justify-between">
                  <div className="hero-intro-block flex flex-col">
                    <motion.div
                      initial={{ x: -24, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.8 }}
                      className="hero-badge inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/6 px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 sm:text-sm"
                    >
                      <span className="animate-bounce text-base leading-none">👋</span> Hello, I&apos;m
                    </motion.div>

                    <LetterByLetter text={PERSONAL_INFO.name} />
                    <TypingSubtitle texts={subtitles} />

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2, duration: 1 }}
                      className="hero-description max-w-lg text-sm leading-[1.7] text-slate-600 dark:text-slate-300 sm:text-base sm:leading-[1.75] lg:max-w-xl"
                    >
                      {PERSONAL_INFO.bio}
                    </motion.p>
                  </div>

                  <div className="hero-actions-block flex flex-col">
                    <motion.div
                      initial={{ y: 24, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.45, duration: 0.75 }}
                      className="hero-stats hero-stats-row flex flex-wrap gap-6 sm:gap-10"
                    >
                      {stats.map((stat) => (
                        <div key={stat.label} className="text-center sm:text-left">
                          <div className="mb-1.5 flex justify-center text-cyan-600 sm:justify-start dark:text-cyan-400">
                            {stat.icon}
                          </div>
                          <p className="font-space text-xl font-bold tabular-nums text-gradient sm:text-2xl">
                            {stat.value}
                          </p>
                          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </motion.div>

                    <motion.div
                      initial={{ y: 24, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.75, duration: 0.75 }}
                      className="hero-ctas flex flex-wrap gap-3 sm:gap-4"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="hero-cta-primary group relative flex items-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-purple-600 to-blue-600 px-5 py-2.5 font-space text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(37,99,235,0.45)] sm:px-6 sm:py-3 sm:text-base"
                      >
                        <div className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                        View My Work
                        <ArrowRight
                          size={18}
                          className="transition-transform group-hover:translate-x-0.5 sm:h-5 sm:w-5"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="flex items-center gap-2 rounded-xl border-2 border-white/20 bg-white/4 px-5 py-2.5 font-space text-sm font-bold text-slate-900 transition-all hover:border-white/30 hover:bg-white/10 dark:text-white sm:px-6 sm:py-3 sm:text-base"
                      >
                        Contact Me
                        <Mail size={18} className="sm:h-5 sm:w-5" />
                      </button>
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="hero-side-col relative z-30 flex min-h-0 flex-col justify-between border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 xl:pl-10 dark:border-white/8"
                  style={{ perspective: 1200 }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="hero-visual hero-logo-panel logo-backdrop-panel relative min-h-32 w-full flex-1 overflow-hidden rounded-2xl bg-transparent sm:min-h-40 lg:min-h-48 lg:rounded-2xl"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <Logo variant="backdrop" clickable={false} />
                  </motion.div>

                  <div className="hero-side-meta flex flex-col">
                    <div>
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Stack
                      </p>
                      <div className="flex flex-wrap gap-5 sm:gap-6">
                        {heroStack.map(({ Icon, label, color }) => (
                          <Icon
                            key={label}
                            className={`h-7 w-7 shrink-0 opacity-90 transition-opacity hover:opacity-100 ${color}`}
                            title={label}
                            aria-label={label}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <MapPin
                        className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400"
                        aria-hidden
                      />
                      <span>{PERSONAL_INFO.location}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        Open to opportunities
                      </span>
                      <div className="flex gap-2 lg:ml-auto">
                        <a
                          href={PERSONAL_INFO.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/6 text-slate-800 transition-colors hover:border-purple-500/35 hover:text-purple-600 dark:text-white dark:hover:text-cyan-400"
                          aria-label="GitHub"
                        >
                          <FaGithub className="h-[18px] w-[18px]" />
                        </a>
                        <a
                          href={PERSONAL_INFO.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/6 text-slate-800 transition-colors hover:border-cyan-500/35 hover:text-cyan-600 dark:text-white dark:hover:text-cyan-400"
                          aria-label="LinkedIn"
                        >
                          <FaLinkedinIn className="h-[18px] w-[18px]" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
    </section>
  );
};

export default Hero3D;
