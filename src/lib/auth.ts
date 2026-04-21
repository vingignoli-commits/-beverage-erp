import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        username: {
          label: "Usuario o email",
          type: "text",
        },
        password: {
          label: "Contraseña",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Usuario y contraseña son obligatorios.");
        }

        const user = await prisma.user.findFirst({
          where: {
            deletedAt: null,
            status: "ACTIVE",
            OR: [
              { email: credentials.username },
              { username: credentials.username },
            ],
          },
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        });

        if (!user) {
          throw new Error("Usuario no encontrado.");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValidPassword) {
          throw new Error("Contraseña incorrecta.");
        }

        const roles = user.userRoles.map((userRole) => userRole.role.code);

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          username: user.username,
          roles,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.username = (user as { username?: string }).username;
        token.roles = (user as { roles?: string[] }).roles ?? [];
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.username = token.username as string;
        session.user.roles = (token.roles as string[]) ?? [];
      }

      return session;
    },
  },
};