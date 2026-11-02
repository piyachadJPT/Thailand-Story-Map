import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/api/db/prisma";
import { UserRole, UserStatus } from "@/models/enums";

export const isGoogleAuthConfigured =
  Boolean(process.env.AUTH_SECRET) &&
  Boolean(process.env.AUTH_GOOGLE_ID) &&
  Boolean(process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: isGoogleAuthConfigured
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID!,
          clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          profile(profile) {
            const email = profile.email ?? "";
            const fallbackName = email.split("@")[0] || "ผู้ใช้";
            return {
              id: profile.sub,
              name: profile.name?.trim() || fallbackName,
              email,
              image: profile.picture,
            };
          },
        }),
      ]
    : [],
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        const googleProfile = profile as { email_verified?: boolean } | undefined;
        if (!googleProfile?.email_verified) return false;
      }

      const email = user.email;
      if (!email) return false;

      // Backoffice accounts sign in with username + password only.
      if (email.toLowerCase().endsWith("@admin.local")) return false;
      const existing = await prisma.user.findUnique({
        where: { email },
        select: { status: true, passwordHash: true },
      });
      if (existing?.status === UserStatus.BANNED) return false;
      if (existing?.passwordHash) return false;
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/") && !url.startsWith("//")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        return baseUrl;
      }
      return baseUrl;
    },
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role ?? UserRole.USER;
      session.user.status = user.status ?? UserStatus.ACTIVE;
      return session;
    },
  },
});
