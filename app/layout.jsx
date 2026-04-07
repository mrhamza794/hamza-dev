import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { PERSONAL_INFO } from "@/lib/constants";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
  weight: ["500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "Hamza Choudhary | MERN Stack Developer & UI/UX Designer",
  description: PERSONAL_INFO.bio,
  keywords: ["Next.js", "React", "MERN", "Full Stack", "Lahore", "Development Team Lead", "UI/UX", "3D Graphics"],
  authors: [{ name: PERSONAL_INFO.name }],
  openGraph: {
    title: "Hamza Choudhary | MERN Stack Developer",
    description: PERSONAL_INFO.bio,
    url: PERSONAL_INFO.linkedin,
    siteName: "Hamza Choudhary Portfolio",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <ScrollProgress />
        <CustomCursor />
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
