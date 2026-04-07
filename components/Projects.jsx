"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, ExternalLink, Star, GitFork, ChevronLeft, ChevronRight, Code } from "lucide-react";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("https://api.github.com/users/mrhamza794/repos?sort=updated&per_page=10");
        const data = await response.json();
        
        // Filter out forked repos and take top 6
        const filtered = data
          .filter(repo => !repo.fork)
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 6);
        
        setProjects(filtered);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleNext = () => {
    setRotation(prev => prev - 60);
    setCurrentIndex(prev => (prev + 1) % projects.length);
  };

  const handlePrev = () => {
    setRotation(prev => prev + 60);
    setCurrentIndex(prev => (prev - 1 + projects.length) % projects.length);
  };

  if (loading) {
     return (
        <section id="projects" className="py-32 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-space animate-pulse">Fetching latest works from GitHub...</p>
          </div>
        </section>
     );
  }

  return (
    <section id="projects" className="relative py-32 min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] -z-10" />
      
      <div className="container mx-auto px-6 mb-20 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold font-space text-gradient mb-6"
        >
          Featured Projects
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          viewport={{ once: true }}
          className="text-slate-400 text-lg max-w-2xl mx-auto"
        >
          A curated selection of my most significant open-source contributions and professional projects fetched directly from my GitHub.
        </motion.p>
      </div>

      {/* 3D Carousel (Desktop) */}
      <div className="hidden lg:block relative w-full h-[600px]" style={{ perspective: "1500px" }}>
        <motion.div
           ref={carouselRef}
           animate={{ rotateY: rotation }}
           transition={{ type: "spring", stiffness: 100, damping: 20 }}
           className="relative w-full h-full flex items-center justify-center"
           style={{ transformStyle: "preserve-3d" }}
        >
          {projects.map((project, idx) => {
            const angle = idx * (360 / projects.length);
            const radius = 600; // Carousel radius
            
            return (
              <motion.div
                key={project.id}
                className={`absolute w-[400px] h-[500px] glass-card bg-black/40! backdrop-blur-2xl! border-white/10! p-8 rounded-4xl flex flex-col justify-between transition-all duration-500 overflow-hidden ${
                    currentIndex === idx ? "shadow-[0_0_50px_rgba(139,92,246,0.3)] ring-2 ring-purple-500/50" : "opacity-40 brightness-50"
                }`}
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: "hidden"
                }}
              >
                  {/* Project Image Area (Mockup) */}
                  <div className="h-48 w-full bg-linear-to-br from-purple-900/40 to-cyan-900/40 rounded-2xl mb-6 flex items-center justify-center group overflow-hidden relative">
                    <Github size={60} className="text-white/10 group-hover:scale-125 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 flex gap-2">
                         <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-cyan-400 font-bold uppercase tracking-widest border border-white/5">
                            {project.language || "Web"}
                         </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold font-space text-white mb-3 flex items-center justify-between">
                       {project.name}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                       {project.description || "No description provided for this repository. Check GitHub for more details."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-8">
                     <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                            <Star size={16} className="text-yellow-500" />
                            {project.stargazers_count}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                            <GitFork size={16} className="text-cyan-400" />
                            {project.forks_count}
                        </div>
                     </div>
                     <div className="text-xs text-slate-500 font-medium">
                        Updated {new Date(project.updated_at).toLocaleDateString()}
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <a 
                        href={project.html_url} 
                        target="_blank" 
                        className="flex-1 py-3 bg-linear-to-r from-purple-600 to-cyan-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                     >
                        <Github size={18} /> Code
                     </a>
                     {project.homepage && (
                        <a 
                            href={project.homepage} 
                            target="_blank" 
                            className="p-3 glass-card rounded-xl hover:bg-white/10 transition-all"
                        >
                            <ExternalLink size={20} />
                        </a>
                     )}
                  </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Carousel Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 left-10 z-10">
          <button onClick={handlePrev} className="p-4 glass-card rounded-full hover:bg-purple-600/20 hover:scale-110 transition-all group">
            <ChevronLeft size={32} className="group-hover:text-purple-400" />
          </button>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-10 z-10">
          <button onClick={handleNext} className="p-4 glass-card rounded-full hover:bg-purple-600/20 hover:scale-110 transition-all group">
            <ChevronRight size={32} className="group-hover:text-purple-400" />
          </button>
        </div>
      </div>

      {/* Mobile Fallback: Horizontal Scroll */}
      <div className="lg:hidden w-full overflow-x-auto snap-x snap-mandatory flex gap-6 px-6">
          {projects.map((project) => (
             <div key={project.id} className="min-w-[300px] snap-center glass-card bg-black/40! p-6 rounded-3xl flex flex-col gap-6">
                <div className="h-40 w-full bg-linear-to-br from-purple-900/40 to-cyan-900/40 rounded-xl flex items-center justify-center">
                    <Github size={40} className="text-white/10" />
                </div>
                <div>
                   <h3 className="text-xl font-bold font-space text-white mb-2">{project.name}</h3>
                   <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">{project.description}</p>
                </div>
                <div className="flex gap-4">
                     <a href={project.html_url} target="_blank" className="flex-1 py-3 bg-linear-to-r from-purple-600 to-cyan-600 rounded-xl font-bold flex items-center justify-center gap-2 text-sm">
                        <Github size={16} /> Code
                     </a>
                </div>
             </div>
          ))}
      </div>

      <div className="mt-20">
         <a 
            href={`https://github.com/mrhamza794`} 
            target="_blank"
            className="px-10 py-4 glass-card border-purple-500/30! text-purple-400 font-bold hover:bg-purple-600 hover:text-white transition-all flex items-center gap-3 rounded-full"
         >
            View More on GitHub <Github size={20} />
         </a>
      </div>
    </section>
  );
};

export default Projects;
