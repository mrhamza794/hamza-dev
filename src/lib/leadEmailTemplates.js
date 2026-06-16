import { PERSONAL_INFO } from "@/lib/constants";

export const EMAIL_TEMPLATE_TYPES = {
  NO_WEBSITE: "noWebsite",
  HAS_WEBSITE: "hasWebsite",
};

const SENDER = PERSONAL_INFO.name;
const ROLE = PERSONAL_INFO.title;
const EXPERIENCE = PERSONAL_INFO.experience;
export const PORTFOLIO_URL = "https://hamzach-dev.netlify.app";

export const DEFAULT_LEAD_EMAIL_TEMPLATES = {
  noWebsite: {
    label: "No website",
    description: "For businesses without an online presence",
    subject: "Professional website proposal for {{companyName}}",
    message: `I hope this message finds you well. My name is ${SENDER}, a ${ROLE} with ${EXPERIENCE} of experience building modern web applications for businesses like {{companyName}}.

Today, most customers search online before they call, visit, or buy. When a business does not have a professional website, it often loses trust, visibility, and leads to competitors who are easier to find on Google and social platforms.

I help businesses launch fast, credible, and conversion-focused websites using a modern stack including Next.js, React, Node.js, and Tailwind CSS — chosen for performance, SEO, mobile responsiveness, and long-term scalability.

What a professional website can do for {{companyName}}:
• Build credibility and trust with first-time customers
• Make your business discoverable 24/7 on search engines
• Showcase services, location, and contact details clearly
• Turn visitors into calls, bookings, and sales inquiries
• Strengthen your brand with a clean, modern user experience

I would be glad to prepare a tailored proposal for {{companyName}} — including scope, timeline, and a clear plan focused on business results, not just design.

If you are open to a short conversation this week, please reply to this email and we can discuss your goals and the best next step.

You can view examples of my work on my portfolio: ${PORTFOLIO_URL}

Thank you for your time.`,
  },
  hasWebsite: {
    label: "Has website",
    description: "For businesses with an existing site — upgrade or redesign",
    subject: "Website enhancement proposal for {{companyName}}",
    message: `I hope you are doing well. My name is ${SENDER}, a ${ROLE} with ${EXPERIENCE} of experience helping businesses improve their online presence.

I came across {{companyName}} and noticed you already have a website — which is a strong foundation. Many businesses still miss opportunities because their site is slow, outdated, not mobile-friendly, or not optimized for search and conversions.

I specialize in upgrading and rebuilding websites using Next.js, React, Node.js, and Tailwind CSS — a modern stack designed for speed, SEO, security, and maintainability.

How an enhanced website can impact {{companyName}}:
• Faster load times and better mobile experience for customers
• Improved Google visibility and stronger local search presence
• Clearer service messaging that converts visitors into leads
• Modern design that reflects the quality of your business
• Easier future updates for promotions, content, and new services

Whether you need a full redesign or targeted improvements to your current site, I can share a practical proposal with scope, timeline, and expected business outcomes.

If enhancing your website is a priority, I would welcome a brief call to understand your goals and recommend the most effective approach for {{companyName}}.

You can review my recent projects and case studies on my portfolio: ${PORTFOLIO_URL}

Thank you for considering this — I look forward to hearing from you.`,
  },
};

export function prepareTemplatesForModal(templates, leads = []) {
  const result = {
    noWebsite: { ...templates.noWebsite },
    hasWebsite: { ...templates.hasWebsite },
  };

  if (leads.length === 1 && leads[0]?.companyName?.trim()) {
    const name = leads[0].companyName.trim();
    for (const key of ["noWebsite", "hasWebsite"]) {
      result[key] = {
        subject: personalizeEmailText(result[key].subject, name),
        message: personalizeEmailText(result[key].message, name),
      };
    }
  }

  return result;
}

export function getDefaultEmailTemplates() {
  return {
    noWebsite: {
      subject: DEFAULT_LEAD_EMAIL_TEMPLATES.noWebsite.subject,
      message: DEFAULT_LEAD_EMAIL_TEMPLATES.noWebsite.message,
    },
    hasWebsite: {
      subject: DEFAULT_LEAD_EMAIL_TEMPLATES.hasWebsite.subject,
      message: DEFAULT_LEAD_EMAIL_TEMPLATES.hasWebsite.message,
    },
  };
}

export function leadHasWebsite(lead) {
  return Boolean(lead?.website?.trim());
}

export function getTemplateKeyForLead(lead) {
  return leadHasWebsite(lead) ? EMAIL_TEMPLATE_TYPES.HAS_WEBSITE : EMAIL_TEMPLATE_TYPES.NO_WEBSITE;
}

export function personalizeEmailText(text, companyName) {
  const name = companyName?.trim() || "there";
  return String(text)
    .replace(/\{\{companyName\}\}/gi, name)
    .replace(/\{\{name\}\}/gi, name)
    .replace(/\{\{portfolioUrl\}\}/gi, PORTFOLIO_URL);
}

export function pickTemplateForLead(lead, templates) {
  const key = getTemplateKeyForLead(lead);
  return templates[key] || templates.noWebsite;
}
