"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { SKILLS } from "@/lib/constants";
import SkillSphere from "./SkillSphere";
import { Code, Server, Database, Layers, Palette, Terminal, Box } from "lucide-react";

const categoryIcons = {
  frontend: <Code size={20} />,
  backend: <Server size={20} />,
  database: <Database size={20} />,
  state: <Layers size={20} />,
  styling: <Palette size={20} />,
  "3d": <Box size={20} />,
  design: <Terminal size={20} />,
};

const Skills = () => {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [filter, setFilter] = useState("all");

  const categories = ["all", ...new Set(SKILLS.map((s) => s.category))];

  const filteredSkills = filter === "all" 
    ? SKILLS 
    : SKILLS.filter(s => s.category === filter);

  return (
    <section id="skills" className="relative py-32 min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05),transparent_70%)]" />
      
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold font-space text-gradient mb-6"
          >
            Technical Arsenal
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            A comprehensive look at the technologies I use to build scalable, high-performance applications and immersive digital experiences.
          </motion.p>
        </div>

        {/* Categories Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-3 rounded-full font-space font-medium transition-all duration-300 flex items-center gap-2 ${
                filter === cat
                  ? "bg-purple-600! text-white! scale-110 shadow-lg"
                  : "glass-card text-slate-400 hover:bg-white/10"
              }`}
            >
              {categoryIcons[cat]}
              <span className="capitalize">{cat}</span>
            </button>
          ))}
        </div>

        {/* Main 3D Canvas (Desktop Only) */}
        <div className="hidden lg:block relative h-[700px] w-full">
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 15], fov: 75 }}>
            <SkillSphere onSelectSkill={setSelectedSkill} selectedSkill={selectedSkill} />
          </Canvas>

          {/* Detailed Skill Panel (Desktop Only) */}
          <AnimatePresence>
            {selectedSkill && (
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className="absolute right-10 top-1/2 -translate-y-1/2 w-80 glass-card bg-black/60! backdrop-blur-2xl! p-8 rounded-3xl border-purple-500/30! shadow-2xl"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-purple-600/20 text-purple-400">
                    {categoryIcons[selectedSkill.category]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white font-space">
                      {selectedSkill.name}
                    </h3>
                    <p className="text-purple-400 text-sm font-medium capitalize">
                      {selectedSkill.category}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Proficiency</span>
                      <span className="text-cyan-400">{selectedSkill.level}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedSkill.level}%` }}
                        className="h-full bg-linear-to-r from-purple-500 to-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                    <p className="text-white font-medium">Over 2 years of active development</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSkill(null)}
                  className="mt-8 w-full py-3 rounded-xl bg-purple-600/20 border border-purple-600/40 text-purple-400 hover:bg-purple-600 hover:text-white transition-all font-bold"
                >
                  Close Detail
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Fallback Grid */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredSkills.map((skill, idx) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="glass-card p-6 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/5 text-purple-400">
                  {categoryIcons[skill.category]}
                </div>
                <div>
                  <h4 className="font-bold text-white font-space">{skill.name}</h4>
                  <p className="text-xs text-slate-500 capitalize">{skill.category}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-cyan-400 mb-1">{skill.level}%</div>
                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-purple-500 to-cyan-500"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
