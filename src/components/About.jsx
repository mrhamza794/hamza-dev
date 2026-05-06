"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Code, Palette, Server, MapPin, Briefcase, Calendar, GraduationCap } from "lucide-react";
import { PERSONAL_INFO, EDUCATION, EXPERTISE } from "@/lib/constants";

const hingeVariant = {
  hidden: { opacity: 0, scale: 0.8, rotateX: 45, y: 100, transformPerspective: 1000 },
  show: (delay = 0) => ({
    opacity: 1, 
    scale: 1, 
    rotateX: 0, 
    y: 0, 
    transition: { 
      delay, 
      duration: 0.8, 
      ease: [0.34, 1.56, 0.64, 1] 
    }
  })
};

const StatCard = ({ icon: Icon, text, delay }) => (
  <motion.div
    variants={hingeVariant}
    initial="hidden"
    whileInView="show"
    custom={delay}
    viewport={{ once: true, amount: 0.2 }}
    className="flex items-center gap-3 glass-card bg-white/5! light:bg-white/75! p-3 px-4 rounded-xl border-white/10! light:border-slate-300/60! shadow-lg"
  >
    <Icon size={16} className="text-cyan-400" />
    <span className="text-sm text-slate-300 light:text-slate-700! font-medium">{text}</span>
  </motion.div>
);

const ExpertiseCard = ({ title, description, icon: Icon, color, delay }) => {
  const colorMap = {
    purple: "border-purple-500",
    blue: "border-blue-500",
    cyan: "border-cyan-500",
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -12, rotateX: 5, rotateY: 5, transition: { duration: 0.2 } }}
      viewport={{ once: true }}
      className={`glass-card bg-white/5! light:bg-white/75! backdrop-blur-xl! p-8 rounded-[20px] border-l-4 ${colorMap[color]} group transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]`}
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform">
        <Icon size={28} className={`text-${color}-500`} />
      </div>
      <h3 className="text-xl font-bold font-space mb-3 text-white light:text-slate-900!">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

const About = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const yFast = useTransform(scrollYProgress, [0, 1], [0, 500]);
  const ySlow = useTransform(scrollYProgress, [0, 1], [0, -300]);

  return (
    <section id="about" ref={containerRef} className="relative py-32 overflow-hidden">
      {/* Background Orbs with Parallax mapped to scroll relative progress */}
      <motion.div 
        style={{ y: yFast }}
        className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10" 
      />
      <motion.div 
        style={{ y: ySlow }}
        className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] -z-10" 
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <motion.div 
          variants={hingeVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-space text-gradient mb-4">
            About Me
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-cyan-400 font-medium mb-6 uppercase tracking-widest text-sm"
          >
            BSCS Graduate | Full Stack Developer
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="w-[100px] h-1 bg-linear-to-r from-purple-500 to-cyan-500 origin-left rounded-full"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-20 items-center">
          {/* Left: Profile Visual */}
          <div className="relative group">
            {/* Rotating Gradient Border */}
            <div className="absolute -inset-1 bg-linear-to-r from-purple-500 via-cyan-500 to-pink-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 animate-spin-slow transition duration-1000" />
            
            <div className="relative aspect-square glass-card bg-black/40! light:bg-white/75! backdrop-blur-3xl! border-white/10! light:border-slate-300/60! rounded-[2.5rem] flex items-center justify-center overflow-hidden">
              {/* Floating 3D Cubes (CSS) */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-10 left-10 w-8 h-8 border border-white/20 animate-float" style={{ transformStyle: 'preserve-3d', rotate: '45deg' }} />
                <div className="absolute bottom-20 right-10 w-12 h-12 border border-white/20 animate-float" style={{ animationDelay: '1s', rotate: '-20deg' }} />
                <div className="absolute top-1/2 right-1/4 w-6 h-6 border border-white/20 animate-float" style={{ animationDelay: '2s' }} />
              </div>

              {/* Initial "H" */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.2 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-[12rem] font-bold font-space text-gradient select-none"
              >
                H
              </motion.div>

              {/* Stats Overlay */}
              <div className="absolute bottom-8 left-8 right-8 flex flex-col gap-3">
                <StatCard icon={MapPin} text={PERSONAL_INFO.location} delay={0.4} />
                <StatCard icon={Briefcase} text={PERSONAL_INFO.role} delay={0.5} />
                <StatCard icon={Calendar} text="Since August 2023" delay={0.6} />
              </div>
            </div>
          </div>

          {/* Right: Content Area */}
          <div className="flex flex-col gap-12">
            <motion.div 
              variants={hingeVariant}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-6"
            >
              <p className="text-lg md:text-xl text-slate-300 light:text-slate-700! leading-relaxed font-inter">
                {PERSONAL_INFO.bio.split(". ")[0]}.{" "}
                <span className="text-cyan-400 font-medium">Passionately building modern digital experiences.</span>
              </p>
              <p className="text-slate-400 leading-relaxed">
                {PERSONAL_INFO.bio.split(". ").slice(1).join(". ")}
              </p>
            </motion.div>

            {/* Expertise Grid */}
            <motion.div 
              variants={hingeVariant}
              initial="hidden"
              whileInView="show"
              custom={0.2}
              viewport={{ once: true, amount: 0.2 }}
            >
              <h3 className="text-2xl font-bold font-space text-slate-200 light:text-slate-900! mb-6">Core Competencies</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {EXPERTISE.map((item, idx) => {
                const icons = { Code, Palette, Server };
                return (
                  <ExpertiseCard
                    key={item.title}
                    title={item.title}
                    description={item.description}
                    icon={icons[item.icon]}
                    color={item.color}
                    delay={0.2 + idx * 0.1}
                  />
                );
              })}
            </div>
            </motion.div>

            {/* Education Banner */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="relative glass-card bg-linear-to-r from-purple-900/20 to-cyan-900/20 light:from-white light:to-slate-100 p-8 rounded-2xl border-b-2 border-cyan-500/30 group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <GraduationCap size={80} className="animate-float" />
              </div>
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-xl bg-white/5 text-cyan-400">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold font-space text-white light:text-slate-900!">{EDUCATION[0].degree}</h4>
                  <p className="text-cyan-400 font-medium">{EDUCATION[0].institution}</p>
                  <p className="text-slate-400 text-sm mt-1">{EDUCATION[0].years}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
