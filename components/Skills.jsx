"use client";

import { motion } from "framer-motion";
import { Code2, Cpu, Laptop, Database, Globe, Layers } from "lucide-react";

// Assuming exact skills from constants if not exported exactly like this
const SKILLS = [
  { name: "React / Next.js", level: 95, icon: Globe },
  { name: "Three.js / WebGL", level: 85, icon: Layers },
  { name: "Tailwind CSS v4", level: 90, icon: Laptop },
  { name: "Node.js / Express", level: 80, icon: Database },
  { name: "MongoDB / SQL", level: 75, icon: Database },
  { name: "Framer Motion", level: 85, icon: Code2 },
  { name: "Performance Optimization", level: 90, icon: Cpu },
  { name: "UI/UX Design", level: 80, icon: Laptop }
];

const SkillCard = ({ skill, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group perspective"
    >
      <div className="glass-card p-6 h-full transition-transform duration-500 transform-style-3d group-hover:rotate-x-6 group-hover:-rotate-y-6">
        <div className="flex items-center gap-4 mb-4 transform-translate-z-10">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
            <skill.icon size={20} className="text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold font-space text-slate-200">{skill.name}</h3>
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden transform-translate-z-20">
          <div 
            className="h-full bg-linear-to-r from-purple-500 to-cyan-500 rounded-full"
            style={{ width: `${skill.level}%` }}
          />
        </div>
        
        <div className="mt-2 text-right transform-translate-z-20">
          <span className="text-sm text-slate-400 font-mono">{skill.level}%</span>
        </div>
      </div>
    </motion.div>
  );
};

const Skills = () => {
  return (
    <section id="skills" className="relative py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-space text-gradient mb-4">Technical Arsenal</h2>
          <div className="w-24 h-1 bg-linear-to-r from-purple-500 to-cyan-500 rounded-full" />
          <p className="mt-6 text-slate-400 max-w-2xl text-lg">
            A comprehensive breakdown of my core competencies, focusing on the modern web stack and performance architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SKILLS.map((skill, idx) => (
            <SkillCard key={skill.name} skill={skill} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
