import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Head from "next/head";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";
import { ThemeProvider } from "@/components/theme-provider";
import {
  SEO,
  THEME_COLOR,
  getPersonJsonLd,
  getWebSiteJsonLd,
} from "@/lib/site";
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

const jsonLd = [getPersonJsonLd(), getWebSiteJsonLd()];

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>{SEO.title}</title>
        <meta name="description" content={SEO.description} />
        <meta name="keywords" content={SEO.keywords} />
        <meta name="author" content={SEO.author} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow" />
        <meta name="theme-color" content={THEME_COLOR} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={SEO.canonical} />

        {/* Favicons — multiple sizes for browsers & crawlers */}
        <link rel="icon" href={SEO.favicon} sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href={SEO.favicon32} />
        <link rel="icon" type="image/png" sizes="16x16" href={SEO.favicon16} />
        <link rel="apple-touch-icon" sizes="180x180" href={SEO.appleTouchIcon} />
        <link rel="manifest" href={SEO.manifest} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={SEO.locale} />
        <meta property="og:site_name" content={SEO.title.split("|")[0].trim()} />
        <meta property="og:title" content={SEO.title} />
        <meta property="og:description" content={SEO.description} />
        <meta property="og:url" content={SEO.canonical} />
        <meta property="og:image" content={SEO.ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${SEO.author} — Full Stack Developer portfolio`} />

        {/* Twitter / X */}
        <meta name="twitter:card" content={SEO.twitterCard} />
        <meta name="twitter:title" content={SEO.title} />
        <meta name="twitter:description" content={SEO.description} />
        <meta name="twitter:image" content={SEO.ogImage} />
        <meta name="twitter:image:alt" content={`${SEO.author} — Full Stack Developer portfolio`} />

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
