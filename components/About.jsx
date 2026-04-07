"use client";

import { motion } from "framer-motion";
import { Code, Palette, Box, MapPin, Briefcase, Calendar, GraduationCap } from "lucide-react";
import { PERSONAL_INFO, EDUCATION, EXPERTISE } from "@/lib/constants";

const StatCard = ({ icon: Icon, text, delay }) => (
  <motion.div
    initial={{ x: -20, opacity: 0 }}
    whileInView={{ x: 0, opacity: 1 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="flex items-center gap-3 glass-card bg-white/5! p-3 px-4 rounded-xl border-white/10! shadow-lg"
  >
    <Icon size={16} className="text-cyan-400" />
    <span className="text-sm text-slate-300 font-medium">{text}</span>
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
      className={`glass-card bg-white/5! backdrop-blur-xl! p-8 rounded-[20px] border-l-4 ${colorMap[color]} group transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]`}
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform">
        <Icon size={28} className={`text-${color}-500`} />
      </div>
      <h3 className="text-xl font-bold font-space mb-3 text-white">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

const About = () => {
  return (
    <section id="about" className="relative py-32 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] -z-10 animate-pulse-slow" />

      <div className="container mx-auto px-6 max-w-[1400px]">
        {/* Section Header */}
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-space text-gradient mb-4"
          >
            About Me
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-cyan-400 font-medium mb-6 uppercase tracking-widest text-sm"
          >
            BSCS Graduate | Development Team Lead
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="w-[100px] h-1 bg-linear-to-r from-purple-500 to-cyan-500 origin-left rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-20 items-center">
          {/* Left: Profile Visual */}
          <div className="relative group">
            {/* Rotating Gradient Border */}
            <div className="absolute -inset-1 bg-linear-to-r from-purple-500 via-cyan-500 to-pink-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 animate-spin-slow transition duration-1000" />
            
            <div className="relative aspect-square glass-card bg-black/40! backdrop-blur-3xl! border-white/10! rounded-[2.5rem] flex items-center justify-center overflow-hidden">
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
            <div className="space-y-6">
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-lg md:text-xl text-slate-300 leading-relaxed font-inter"
              >
                {PERSONAL_INFO.bio.split(". ")[0]}.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="text-lg md:text-xl text-slate-300 leading-relaxed font-inter"
              >
                With over {PERSONAL_INFO.experience} in the industry, I have honed my skills in building robust architectures and delightful user experiences. Currently leading a talented team of developers at Code Flamme.
              </motion.p>
            </div>

            {/* Expertise Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {EXPERTISE.map((item, idx) => {
                const icons = { Code, Palette, Box };
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

            {/* Education Banner */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="relative glass-card bg-linear-to-r from-purple-900/20 to-cyan-900/20 p-8 rounded-2xl border-b-2 border-cyan-500/30 group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <GraduationCap size={80} className="animate-float" />
              </div>
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-xl bg-white/5 text-cyan-400">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold font-space text-white">{EDUCATION[0].degree}</h4>
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
