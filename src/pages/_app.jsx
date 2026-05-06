import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Head from "next/head";
import { PERSONAL_INFO } from "@/lib/constants";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";

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

const siteTitle = "Hamza Choudhary | MERN Stack Developer & UI/UX Designer";
const keywords =
  "Next.js, React, MERN, Full Stack, Lahore, REST API, Node.js, UI/UX";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={PERSONAL_INFO.bio} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={PERSONAL_INFO.name} />
        <meta property="og:title" content="Hamza Choudhary | MERN Stack Developer" />
        <meta property="og:description" content={PERSONAL_INFO.bio} />
        <meta property="og:url" content={PERSONAL_INFO.linkedin} />
        <meta property="og:site_name" content="Hamza Choudhary Portfolio" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} min-h-screen`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SmoothScroll />
          <ScrollProgress />
          <CustomCursor />
          <div className="relative z-10">
            <Component {...pageProps} />
          </div>
        </ThemeProvider>
      </div>
    </>
  );
}
