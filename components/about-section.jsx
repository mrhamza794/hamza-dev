import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Code2, Trophy, Rocket, Star, Target, Zap, Brain, Coffee } from "lucide-react"

const skills = [
  "MERN Stack",
  "MongoDB",
  "Express.js",
  "React.js",
  "Node.js",
  "Next.js",
  "React Native",
  "Redux",
  "JavaScript (ES6+)",
  "jQuery",
  "Tailwind CSS",
  "Bootstrap",
  "ShadCN UI",
  "SQL",
  "Postman",
  "GitHub",
  "Vercel",
]

const timeline = [
  {
    year: "2024",
    title: "Senior Full-Stack Developer",
    description: "Leading development of enterprise-level web applications and mobile solutions",
  },
  {
    year: "2022",
    title: "Full-Stack Developer",
    description: "Specialized in MERN stack development and React Native mobile apps",
  },
  {
    year: "2020",
    title: "Frontend Developer",
    description: "Started journey in web development with React and modern JavaScript",
  },
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">About Me</h2>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Passionate developer with expertise in modern web and mobile technologies
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 w-full max-w-6xl">
            <Card className="relative overflow-hidden group">
              {/* Enhanced animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/15"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/10 to-accent/15 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              {/* More floating elements */}
              <div className="absolute top-6 right-8 w-12 h-12 bg-primary/20 rounded-full animate-pulse"></div>
              <div className="absolute bottom-8 left-8 w-6 h-6 bg-accent/30 rounded-full animate-bounce delay-300"></div>
              <div className="absolute top-1/3 right-12 w-3 h-3 bg-primary/40 rounded-full animate-ping delay-700"></div>
              <div className="absolute bottom-1/3 left-16 w-4 h-4 bg-accent/25 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute top-12 left-1/3 w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-500"></div>

              <CardContent className="p-10 relative z-10">
                <div className="space-y-8">
                  <div className="relative">
                    <div className="w-full h-48 bg-gradient-to-r from-primary/30 via-accent/25 to-primary/30 rounded-3xl relative overflow-hidden shadow-2xl">
                      {/* Enhanced code pattern overlay */}
                      <div className="absolute inset-0 opacity-40">
                        <div className="absolute top-6 left-6 text-sm font-mono text-primary/80">
                          {"<FullStackDeveloper>"}
                        </div>
                        <div className="absolute top-12 left-10 text-sm font-mono text-accent/80">
                          {"const skills = ['MERN', 'React Native'];"}
                        </div>
                        <div className="absolute top-18 left-10 text-sm font-mono text-primary/80">
                          {"function createAwesome() {"}
                        </div>
                        <div className="absolute top-24 left-14 text-sm font-mono text-accent/80">
                          {"return innovation + passion;"}
                        </div>
                        <div className="absolute top-30 left-10 text-sm font-mono text-primary/80">{"}"}</div>
                        <div className="absolute bottom-6 right-6 text-sm font-mono text-accent/80">
                          {"</FullStackDeveloper>"}
                        </div>
                      </div>

                      {/* Enhanced central design */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="w-24 h-24 bg-background/95 rounded-2xl flex items-center justify-center shadow-2xl border border-primary/20">
                            <Code2 className="w-12 h-12 text-primary animate-pulse" />
                          </div>
                          {/* Orbiting icons */}
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent/90 rounded-full flex items-center justify-center animate-spin">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-primary/90 rounded-full flex items-center justify-center animate-bounce">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* More animated elements */}
                      <div className="absolute top-8 right-12 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                      <div className="absolute bottom-12 left-20 w-2 h-2 bg-accent rounded-full animate-pulse delay-700"></div>
                      <div className="absolute top-16 right-16 w-1.5 h-1.5 bg-primary/80 rounded-full animate-pulse delay-1200"></div>
                      <div className="absolute bottom-20 right-8 w-2.5 h-2.5 bg-accent/70 rounded-full animate-ping delay-300"></div>
                    </div>
                  </div>

                  <div className="text-center space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3">
                        <Rocket className="h-6 w-6 text-primary animate-bounce" />
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                          John Developer
                        </h3>
                        <Star className="h-6 w-6 text-accent animate-pulse" />
                        <Coffee className="h-5 w-5 text-primary/70 animate-bounce delay-500" />
                      </div>

                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <MapPin className="h-5 w-5" />
                        <span className="text-lg">San Francisco, CA</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <Badge
                        variant="secondary"
                        className="text-sm px-4 py-2 bg-primary/15 hover:bg-primary/25 transition-colors"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        4+ Years Experience
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-sm px-4 py-2 bg-accent/15 hover:bg-accent/25 transition-colors"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        50+ Projects Delivered
                      </Badge>
                    </div>

                    <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
                      Full-stack developer with 4+ years of experience building scalable web applications and mobile
                      solutions. Passionate about clean code, user experience, and cutting-edge development practices. I
                      transform ideas into powerful digital experiences.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Code2 className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-semibold">Technical Skills</h3>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-base px-5 py-3 bg-background/80 border border-border/50 text-foreground hover:bg-muted/80 hover:border-primary/30 transition-all duration-200 cursor-default font-medium shadow-sm"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardContent className="p-8">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-semibold">Career Timeline</h3>
                  </div>

                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>

                    <div className="space-y-8">
                      {timeline.map((item, index) => (
                        <div key={index} className="relative flex items-start gap-6">
                          {/* Timeline dot */}
                          <div className="relative z-10 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-background"></div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-2 pb-8">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-primary">{item.year}</span>
                              <Badge variant="outline" className="text-xs">
                                {index === 0 ? "Current" : "Previous"}
                              </Badge>
                            </div>
                            <h4 className="text-xl font-semibold">{item.title}</h4>
                            <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
