import { useRef, useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import { useInView } from "framer-motion";

const Hero3D = dynamic(() => import("@/components/Hero3D"), {
  ssr: false,
  loading: () => <div className="hero-viewport w-full bg-linear-to-br from-slate-900 to-slate-950" />,
});
const About = dynamic(() => import("@/components/About"));
const Skills = dynamic(() => import("@/components/Skills"));
const Quote = dynamic(() => import("@/components/Quote"));
const Projects = dynamic(() => import("@/components/Projects"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center text-slate-500">Loading Projects...</div>
  ),
});
const Contact = dynamic(() => import("@/components/Contact"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center text-slate-500">Loading Contact...</div>
  ),
});

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const projectsRef = useRef(null);
  const contactRef = useRef(null);

  const projectsInView = useInView(projectsRef, { once: true, margin: "400px 0px" });
  const contactInView = useInView(contactRef, { once: true, margin: "400px 0px" });

  return (
    <div className="relative min-h-screen">
      <Navigation />

      <main>
        <div id="hero" className="hero-viewport">
          <Hero3D />
        </div>

        <About />

        <Skills />

        <Quote />

        <div ref={projectsRef} className="min-h-screen">
          {projectsInView && <Projects isMobile={isMobile} />}
        </div>

        <div ref={contactRef} className="min-h-screen">
          {contactInView && <Contact isMobile={isMobile} />}
        </div>
      </main>

      <Footer />

      <div
        className="fixed inset-0 pointer-events-none z-0 block dark:hidden bg-linear-to-b from-transparent via-slate-200/10 to-slate-100/25"
        aria-hidden
      />
      <div
        className="fixed inset-0 pointer-events-none z-0 hidden dark:block bg-linear-to-b from-transparent via-slate-950/25 to-slate-950/85"
        aria-hidden
      />
    </div>
  );
}
