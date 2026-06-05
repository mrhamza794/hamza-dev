import GoogleProvider from "next-auth/providers/google";

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
