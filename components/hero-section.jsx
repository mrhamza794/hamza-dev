"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown, Mail } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const scrollToProjects = () => {
    const element = document.querySelector("#projects")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          {/* Animated Avatar/Logo */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-primary-foreground animate-pulse">
              <span>{"</>"}</span>
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-20 animate-ping"></div>
          </div>

          {/* Main Headline with Animation */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-300% bg-size-300">
                Full-Stack & Mobile App Developer
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl md:text-2xl leading-relaxed">
              Building Portals, Platforms, CRMs, and E-Commerce Apps with modern tech.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" onClick={scrollToProjects} className="group relative overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                View My Work
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
              </span>
            </Button>

            <Button size="lg" variant="outline" asChild className="group bg-transparent">
              <Link href="/contact">
                <Mail className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                Contact Me
              </Link>
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
              <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
