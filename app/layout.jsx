import { Inter } from "next/font/google"
import { JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata = {
  title: "John Developer | Full-Stack & Mobile App Developer",
  description:
    "Full-Stack & Mobile App Developer specializing in MERN Stack, Next.js, and React Native. Building modern web applications, mobile solutions, portals, platforms, CRMs, and e-commerce apps with cutting-edge technology.",
  keywords: [
    "Full-Stack Developer",
    "Mobile App Developer",
    "MERN Stack",
    "Next.js",
    "React Native",
    "Web Development",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "React",
    "MongoDB",
    "CRM Development",
    "E-commerce",
    "San Francisco Developer",
  ],
  authors: [{ name: "John Developer" }],
  creator: "John Developer",
  publisher: "John Developer",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://your-portfolio-domain.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-portfolio-domain.com",
    title: "John Developer | Full-Stack & Mobile App Developer",
    description:
      "Full-Stack & Mobile App Developer specializing in MERN Stack, Next.js, and React Native. Building modern web applications and mobile solutions.",
    siteName: "John Developer Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "John Developer - Full-Stack & Mobile App Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "John Developer | Full-Stack & Mobile App Developer",
    description:
      "Full-Stack & Mobile App Developer specializing in MERN Stack, Next.js, and React Native. Building modern web applications and mobile solutions.",
    images: ["/og-image.png"],
    creator: "@yourtwitterhandle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.app'
}

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0891b2" />
        <style>{`
html {
  font-family: ${inter.style.fontFamily}, system-ui, sans-serif;
  --font-sans: ${inter.style.fontFamily}, system-ui, sans-serif;
  --font-mono: ${jetbrainsMono.style.fontFamily}, 'Courier New', monospace;
  scroll-behavior: smooth;
}
        `}</style>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
