"use client"

import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import dynamic from "next/dynamic"

const Hero3D = dynamic(() => import("@/components/Hero3D"), { ssr: false })
const About = dynamic(() => import("@/components/About"))
const Skills = dynamic(() => import("@/components/Skills"), { ssr: false })
const Projects = dynamic(() => import("@/components/Projects"), { ssr: false })
const Contact = dynamic(() => import("@/components/Contact"), { ssr: false })

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <Navigation />

      <main>
        {/* Section 1: Hero */}
        <div id="hero">
          <Hero3D />
        </div>

        {/* Section 2: About */}
        <About />

        {/* Section 3: Skills */}
        <Skills />

        {/* Section 4: Projects */}
        <Projects />

        {/* Section 5: Contact */}
        <Contact />

      </main>

      {/* Footer */}
      <Footer />

      {/* Global Background overlay */}
      <div className="fixed inset-0 pointer-events-none bg-linear-to-b from-transparent via-background-outer/20 to-background-outer/80 z-0" />
    </div>
  )
}
