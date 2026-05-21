import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import { Send, Mail, User, MessageSquare, MapPin, Phone, AlertCircle } from "lucide-react";
import { PERSONAL_INFO } from "@/lib/constants";
import { useTheme } from "next-themes";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";

const ContactCard = ({ icon: Icon, label, value, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 light:bg-white/70 border border-white/10 light:border-slate-300/60 hover:border-cyan-500/50 transition-colors"
  >
    <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-white light:text-slate-800! font-medium">{value}</p>
    </div>
  </motion.div>
);

const Contact = () => {
  const { theme } = useTheme();
  const { trackContactClick } = useVisitorTracking();
  const [formState, setFormState] = useState("idle"); // idle | typing | submitting | success | error
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errorMsg, setErrorMsg] = useState("");

  const sectionRef = useRef(null);
  
  // Use scroll to shift background gradient
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end end"] });
  const hue1 = useTransform(scrollYProgress, [0, 1], [250, 200]);
  const hue2 = useTransform(scrollYProgress, [0, 1], [280, 240]);
  const darkBgImage = useMotionTemplate`linear-gradient(135deg, hsl(${hue1}, 70%, 15%), hsl(${hue2}, 60%, 10%))`;
  const lightBgImage = "linear-gradient(135deg, rgba(248,250,252,1) 0%, rgba(226,232,240,1) 100%)";
  
  // Custom hinge variant for staggering children
  const formHingeVariant = {
    hidden: { opacity: 0, rotateX: 90, y: 100, transformPerspective: 1000 },
    show: { opacity: 1, rotateX: 0, y: 0, transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] } }
  };

  const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formState === "error" || formState === "idle" || formState === "success") setFormState("typing");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    setFormData({ name, email, message });

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name) {
      setFormState("error");
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!emailOk) {
      setFormState("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (message.length < 10) {
      setFormState("error");
      setErrorMsg("Please add more detail to your message (at least 10 characters).");
      return;
    }

    setFormState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong.");
      }
      setFormData({ name: "", email: "", message: "" });
      setFormState("success");
      trackContactClick();
    } catch (err) {
      setFormState("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to send. Try again later.");
    }
  };

  return (
    <motion.section 
      id="contact" 
      ref={sectionRef} 
      style={{ backgroundImage: theme === "light" ? lightBgImage : darkBgImage }}
      className="relative py-32 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 z-10 relative">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* Left Side Visual Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col gap-10"
          >
            <div>
              <h2 className="text-4xl md:text-6xl font-bold font-space text-white light:text-slate-900! mb-6">
                Let's innovate <br/> <span className="text-cyan-400">together.</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl font-inter leading-relaxed max-w-lg">
                Whether diagnosing complex system architectures or crafting immersive UI experiences, I'm ready for the next challenge. Reach out.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <ContactCard icon={MapPin} label="Location" value={PERSONAL_INFO.location} />
              <ContactCard icon={Mail} label="Direct Email" value={PERSONAL_INFO.email} delay={0.1} />
              <ContactCard icon={Phone} label="Phone" value={PERSONAL_INFO.phone} delay={0.2} />
            </div>
          </motion.div>

          {/* Right Side: Scroll-linked Form Flip */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="glass-card p-8 md:p-12 rounded-[32px] border border-white/10 light:border-slate-300/60 shadow-2xl relative bg-black/20 light:bg-white/75 backdrop-blur-xl"
          >
            <motion.h3 variants={formHingeVariant} className="text-2xl font-bold font-space text-white light:text-slate-900! mb-8">
              Send a Message
            </motion.h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative" noValidate>
              <motion.div variants={formHingeVariant} className="relative group">
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  onInput={handleInputChange}
                  placeholder="Your Name"
                  className="w-full bg-white/5 light:bg-white/80 border border-white/10 light:border-slate-300/60 rounded-xl px-5 py-4 pl-12 text-slate-200 light:text-slate-800! placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500/50 transition-colors"
                />
                <User size={20} className="absolute left-4 top-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </motion.div>

              <motion.div variants={formHingeVariant} className="relative group">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  onInput={handleInputChange}
                  placeholder="Email Address"
                  className="w-full bg-white/5 light:bg-white/80 border border-white/10 light:border-slate-300/60 rounded-xl px-5 py-4 pl-12 text-slate-200 light:text-slate-800! placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500/50 transition-colors"
                />
                <Mail size={20} className="absolute left-4 top-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </motion.div>

              <motion.div variants={formHingeVariant} className="relative group">
                <textarea
                  name="message"
                  autoComplete="off"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  onInput={handleInputChange}
                  placeholder="Project details..."
                  className="w-full bg-white/5 light:bg-white/80 border border-white/10 light:border-slate-300/60 rounded-xl px-5 py-4 pl-12 text-slate-200 light:text-slate-800! placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500/50 transition-colors resize-none"
                />
                <MessageSquare size={20} className="absolute left-4 top-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </motion.div>

              {formState === "error" && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-pink-400 text-sm">
                  <AlertCircle size={16} /> <span>{errorMsg}</span>
                </motion.div>
              )}

              <motion.button
                variants={formHingeVariant}
                type="submit"
                disabled={formState === "submitting" || formState === "success"}
                className={`contact-form-submit w-full py-4 rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 transition-all ${
                   formState === "success" 
                   ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 cursor-default" 
                   : "bg-linear-to-r from-purple-600 to-cyan-600 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-[1.02] cursor-pointer"
                }`}
              >
                {formState === "submitting" ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : formState === "success" ? (
                  "Transmission Sent"
                ) : (
                  <>Ignite Sequence <Send size={18} /></>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default Contact;
