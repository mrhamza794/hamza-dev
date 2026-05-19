import { PERSONAL_INFO } from "@/lib/constants";

/** Set in production: https://your-domain.com */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "Hamza Choudhary";
export const SITE_TITLE =
  "Hamza Choudhary | Full Stack Developer & UI/UX Designer";
export const SITE_DESCRIPTION =
  "Full Stack Developer specializing in MERN Stack, Next.js, React, and modern UI/UX design. Building exceptional digital experiences in Lahore, Pakistan.";
export const SITE_KEYWORDS = [
  "Full Stack Developer",
  "MERN Stack",
  "Next.js",
  "React",
  "Node.js",
  "UI/UX Designer",
  "Web Developer",
  "Lahore",
  "Pakistan",
].join(", ");

export const THEME_COLOR = "#020617";

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export const SEO = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  canonical: absoluteUrl("/"),
  ogImage: absoluteUrl("/og-image.png"),
  favicon: "/favicon.ico",
  favicon32: "/favicon-32x32.png",
  favicon16: "/favicon-16x16.png",
  appleTouchIcon: "/apple-touch-icon.png",
  manifest: "/manifest.json",
  author: PERSONAL_INFO.name,
  locale: "en_US",
  twitterCard: "summary_large_image",
};

export function getPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: PERSONAL_INFO.name,
    jobTitle: PERSONAL_INFO.title,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    email: `mailto:${PERSONAL_INFO.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      addressCountry: "PK",
    },
    sameAs: [PERSONAL_INFO.linkedin, PERSONAL_INFO.github],
    knowsAbout: [
      "Next.js",
      "React",
      "Node.js",
      "MongoDB",
      "TypeScript",
      "REST APIs",
      "UI/UX Design",
    ],
  };
}

export function getWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      name: PERSONAL_INFO.name,
      url: SITE_URL,
    },
  };
}
