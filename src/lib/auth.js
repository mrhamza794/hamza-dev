import GoogleProvider from "next-auth/providers/google";

/** NextAuth callback: {NEXTAUTH_URL}/api/auth/callback/google — must match Google Cloud Console. */
function resolveAuthUrl() {
  const explicit = process.env.NEXTAUTH_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl && !siteUrl.includes("localhost")) {
    return siteUrl.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

if (!process.env.NEXTAUTH_URL?.trim()) {
  process.env.NEXTAUTH_URL = resolveAuthUrl();
}

export function getAdminEmail() {
  return (
    process.env.ADMIN_GOOGLE_EMAIL ||
    process.env.GMAIL_USER ||
    process.env.CONTACT_TO_EMAIL ||
    ""
  )
    .trim()
    .toLowerCase();
}

export const authOptions = {
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/admin",
    error: "/admin",
  },
  callbacks: {
    async signIn({ user }) {
      const allowed = getAdminEmail();
      if (!allowed) return false;
      return user?.email?.toLowerCase() === allowed;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email.toLowerCase();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
};
