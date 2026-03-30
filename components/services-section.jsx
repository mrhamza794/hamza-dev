import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Building2, Users, ShoppingCart, Palette, ArrowRight, Smartphone } from "lucide-react"

const services = [
  {
    icon: Globe,
    title: "Custom Portals",
    description:
      "Build secure, scalable web portals tailored to your business needs with modern authentication and user management systems.",
  },
  {
    icon: Building2,
    title: "Business Platforms",
    description:
      "Develop comprehensive business platforms that streamline operations and enhance productivity across your organization.",
  },
  {
    icon: Users,
    title: "CRM Solutions",
    description:
      "Create powerful customer relationship management systems to track leads, manage contacts, and boost sales performance.",
  },
  {
    icon: ShoppingCart,
    title: "E-Commerce Websites & Apps",
    description:
      "Design and develop full-featured e-commerce solutions with payment integration, inventory management, and analytics.",
  },
  {
    icon: Palette,
    title: "UI/UX & Modern Web Apps",
    description:
      "Craft beautiful, responsive web applications with intuitive user interfaces and seamless user experiences.",
  },
  {
    icon: Smartphone,
    title: "React Native Mobile Apps",
    description:
      "Build native mobile applications for iOS and Android using React Native with shared codebase and native performance.",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Services</h2>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Comprehensive development solutions to bring your ideas to life
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
            {services.map((service, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/20"
              >
                <CardHeader className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">{service.description}</p>
                  <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                    <span>Learn more</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
