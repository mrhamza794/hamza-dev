"use client"

import { useRef, useState, useEffect } from "react"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import dynamic from "next/dynamic"
import { useInView } from "framer-motion"

const Hero3D = dynamic(() => import("@/components/Hero3D"), { 
  ssr: false,
  loading: () => <div className="w-full h-screen bg-linear-to-br from-slate-900 to-slate-950" />
})
const About = dynamic(() => import("@/components/About"))
const Skills = dynamic(() => import("@/components/Skills"))
const Projects = dynamic(() => import("@/components/Projects"), { 
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center text-slate-500">Loading Projects...</div>
})
const Contact = dynamic(() => import("@/components/Contact"), { 
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center text-slate-500">Loading Contact...</div>
})

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  const projectsRef = useRef(null)
  const contactRef = useRef(null)

  const projectsInView = useInView(projectsRef, { once: true, margin: "400px 0px" })
  const contactInView = useInView(contactRef, { once: true, margin: "400px 0px" })

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

        {/* Section 4: Projects (Lazy Mounted via Viewport) */}
        <div ref={projectsRef} className="min-h-screen">
          {projectsInView && <Projects isMobile={isMobile} />}
        </div>

        {/* Section 5: Contact (Lazy Mounted via Viewport) */}
        <div ref={contactRef} className="min-h-screen">
          {contactInView && <Contact isMobile={isMobile} />}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Background overlay */}
      <div className="fixed inset-0 pointer-events-none bg-linear-to-b from-transparent via-background-outer/20 to-background-outer/80 z-0" />
    </div>
  )
}
