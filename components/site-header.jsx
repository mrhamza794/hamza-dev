"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Menu, Github, Linkedin, Twitter, X } from "lucide-react"

const navigation = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
]

const socialLinks = [
  { name: "GitHub", href: "https://github.com/yourusername", icon: Github },
  { name: "LinkedIn", href: "https://linkedin.com/in/yourusername", icon: Linkedin },
  { name: "Twitter", href: "https://twitter.com/yourusername", icon: Twitter },
]

export function SiteHeader() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleScroll = () => {
      const sections = navigation.filter((item) => item.href.startsWith("#"))
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.querySelector(section.href)
        if (element) {
          const offsetTop = element.offsetTop
          const offsetHeight = element.offsetHeight

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.href.substring(1))
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (href) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
    setIsOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary tracking-normal italic text-left py-0 my-px px-0 mx-6 border-double border-0">                                                #hamza</span>
              
              
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className={`text-sm font-medium transition-colors ${
                  activeSection === item.href.substring(1) ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Social Links */}
            <div className="flex items-center space-x-2">
              {socialLinks.map((social) => (
                <Button key={social.name} variant="ghost" size="sm" asChild>
                  <Link href={social.href} aria-label={social.name} target="_blank" rel="noopener noreferrer">
                    <social.icon className="h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="md:hidden relative" onClick={() => setIsOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Mobile Menu Panel */}
          <div className="fixed inset-0 bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center">
                <span className="text-lg font-bold text-primary">Hamza</span>
                <span className="text-lg font-light text-muted-foreground">.</span>
                <span className="text-lg font-medium text-primary/80">dev</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 hover:bg-primary/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex flex-col h-full">
              {/* Navigation Links */}
              <nav className="flex-1 px-6 py-8">
                <div className="space-y-3">
                  {navigation.map((item, index) => (
                    <button
                      key={item.name}
                      onClick={() => scrollToSection(item.href)}
                      className={`group w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
                        activeSection === item.href.substring(1)
                          ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20 shadow-md"
                          : "text-muted-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 border border-transparent hover:border-primary/10"
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <span className="text-lg font-medium">{item.name}</span>
                      <div
                        className={`h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full ${
                          activeSection === item.href.substring(1) ? "w-full" : ""
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </nav>

              {/* Bottom Section */}
              <div className="p-6 border-t bg-gradient-to-r from-muted/20 to-muted/10">
                {/* Social Links */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Connect with me</p>
                  <div className="flex items-center justify-center space-x-4">
                    {socialLinks.map((social) => (
                      <Button
                        key={social.name}
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-12 w-12 rounded-full border-2 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-110 bg-transparent"
                      >
                        <Link href={social.href} aria-label={social.name} target="_blank" rel="noopener noreferrer">
                          <social.icon className="h-5 w-5" />
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Theme Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-full h-12 justify-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:from-primary/10 hover:to-primary/20 transition-all duration-300"
                >
                  <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="font-medium">Toggle theme</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
