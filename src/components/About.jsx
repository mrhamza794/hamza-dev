import { motion, useScroll, useTransform } from "framer-motion";
import { Code, Palette, Server, MapPin, Briefcase, Calendar, GraduationCap } from "lucide-react";
import { PERSONAL_INFO, EDUCATION, EXPERTISE } from "@/lib/constants";
import { useGSAP } from "@/hooks/useGSAP";
import Logo from "./Logo";

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
    className="about-stat-chip glass-card glass-card--static flex w-full min-w-0 max-w-full items-center gap-3 p-3 px-4 rounded-xl shadow-lg"
  >
    <Icon size={16} className="shrink-0 text-cyan-400" />
    <span className="min-w-0 text-sm text-slate-300 light:text-slate-700! font-medium">{text}</span>
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
      className={`about-content-block glass-card glass-card--lg border-l-4 ${colorMap[color]} group transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 rounded-[20px]`}
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
  const scopeRef = useGSAP(({ gsap, scope, isMobile, reduceMotion }) => {
    if (reduceMotion || isMobile) return;

    const blocks = scope.querySelectorAll(".about-content-block");
    gsap.set(blocks, { opacity: 0, y: 60 });
    blocks.forEach((block) => {
      gsap.fromTo(
        block,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: block,
            start: "top 85%",
            end: "top 50%",
            scrub: 0.8,
          },
        }
      );
    });
  }, []);

  const { scrollYProgress } = useScroll({ target: scopeRef, offset: ["start end", "end start"] });
  const yFast = useTransform(scrollYProgress, [0, 1], [0, 500]);
  const ySlow = useTransform(scrollYProgress, [0, 1], [0, -300]);

  return (
    <section id="about" ref={scopeRef} className="relative overflow-x-clip py-32">
      {/* Background Orbs with Parallax mapped to scroll relative progress */}
      <motion.div 
        style={{ y: yFast }}
        className="pointer-events-none absolute top-1/4 left-0 -z-10 h-96 w-72 max-w-[50vw] rounded-full bg-purple-600/20 blur-[120px] sm:w-96" 
      />
      <motion.div 
        style={{ y: ySlow }}
        className="pointer-events-none absolute right-0 bottom-1/4 -z-10 h-96 w-72 max-w-[50vw] rounded-full bg-blue-600/10 blur-[150px] sm:w-[500px]" 
      />

      <div className="home-container">
        
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

        <div className="grid grid-cols-1 items-start gap-20 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Left: Profile Visual — CSS sticky on desktop (no GSAP pin = no fixed-width overflow) */}
          <div className="about-sticky-visual relative min-w-0 w-full lg:sticky lg:top-28 lg:self-start">
            <div className="about-profile-frame relative aspect-square w-full min-h-[280px] rounded-[2.5rem]">
              <div className="logo-backdrop-panel about-logo-panel absolute inset-0 overflow-visible rounded-[2.5rem] bg-transparent">
                <Logo variant="backdrop" clickable={false} />
              </div>
              <div className="logo-text-scrim pointer-events-none absolute inset-x-0 bottom-0 z-1 rounded-b-[2.5rem]" aria-hidden />

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
                className="absolute inset-x-0 bottom-0 z-10 flex w-full min-w-0 flex-col gap-3 p-6 sm:p-8"
              >
                <div className="mb-2">
                  <p className="font-space text-xl font-bold text-white light:text-slate-900">{PERSONAL_INFO.name}</p>
                  <p className="text-sm text-cyan-400">{PERSONAL_INFO.role}</p>
                </div>
                <StatCard icon={MapPin} text={PERSONAL_INFO.location} delay={0.4} />
                <StatCard icon={Briefcase} text={PERSONAL_INFO.title} delay={0.5} />
                <StatCard icon={Calendar} text="Since August 2023" delay={0.6} />
              </motion.div>
            </div>
          </div>

          {/* Right: Content Area */}
          <div className="flex min-w-0 flex-col gap-12">
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
              className="relative glass-card glass-card--lg bg-linear-to-r from-purple-900/15 to-cyan-900/15 light:from-white/60 light:to-slate-100/50 p-8 rounded-2xl border-b-2 border-cyan-500/30 group overflow-hidden"
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
