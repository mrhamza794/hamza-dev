import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { PERSONAL_INFO } from "@/lib/constants";
import { useTheme } from "next-themes";
import Logo from "./Logo";

const NAV_LINKS = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
];

const Navigation = () => {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Hero");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = NAV_LINKS.map(link => link.name.toLowerCase());
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section.charAt(0).toUpperCase() + section.slice(1));
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setIsMobileMenuOpen(false);
    }
  };

  const navHeight = isScrolled ? 60 : 80;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pt-5">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mx-auto flex w-[90%] max-w-[1400px] items-end gap-2 sm:gap-3"
      >
        <Logo
          variant="brand"
          fillHeight
          showName={false}
          clickable
          className={`logo-nav-brand logo-nav-outside shrink-0 transition-all duration-300 ${
            isScrolled ? "h-[60px]" : "h-[80px]"
          }`}
        />

        <motion.div
          style={{
            height: navHeight,
            backdropFilter: "blur(20px) saturate(180%)",
          }}
          className="nav-glass-bar flex min-w-0 flex-1 items-center justify-between px-6 transition-all duration-300 glass-card rounded-2xl! sm:px-10 lg:rounded-b-3xl! lg:rounded-t-none!"
        >
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <div key={link.name} className="relative group">
              <a
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                className={`font-space font-medium transition-all duration-300 ${
                  activeSection === link.name
                    ? "text-slate-900 dark:text-white opacity-100 font-semibold"
                    : "text-slate-600 dark:text-slate-300 opacity-80 hover:opacity-100 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {link.name}
              </a>
              {activeSection === link.name && (
                <motion.div
                  layoutId="activeUnderline"
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-linear-to-r from-purple-500 to-cyan-500 rounded-full"
                />
              )}
            </div>
          ))}
          
          <div className="h-6 w-px bg-slate-300/70 dark:bg-white/10 mx-2" aria-hidden />
          
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full glass-card hover:scale-110 transition-all duration-300"
            >
              {mounted && theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <a
              href={PERSONAL_INFO.linkedin}
              target="_blank"
              className="p-2 rounded-full glass-card hover:rotate-360 hover:scale-110 transition-all duration-500 group"
            >
              <FaLinkedinIn size={16} className="group-hover:text-cyan-accent" />
            </a>
            <a
              href={PERSONAL_INFO.github}
              target="_blank"
              className="p-2 rounded-full glass-card hover:rotate-360 hover:scale-110 transition-all duration-500 group"
            >
              <FaGithub size={16} className="group-hover:text-purple-accent" />
            </a>
          </div>
        </div>

        {/* Mobile Hammer */}
        <button 
          className="md:hidden p-2 text-slate-900 dark:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        </motion.div>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-slate-50/95 dark:bg-background-outer/95 backdrop-blur-3xl flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.name}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                className={`text-4xl font-space font-bold ${
                  activeSection === link.name
                    ? "text-slate-900 dark:text-white underline decoration-cyan-500 decoration-2 underline-offset-10"
                    : "text-gradient"
                }`}
              >
                {link.name}
              </motion.a>
            ))}
            
            <div className="flex gap-8 mt-12">
               <button
                 type="button"
                 aria-label="Toggle theme"
                 onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                 className="p-4 glass-card rounded-full"
               >
                 {mounted && theme === "light" ? <Moon size={32} /> : <Sun size={32} />}
               </button>
               <a href={PERSONAL_INFO.linkedin} target="_blank" className="p-4 glass-card rounded-full">
                <FaLinkedinIn size={24} />
               </a>
               <a href={PERSONAL_INFO.github} target="_blank" className="p-4 glass-card rounded-full">
                <FaGithub size={24} />
               </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
