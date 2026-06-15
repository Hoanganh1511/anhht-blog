import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google, GitHub],
  callbacks: {
    async signIn({ user }) {
      // Gán quyền ADMIN cho email khớp với ADMIN_EMAIL
      if (user.id && user.email === process.env.ADMIN_EMAIL) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
        user.role = "ADMIN";
      }
      return true;
    },
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = (user as { role: "USER" | "ADMIN" }).role;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
