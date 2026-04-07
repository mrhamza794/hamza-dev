"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ExternalLink, Github, Star, GitFork, ArrowRight } from "lucide-react";
import { GITHUB_USERNAME } from "@/lib/constants";

// Fallback data in case of API failure
const FALLBACK_PROJECTS = [
  {
    id: 1,
    name: "ePortfolio",
    description: "Next.js 3D Portfolio built with React Three Fiber, Tailwind CSS v4, and modern glassmorphism design.",
    html_url: "https://github.com/mrhamza794/ePortfolio",
    homepage: "https://hamzadev.vercel.app",
    stargazers_count: 5,
    language: "JavaScript",
    topics: ["react", "nextjs", "threejs", "tailwind"]
  },
  {
    id: 2,
    name: "AI-Analytics-Dashboard",
    description: "A machine learning dashboard that visualizes predictive data using Python, React, and Recharts.",
    html_url: "https://github.com/mrhamza794",
    stargazers_count: 3,
    language: "TypeScript",
    topics: ["ai", "react", "dashboard"]
  },
  {
    id: 3,
    name: "E-Commerce-Engine",
    description: "Full-stack headless e-commerce backend built with Node.js, Express, and high-performance MongoDB clusters.",
    html_url: "https://github.com/mrhamza794",
    stargazers_count: 8,
    language: "Node.js",
    topics: ["ecommerce", "backend", "api"]
  }
];

const Projects = () => {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  
  // Track scroll strictly through the 200vh tall container to map to tracking horizontal
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate maximum left translation. Assume roughly 400px width per card + gaps
  // Mapped x translates the wide inner flex track leftwards
  const xTransform = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]); 

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`);
        if (response.ok) {
          const data = await response.json();
          const validData = data.filter(repo => !repo.fork && repo.description);
          if (validData.length > 0) setProjects(validData);
        }
      } catch (error) {
        console.error("Failed to fetch Github projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <section id="projects" ref={containerRef} className="relative h-[200vh] bg-slate-950">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center items-center">
        
        {/* Absolute Parallax Orbs */}
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, 300]) }}
          className="absolute top-10 left-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -300]) }}
          className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="w-full max-w-[1400px] mx-auto px-6 z-10 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-space text-gradient mb-4">
            Selected Works
          </h2>
          <div className="w-24 h-1 bg-linear-to-r from-purple-500 to-cyan-500 rounded-full mb-4" />
          <p className="text-slate-400 text-lg max-w-2xl">
            A showcase of my recent repositories and production systems via the GitHub API. Keep scrolling to navigate horizontally.
          </p>
        </div>

        {/* Scroll-mapped Horizontal Track */}
        <div className="w-full relative z-10 flex">
          <motion.div 
             className="flex gap-8 px-6 md:px-20 min-w-max"
             style={{ x: xTransform }}
          >
            {projects.map((repo, idx) => {
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
      className="w-[300px] md:w-[450px] shrink-0 glass-card bg-white/5! p-8 rounded-3xl border-white/10! shadow-2xl perspective"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
          <Github size={32} />
        </div>
        <div className="flex gap-3">
          {repo.homepage && (
            <a href={repo.homepage} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors">
              <ExternalLink size={20} />
            </a>
          )}
          <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-purple-400 transition-colors">
            <ArrowRight size={20} />
          </a>
        </div>
      </div>

      <h3 className="text-2xl font-bold font-space text-white mb-3 truncate" title={repo.name}>
        {repo.name}
      </h3>
      
      <p className="text-slate-400 text-sm leading-relaxed mb-6 h-[60px] overflow-hidden line-clamp-3">
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
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400">
            {repo.language || "Code"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-6 pt-6 border-t border-white/10 mt-auto">
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <Star size={16} className="text-amber-400" />
          <span>{repo.stargazers_count || 0}</span>
        </div>
        {(repo.forks_count > 0) && (
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <GitFork size={16} className="text-emerald-400" />
            <span>{repo.forks_count}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Projects;
