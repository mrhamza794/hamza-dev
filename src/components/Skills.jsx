import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  SiExpress,
  SiGithub,
  SiJavascript,
  SiJsonwebtokens,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenapiinitiative,
  SiReact,
  SiRedux,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

/** Brand icons + approximate brand colors (readable on skill card backgrounds) */
const SKILLS = [
  { name: "React", level: 95, Icon: SiReact, iconClass: "text-[#61DAFB]" },
  { name: "Next.js", level: 93, Icon: SiNextdotjs, iconClass: "text-slate-900 dark:text-white" },
  { name: "JavaScript (ES6+)", level: 92, Icon: SiJavascript, iconClass: "text-[#F7DF1E]" },
  { name: "TypeScript", level: 88, Icon: SiTypescript, iconClass: "text-[#3178C6]" },
  { name: "Redux Toolkit", level: 90, Icon: SiRedux, iconClass: "text-[#764ABC]" },
  { name: "Tailwind CSS", level: 94, Icon: SiTailwindcss, iconClass: "text-[#06B6D4]" },
  { name: "Node.js", level: 86, Icon: SiNodedotjs, iconClass: "text-[#339933]" },
  { name: "Express.js", level: 85, Icon: SiExpress, iconClass: "text-slate-700 dark:text-slate-200" },
  { name: "MongoDB", level: 84, Icon: SiMongodb, iconClass: "text-[#47A248]" },
  { name: "REST APIs", level: 90, Icon: SiOpenapiinitiative, iconClass: "text-[#6BA539]" },
  { name: "JWT Auth", level: 87, Icon: SiJsonwebtokens, iconClass: "text-pink-600 dark:text-pink-400" },
  { name: "Git & GitHub", level: 91, Icon: SiGithub, iconClass: "text-slate-900 dark:text-white" },
];

const SkillCard = ({ skill }) => {
  const cardRef = useRef(null);
  
  // Track this card's specific scroll progress inside the viewport window
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["0 1", "1.2 1"] // From entering bottom of screen to fully constructed
  });

  // width natively mapped to scroll progress to trigger "fill" as scrolled down
  const rawWidth = useTransform(scrollYProgress, [0, 1], [0, skill.level]);
  
  // Custom hinge entrance style variant
  const hingeVariant = {
    hidden: { opacity: 0, scale: 0.8, rotateX: 45, y: 100, transformPerspective: 1000 },
    show: { opacity: 1, scale: 1, rotateX: 0, y: 0, transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] } }
  };

  return (
    <motion.div
      ref={cardRef}
      variants={hingeVariant}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="group perspective relative"
    >
      <div className="glass-card p-6 h-full transition-transform duration-500 transform-style-3d group-hover:rotate-x-6 group-hover:-rotate-y-6">
        <div className="flex items-center gap-4 mb-4 transform-translate-z-10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-purple-500/20 to-cyan-500/20 ring-1 ring-white/10 dark:ring-white/5 [&_svg]:h-[22px] [&_svg]:w-[22px]">
            <skill.Icon className={skill.iconClass} aria-hidden />
          </div>
          <h3 className="text-lg font-bold font-space text-slate-800 dark:text-slate-200">{skill.name}</h3>
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full bg-slate-200/90 dark:bg-white/5 rounded-full h-2 overflow-hidden transform-translate-z-20">
          <motion.div 
            className="h-full bg-linear-to-r from-purple-500 to-cyan-500 rounded-full w-full origin-left"
            style={{ scaleX: useTransform(rawWidth, width => width / 100) }}
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
          <p className="mt-6 text-slate-600 dark:text-slate-400 max-w-2xl text-lg">
            A comprehensive breakdown of my core competencies, focusing on the modern web stack and performance architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SKILLS.map((skill, idx) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
