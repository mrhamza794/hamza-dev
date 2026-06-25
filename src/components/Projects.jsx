import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ExternalLink, Code2, ArrowRight } from "lucide-react";
import { ScrollTrigger } from "@/lib/gsapConfig";

const PROJECTS = [
  {
    id: 1,
    name: "CommerceCore",
    description: "Scalable e-commerce platform with product catalog, checkout flow, payments integration, and admin inventory controls.",
    homepage: "#",
    topics: ["nextjs", "node", "mongodb"]
  },
  {
    id: 2,
    name: "Personal Brand Portfolio",
    description: "Modern developer portfolio with animated sections, responsive layouts, and fast loading optimizations.",
    homepage: "#",
    topics: ["react", "framer-motion", "tailwind"]
  },
  {
    id: 3,
    name: "Business Site Suite",
    description: "Corporate website package with service pages, lead forms, SEO structure, and analytics-ready setup.",
    homepage: "#",
    topics: ["nextjs", "seo", "cms"]
  },
  {
    id: 4,
    name: "SalesFlow CRM",
    description: "CRM dashboard for lead tracking, deal pipeline, team assignments, and customer communication history.",
    homepage: "#",
    topics: ["react", "redux", "charts"]
  },
  {
    id: 5,
    name: "OpsControl Panel",
    description: "Custom admin panel for multi-role management, workflow automation, and configurable business modules.",
    homepage: "#",
    topics: ["admin", "rbac", "api"]
  },
  {
    id: 6,
    name: "Client Portal Pro",
    description: "Secure client portal for project updates, document exchange, support tickets, and account controls.",
    homepage: "#",
    topics: ["portal", "auth", "files"]
  },
  {
    id: 7,
    name: "BookingFlow Platform",
    description: "Booking and scheduling system with calendar sync, reminders, service slots, and payment support.",
    homepage: "#",
    topics: ["calendar", "booking", "payments"]
  },
  {
    id: 8,
    name: "InsightBoard BI",
    description: "Business intelligence dashboard with KPI tracking, custom reports, and role-based data visibility.",
    homepage: "#",
    topics: ["dashboard", "kpi", "reports"]
  },
];

const Projects = () => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [metrics, setMetrics] = useState({ scrollDistance: 0, sectionHeight: 0 });

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;

      const trackWidth = track.scrollWidth;
      const viewWidth = window.innerWidth;
      const endPadding = 48;
      const scrollDistance = Math.max(0, trackWidth - viewWidth + endPadding);
      const sectionHeight = window.innerHeight + scrollDistance;

      setMetrics({ scrollDistance, sectionHeight });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (trackRef.current) observer.observe(trackRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const xTransform = useTransform(scrollYProgress, [0, 1], [0, -metrics.scrollDistance]);

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative"
      style={{ height: metrics.sectionHeight > 0 ? metrics.sectionHeight : "100vh" }}
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        {/* Frosted glass backdrop — light tint, mostly transparent */}
        <div
          className="pointer-events-none absolute inset-0 glass-section-bg"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-purple-500/3 via-transparent to-cyan-500/4 dark:from-purple-500/5 dark:to-cyan-500/6"
          aria-hidden
        />

        {/* Parallax orbs */}
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, 300]) }}
          className="absolute top-10 left-10 w-[500px] h-[500px] bg-purple-400/10 dark:bg-purple-600/6 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -300]) }}
          className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-400/8 dark:bg-cyan-600/6 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="home-container z-10 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-space text-gradient mb-4">
            Selected Works
          </h2>
          <div className="w-24 h-1 bg-linear-to-r from-purple-500 to-cyan-500 rounded-full mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
            A curated showcase of production-grade project types I build for modern businesses.
          </p>
        </div>

        {/* Scroll-mapped Horizontal Track */}
        <div className="relative z-10 w-full flex">
          <motion.div
            ref={trackRef}
            className="flex min-w-max gap-8 px-6 pr-12 md:px-20 md:pr-24"
            style={{ x: xTransform }}
          >
            {PROJECTS.map((repo, idx) => {
              // Subtle localized scroll progress per card to create 3D folding
              return (
                <ProjectCard key={repo.id || idx} repo={repo} idx={idx} />
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Extracted card for intersection isolating
const ProjectCard = ({ repo, idx }) => {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["0 1", "1 0"]
  });

  // Scale bounces gently as it crosses the viewport center natively via R3F 
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-25, 0, 25]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);

  return (
    <motion.div
      ref={cardRef}
      style={{ scale, rotateY, opacity }}
      className="relative w-[300px] md:w-[450px] shrink-0 glass-card glass-card--lg p-8 rounded-3xl shadow-2xl perspective"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-purple-500/15 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
          <Code2 size={32} />
        </div>
        <div className="flex gap-3">
          {repo.homepage && (
            <a href={repo.homepage} target="_blank" rel="noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              <ExternalLink size={20} />
            </a>
          )}
          <a href={repo.homepage || "#"} target="_blank" rel="noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            <ArrowRight size={20} />
          </a>
        </div>
      </div>

      <h3 className="text-2xl font-bold font-space text-slate-900 dark:text-white mb-3 truncate" title={repo.name}>
        {repo.name}
      </h3>
      
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 h-[60px] overflow-hidden line-clamp-3">
        {repo.description || "No description provided for this repository."}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {repo.topics && repo.topics.length > 0 ? (
          repo.topics.slice(0, 3).map(topic => (
            <span key={topic} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-cyan-400">
              {topic}
            </span>
          ))
        ) : (
          <span className="px-3 py-1 bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-full text-xs text-slate-600 dark:text-slate-400">
            {repo.language || "Code"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-6 pt-6 border-t border-slate-200/80 dark:border-white/10 mt-auto">
        <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">
          Real-world implementation
        </span>
      </div>
    </motion.div>
  );
};

export default Projects;
