import { motion, useInView } from "framer-motion";
import {
  Bug,
  Code2,
  Coffee,
  GitBranch,
  Globe,
  Moon,
  Music,
  Rocket,
} from "lucide-react";
import { useGSAP } from "@/hooks/useGSAP";

function StatCard({ stat, index, active }) {
  const Icon = stat.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 48 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full"
    >
      <div
        className={`glass-card glass-card--lg relative flex h-full min-h-[260px] flex-col items-center justify-center overflow-hidden rounded-3xl p-6 text-center transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl sm:min-h-[280px] sm:p-8 ${stat.hoverShadow}`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle at 50% 30%, ${stat.glowColor}, transparent 70%)` }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ boxShadow: `inset 0 0 0 1px ${stat.glowColor}, 0 0 40px ${stat.glowColor}` }}
          aria-hidden
        />

        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: index * 0.2, ease: "easeInOut" }}
          className={`relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br sm:mb-5 sm:h-20 sm:w-20 ${stat.iconBg} ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon size={36} className={`sm:hidden ${stat.iconClass}`} strokeWidth={1.75} aria-hidden />
          <Icon size={40} className={`hidden sm:block ${stat.iconClass}`} strokeWidth={1.75} aria-hidden />
        </motion.div>

        <p
          className={`relative z-10 font-space text-3xl font-bold tabular-nums sm:text-4xl md:text-5xl bg-linear-to-br ${stat.color} bg-clip-text text-transparent`}
        >
          {stat.prefix && <span className="stat-prefix">{stat.prefix}</span>}
          <span className="stat-number" data-target={stat.number}>
            0
          </span>
          {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
        </p>

        <h3 className="relative z-10 mt-2 font-space text-base font-semibold text-slate-800 sm:mt-3 sm:text-lg dark:text-slate-100">
          {stat.label}
        </h3>
        <p className="relative z-10 mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">{stat.description}</p>
      </div>
    </motion.article>
  );
}

const STATS = [
  {
    icon: Code2,
    number: 500000,
    suffix: "+",
    label: "Lines of Code",
    description: "And counting...",
    color: "from-purple-400 to-purple-600",
    iconBg: "from-purple-500/25 to-purple-600/5",
    iconClass: "text-purple-500 dark:text-purple-400",
    glowColor: "rgba(139, 92, 246, 0.35)",
    hoverShadow: "hover:shadow-purple-500/20",
  },
  {
    icon: Coffee,
    number: 2847,
    label: "Coffee Cups",
    description: "Fuel for code",
    color: "from-cyan-400 to-cyan-600",
    iconBg: "from-cyan-500/25 to-cyan-600/5",
    iconClass: "text-cyan-500 dark:text-cyan-400",
    glowColor: "rgba(6, 182, 212, 0.35)",
    hoverShadow: "hover:shadow-cyan-500/20",
  },
  {
    icon: Bug,
    number: 1234,
    label: "Bugs Fixed",
    description: "Squashed with pride",
    color: "from-pink-400 to-pink-600",
    iconBg: "from-pink-500/25 to-pink-600/5",
    iconClass: "text-pink-500 dark:text-pink-400",
    glowColor: "rgba(236, 72, 153, 0.35)",
    hoverShadow: "hover:shadow-pink-500/20",
  },
  {
    icon: Rocket,
    number: 50,
    suffix: "+",
    label: "Projects Completed",
    description: "Shipped to production",
    color: "from-teal-400 to-teal-600",
    iconBg: "from-teal-500/25 to-teal-600/5",
    iconClass: "text-teal-500 dark:text-teal-400",
    glowColor: "rgba(20, 184, 166, 0.35)",
    hoverShadow: "hover:shadow-teal-500/20",
  },
  {
    icon: GitBranch,
    number: 52,
    label: "GitHub Commits",
    description: "This week",
    color: "from-violet-400 to-violet-600",
    iconBg: "from-violet-500/25 to-violet-600/5",
    iconClass: "text-violet-500 dark:text-violet-400",
    glowColor: "rgba(139, 92, 246, 0.35)",
    hoverShadow: "hover:shadow-violet-500/20",
  },
  {
    icon: Moon,
    number: 73,
    suffix: "%",
    label: "Night Owl Score",
    description: "Most productive after 10 PM",
    color: "from-indigo-400 to-indigo-600",
    iconBg: "from-indigo-500/25 to-indigo-600/5",
    iconClass: "text-indigo-500 dark:text-indigo-400",
    glowColor: "rgba(99, 102, 241, 0.35)",
    hoverShadow: "hover:shadow-indigo-500/20",
  },
  {
    icon: Music,
    number: 794,
    label: "Playlist Songs",
    description: "In coding playlists",
    color: "from-fuchsia-400 to-fuchsia-600",
    iconBg: "from-fuchsia-500/25 to-pink-600/5",
    iconClass: "text-fuchsia-500 dark:text-pink-400",
    glowColor: "rgba(217, 70, 239, 0.35)",
    hoverShadow: "hover:shadow-fuchsia-500/20",
  },
  {
    icon: Globe,
    number: 127,
    label: "Chrome Tabs",
    description: "Open right now (help)",
    color: "from-sky-400 to-sky-600",
    iconBg: "from-sky-500/25 to-sky-600/5",
    iconClass: "text-sky-500 dark:text-sky-400",
    glowColor: "rgba(14, 165, 233, 0.35)",
    hoverShadow: "hover:shadow-sky-500/20",
  },
];

export default function DeveloperStats() {
  const scopeRef = useGSAP(({ gsap, scope, reduceMotion }) => {
    if (reduceMotion) return;

    const numbers = scope.querySelectorAll(".stat-number");

    numbers.forEach((el) => {
      const target = parseInt(el.dataset.target || el.textContent.replace(/\D/g, ""), 10);
      if (!target) return;

      gsap.fromTo(
        el,
        { textContent: 0 },
        {
          textContent: target,
          duration: 1.5,
          ease: "power1.out",
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onUpdate() {
            el.textContent = Math.floor(Number(el.textContent)).toLocaleString();
          },
        }
      );
    });
  }, []);

  const inView = useInView(scopeRef, { once: true, amount: 0.15 });

  return (
    <section
      id="dev-stats"
      ref={scopeRef}
      className="relative scroll-mt-24 overflow-hidden py-24 px-4 sm:px-6 md:py-32"
      aria-labelledby="dev-stats-title"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-[120px]" />
        <div
          className="absolute right-1/4 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-cyan-500/10 blur-[120px]"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/5 blur-[100px]" />
      </div>

      <div className="home-container">
        <motion.header
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center md:mb-20"
        >
          <h2
            id="dev-stats-title"
            className="scroll-mt-24 font-space text-4xl font-bold text-gradient sm:text-5xl md:text-6xl"
          >
            By The Numbers
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 md:text-xl">
            A glimpse into my coding life
          </p>
          <motion.div
            className="mx-auto mt-6 h-1 w-24 rounded-full bg-linear-to-r from-purple-500 to-cyan-500"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          />
        </motion.header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} active={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
