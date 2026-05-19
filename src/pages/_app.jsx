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

const siteTitle = "Hamza Choudhary | Full Stack Developer & UI/UX Designer";
const siteDescription =
  "Full Stack Developer specializing in MERN Stack, Next.js, React, and modern UI/UX design. Building exceptional digital experiences in Lahore, Pakistan.";
const keywords =
  "Full Stack Developer, MERN Stack, Next.js, React, Node.js, UI/UX Designer, Web Developer, Lahore";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={PERSONAL_INFO.name} />
        <link rel="icon" type="image/png" href="/assets/logo/logo-dark.png" />
        <link rel="apple-touch-icon" href="/assets/logo/logo-dark.png" />
        <meta property="og:title" content="Hamza Choudhary | Full Stack Developer" />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content="/assets/logo/logo-dark.png" />
        <meta property="og:url" content={PERSONAL_INFO.linkedin} />
        <meta property="og:site_name" content="hamza-dev" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hamza Choudhary | Full Stack Developer" />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content="/assets/logo/logo-dark.png" />
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
