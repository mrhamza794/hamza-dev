import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Star, Globe, Smartphone, Database, ShoppingCart, Users, BarChart3 } from "lucide-react"
import Link from "next/link"
import { projects } from "@/data/projects"

const getProjectIcon = (type) => {
  const iconMap = {
    portal: Database,
    crm: Users,
    website: Globe,
    ecommerce: ShoppingCart,
    mobile: Smartphone,
    analytics: BarChart3,
    default: Globe,
  }
  return iconMap[type] || iconMap.default
}

export function ProjectsSection() {
  const featuredProjects = projects.filter((project) => project.featured)
  const otherProjects = projects.filter((project) => !project.featured)

  return (
    <section id="projects" className="py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Featured Projects</h2>
            <p className="max-w-2xl text-lg text-muted-foreground">
              A showcase of my recent work and technical expertise
            </p>
          </div>

          {/* Featured Projects */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
            {featuredProjects.map((project) => {
              const IconComponent = getProjectIcon(project.type)
              return (
                <Card
                  key={project.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 hover:border-primary/20"
                >
                  <div className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 p-8 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-20 animate-pulse"></div>
                      <div className="relative w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-lg">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="space-y-3">
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 4}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      {project.liveUrl && (
                        <Button size="sm" asChild className="w-full">
                          <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Project
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Other Projects */}
          {otherProjects.length > 0 && (
            <div className="w-full max-w-6xl space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-2">Other Projects</h3>
                <p className="text-muted-foreground">Additional work and experiments</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {otherProjects.map((project) => {
                  const IconComponent = getProjectIcon(project.type)
                  return (
                    <Card
                      key={project.id}
                      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/20"
                    >
                      <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 p-6 flex items-center justify-center">
                        <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-md">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                      </div>

                      <CardHeader className="space-y-2 pb-3">
                        <h4 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {project.title}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {project.description}
                        </p>
                      </CardHeader>

                      <CardContent className="space-y-3 pt-0">
                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.technologies.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {project.liveUrl && (
                            <Button size="sm" variant="outline" asChild className="w-full bg-transparent">
                              <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Demo
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center space-y-4 pt-8">
            <p className="text-muted-foreground">Interested in working together?</p>
            <Button size="lg" asChild>
              <Link href="/contact">Get In Touch</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
