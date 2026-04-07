"use client";

import { useState, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, MessageSquare, Send, CheckCircle, Copy, MapPin, Phone } from "lucide-react";
import { PERSONAL_INFO } from "@/lib/constants";
import * as THREE from "three";

// Simple Plane Geometry instead of complex mesh
const PaperPlane = () => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.2;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial color="#ffffff" wireframe />
      </mesh>
    </Float>
  );
};

const ContactCanvas = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <PaperPlane />
      </Canvas>
    </div>
  );
};

// Toast Notification
const Toast = ({ message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 50 }}
    className="fixed top-24 right-6 glass-card bg-black/60! border-green-500/50! p-4 pr-12 rounded-xl shadow-2xl z-50 flex items-center gap-3"
  >
    <CheckCircle className="text-green-500" size={24} />
    <span className="text-white font-medium">{message}</span>
    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
      ×
    </button>
  </motion.div>
);

const Contact = () => {
  const [formState, setFormState] = useState("idle"); // idle, typing, loading, success, error
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleBlur = (field) => {
    let newErrors = { ...errors };
    if (field === "name" && formData.name.length < 2) newErrors.name = "Name must be at least 2 characters";
    else delete newErrors.name;
    
    if (field === "email" && !validateEmail(formData.email)) newErrors.email = "Please enter a valid email";
    else delete newErrors.email;
    
    if (field === "message" && formData.message.length < 10) newErrors.message = "Message must be at least 10 characters";
    else delete newErrors.message;

    setErrors(newErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0 || !formData.name || !formData.email || !formData.message) {
      setFormState("error");
      return;
    }

    setFormState("loading");
    
    // Simulate network request
    setTimeout(() => {
      setFormState("success");
      setToast("Thanks for reaching out! I'll get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
      
      setTimeout(() => {
        setFormState("idle");
        setToast(null);
      }, 4000);
    }, 2000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a small local tooltip here
  };

  return (
    <section id="contact" className="relative py-32 overflow-hidden min-h-screen">
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Background Orbs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: 3D Graphic */}
          <div className="relative h-[400px] lg:h-[600px] rounded-[2.5rem] flex items-center justify-center">
             <div className="absolute inset-0 glass-card bg-white/5! rounded-[3rem] blur-xl opacity-50" />
             <div className="absolute inset-0 glass-card bg-transparent border-white/10! rounded-[3rem] overflow-hidden">
                <ContactCanvas />
             </div>
             
             {/* Floating Icons */}
             <div className="absolute top-1/4 left-10 p-4 rounded-full glass-card animate-float" style={{ animationDelay: '0s' }}>
                <MessageSquare className="text-purple-400" size={24} />
             </div>
             <div className="absolute bottom-1/4 right-10 p-4 rounded-full glass-card animate-float" style={{ animationDelay: '1.5s' }}>
                <Mail className="text-cyan-400" size={24} />
             </div>
          </div>

          {/* Right Side: Contact Form */}
          <motion.div
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="glass-card p-8 md:p-12 rounded-[24px] relative group border-white/10!"
          >

             <div className="mb-10">
                <h2 className="text-4xl font-bold font-space text-gradient mb-3">Let's Connect</h2>
                <p className="text-cyan-400 font-medium">Have a project in mind? Let's make it happen</p>
                <div className="w-[80px] h-[3px] bg-linear-to-r from-purple-500 to-cyan-500 rounded-full mt-4" />
             </div>

             <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {/* Name */}
                <div className="relative">
                   <div className={`flex items-center glass-card bg-white/5! p-4 rounded-xl border ${errors.name ? 'border-red-500' : 'border-white/10'}`}>
                      <User className="text-cyan-400 mr-3" size={20} />
                      <input 
                         type="text" 
                         placeholder="Your Name"
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         onFocus={() => setFormState("typing")}
                         onBlur={() => handleBlur("name")}
                         className="bg-transparent w-full outline-none text-white placeholder-slate-400"
                      />
                   </div>
                   {errors.name && <p className="text-red-400 text-xs mt-1 absolute">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="relative">
                   <div className={`flex items-center glass-card bg-white/5! p-4 rounded-xl border ${errors.email ? 'border-red-500' : 'border-white/10'}`}>
                      <Mail className="text-cyan-400 mr-3" size={20} />
                      <input 
                         type="email" 
                         placeholder="Your Email"
                         value={formData.email}
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                         onFocus={() => setFormState("typing")}
                         onBlur={() => handleBlur("email")}
                         className="bg-transparent w-full outline-none text-white placeholder-slate-400"
                      />
                      {!errors.email && formData.email && validateEmail(formData.email) && (
                         <CheckCircle className="text-green-400 ml-auto" size={18} />
                      )}
                   </div>
                   {errors.email && <p className="text-red-400 text-xs mt-1 absolute">{errors.email}</p>}
                </div>

                {/* Message */}
                <div className="relative">
                   <div className={`flex items-start glass-card bg-white/5! p-4 rounded-xl border ${errors.message ? 'border-red-500' : 'border-white/10'}`}>
                      <MessageSquare className="text-cyan-400 mr-3 mt-1" size={20} />
                      <textarea 
                         placeholder="Your Message..."
                         value={formData.message}
                         onChange={(e) => setFormData({...formData, message: e.target.value})}
                         onFocus={() => setFormState("typing")}
                         onBlur={() => handleBlur("message")}
                         className="bg-transparent w-full outline-none text-white placeholder-slate-400 resize-none min-h-[140px]"
                      />
                   </div>
                   <div className="flex justify-between items-center mt-1">
                      <p className="text-red-400 text-xs">{errors.message}</p>
                      <p className="text-slate-500 text-xs ml-auto">{formData.message.length} / 500</p>
                   </div>
                </div>

                <button 
                   disabled={formState === "loading" || formState === "success"}
                   type="submit"
                   className={`w-full h-[64px] rounded-xl font-space font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                      formState === "success" 
                         ? "bg-green-500 text-white" 
                         : formState === "loading"
                         ? "bg-purple-600/50 text-white/70"
                         : "bg-linear-to-r from-purple-600 to-blue-600 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] text-white group"
                   }`}
                >
                   {formState === "loading" && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                   {formState === "success" && <CheckCircle size={20} />}
                   {formState === "idle" || formState === "typing" || formState === "error" ? (
                      <>
                         Send Message
                         <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                   ) : formState === "loading" ? "Sending..." : "Message Sent!"}
                </button>
             </form>
          </motion.div>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
           <div onClick={() => copyToClipboard(PERSONAL_INFO.email)} className="glass-card bg-black/20! p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:-translate-y-1 transition-transform group">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                 <Mail size={24} />
              </div>
              <div>
                 <p className="text-slate-400 text-sm">Email</p>
                 <p className="font-medium text-white group-hover:text-purple-300 transition-colors">{PERSONAL_INFO.email}</p>
              </div>
           </div>

           <div onClick={() => copyToClipboard(PERSONAL_INFO.phone)} className="glass-card bg-black/20! p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:-translate-y-1 transition-transform group">
              <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform">
                 <Phone size={24} />
              </div>
              <div>
                 <p className="text-slate-400 text-sm">Phone</p>
                 <p className="font-medium text-white group-hover:text-cyan-300 transition-colors">{PERSONAL_INFO.phone}</p>
              </div>
           </div>

           <div className="glass-card bg-black/20! p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform group">
              <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400 group-hover:scale-110 transition-transform">
                 <MapPin size={24} />
              </div>
              <div>
                 <p className="text-slate-400 text-sm">Location</p>
                 <p className="font-medium text-white">{PERSONAL_INFO.location}</p>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
