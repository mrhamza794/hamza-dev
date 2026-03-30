"use client"

import Link from "next/link"
import { Github, Linkedin, Twitter, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

const socialLinks = [
  { name: "GitHub", href: "https://github.com", icon: Github },
  { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { name: "Twitter", href: "https://twitter.com", icon: Twitter },
  { name: "Email", href: "mailto:contact@example.com", icon: Mail },
]

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">DevPortfolio</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Full-Stack & Mobile App Developer specializing in modern web technologies and scalable solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              {["Home", "About", "Services", "Projects"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    const element = document.querySelector(`#${item.toLowerCase()}`)
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" })
                    }
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  {item}
                </button>
              ))}
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Services</h4>
            <nav className="flex flex-col space-y-2">
              {["Custom Portals", "Business Platforms", "CRM Solutions", "E-Commerce Apps", "UI/UX Design"].map(
                (service) => (
                  <span key={service} className="text-sm text-muted-foreground">
                    {service}
                  </span>
                ),
              )}
            </nav>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Connect</h4>
            <div className="flex space-x-2">
              {socialLinks.map((social) => (
                <Button key={social.name} variant="ghost" size="sm" asChild>
                  <Link href={social.href} aria-label={social.name}>
                    <social.icon className="h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for freelance projects and full-time opportunities.
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">© 2024 DevPortfolio. All rights reserved.</p>
          <p className="text-xs text-muted-foreground mt-2 sm:mt-0">Built with Next.js, Tailwind CSS, and ShadCN UI</p>
        </div>
      </div>
    </footer>
  )
}
