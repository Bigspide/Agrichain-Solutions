import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";

// Extend the built-in session types to include our custom user fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isVerified: boolean;
      phone: string | null;
      country: string;
      language: string;
      createdAt: string | null;
      subscription: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    isVerified?: boolean;
    phone: string | null;
    country: string;
    language: string;
    createdAt: Date | null;
    subscription: string;
  }
}

export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email().max(180),
            password: z.string().min(8).max(160),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            passwordHash: true,
            isVerified: true,
            phone: true,
            country: true,
            language: true,
            createdAt: true,
            subscription: true,
          },
        });

        if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          isVerified: user.isVerified,
          phone: user.phone,
          country: user.country,
          language: user.language,
          createdAt: user.createdAt,
          subscription: user.subscription,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.phone = user.phone ?? null;
        token.country = user.country ?? "CI";
        token.language = user.language ?? "fr";
        token.createdAt = user.createdAt ?? null;
        token.subscription = user.subscription ?? "starter";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "consumer";
        session.user.isVerified = Boolean(token.isVerified);
        session.user.phone = token.phone as string | null;
        session.user.country = (token.country as string) || "CI";
        session.user.language = (token.language as string) || "fr";
        session.user.createdAt = token.createdAt as any;
        session.user.subscription = (token.subscription as string) || "starter";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
