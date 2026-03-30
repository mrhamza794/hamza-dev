import { SiteHeader } from "@/components/site-header"
import { ContactForm } from "@/components/contact-form"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "contact@example.com",
    description: "Send me an email anytime",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+1 (555) 123-4567",
    description: "Available Mon-Fri, 9AM-6PM PST",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "San Francisco, CA",
    description: "Open to remote work worldwide",
  },
  {
    icon: Clock,
    title: "Response Time",
    value: "Within 24 hours",
    description: "I'll get back to you quickly",
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="text-center space-y-4 mb-16">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Get In Touch</h1>
              <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
                Ready to start your next project? Let's discuss how I can help bring your ideas to life.
              </p>
            </div>

            <div className="grid gap-12 lg:grid-cols-3">
              {/* Contact Form - Now takes 2/3 of the space */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Send a Message</h2>
                  <p className="text-muted-foreground mb-6">
                    Fill out the form below and I'll get back to you as soon as possible.
                  </p>
                </div>
                <ContactForm />
              </div>

              {/* Contact Information - Now takes 1/3 of the space */}
              <div className="lg:col-span-1 space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Contact Info</h2>
                  <p className="text-muted-foreground mb-6">
                    Prefer to reach out directly? Here are the best ways to contact me.
                  </p>
                </div>

                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <Card key={index} className="border-border/50 hover:border-primary/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <info.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm">{info.title}</h3>
                            <p className="text-sm font-medium text-foreground">{info.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Additional Info */}
                <Card className="bg-muted/30 border-border/50">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 text-sm">Let's Work Together</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      I'm always interested in new opportunities and exciting projects. Whether you need a full-stack
                      developer for your team or want to discuss a freelance project, I'd love to hear from you.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {["Web Development", "Mobile Apps", "Consulting", "Code Review"].map((service) => (
                        <span
                          key={service}
                          className="px-2 py-1 text-xs bg-background rounded-full border border-border/50"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
