import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import "dotenv/config";
import bcrypt from "bcrypt";


export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Nom d'utilisateur", type: "text" },
        password: {
          label: "Mot de passe",
          type: "password",
          placeholder: "********",
        },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error(
            "Le nom d'utilisateur et le mot de passe sont requis",
          );
        }

        const user = await db.user.findUnique({
          where: { username: credentials.username },
          select: {
            id: true,
            password: true,
            role: true,
            username: true,
            desactivated: true,
          },
        });

        if (user) {
          if (user.desactivated) {
            throw new Error(
              "Ce compte a été désactivé. Veuillez contacter l'administrateur.",
            );
          } else {
            if (await bcrypt.compare(credentials.password, user.password)) {
              return {
                id: user.id,
                role: user.role,
                username: user.username,
              };
            } else {
              throw new Error("Mot de passe incorrect");
            }
          }
        }

        throw new Error("Aucun utilisateur trouvé avec cet identifiant");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          username: user.username,
          role: user.role,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          username: token.username,
          role: token.role,
        },
      };
    },
  },
};
