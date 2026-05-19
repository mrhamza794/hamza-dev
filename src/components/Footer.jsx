import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { PERSONAL_INFO } from "@/lib/constants";
import Logo from "./Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <footer className="relative w-full glass-card bg-black/60! light:bg-white/80! backdrop-blur-xl border-t border-white/10 light:border-slate-300/60! rounded-none! overflow-x-hidden overflow-y-hidden">
      {/* Background Decor */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 py-16 max-w-[1400px] relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Branding */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Logo size={48} mobileSize={40} showName={false} clickable />
              <h3 className="text-2xl font-space font-bold text-gradient">HC</h3>
            </div>
            <p className="text-slate-400 font-medium max-w-xs">
              Crafting digital experiences with modern web technologies and robust REST APIs.
            </p>
            <div className="mt-4">
               <span className="inline-flex glass-card px-4 py-1.5 rounded-full text-xs font-medium text-purple-300 border-purple-500/20!">
                 Made with Next.js
               </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white light:text-slate-900! font-space font-bold text-xl mb-2">Navigate</h3>
            <ul className="space-y-3">
              {['About', 'Skills', 'Projects', 'Contact'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase()}`}
                    onClick={(e) => handleNavClick(e, item.toLowerCase())}
                    className="text-slate-500 hover:text-white light:hover:text-slate-900! transition-colors flex items-center gap-2 group w-fit"
                  >
                    <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-400" />
                    <span className="group-hover:text-gradient transition-all">{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Connect */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white light:text-slate-900! font-space font-bold text-xl mb-2">Connect</h3>
            <div className="flex gap-4 mb-4">
               <a 
                  href={PERSONAL_INFO.linkedin} 
                  target="_blank" 
                  className="p-3 glass-card rounded-xl hover:bg-white/10 hover:scale-110 transition-all group"
                  aria-label="LinkedIn"
               >
                 <FaLinkedinIn size={18} className="group-hover:text-cyan-400 transition-colors" />
               </a>
               <a 
                  href={PERSONAL_INFO.github} 
                  target="_blank" 
                  className="p-3 glass-card rounded-xl hover:bg-white/10 hover:scale-110 transition-all group"
                  aria-label="GitHub"
               >
                 <FaGithub size={18} className="group-hover:text-purple-400 transition-colors" />
               </a>
            </div>
            
            <a 
               href="mailto:hamzach794@gmail.com"
               className="w-fit glass-card px-6 py-3 rounded-xl bg-linear-to-r from-purple-600/20 to-blue-600/20 border-white/10! hover:border-purple-500/50! font-bold text-white light:text-slate-900! text-sm hover:scale-105 transition-all text-center"
            >
               Let's work together
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} Hamza Choudhary. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            Built with <Heart size={14} className="text-pink-500 fill-pink-500" /> and Next.js
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
