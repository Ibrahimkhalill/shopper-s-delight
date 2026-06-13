import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// ─── Validation ───────────────────────────────────────────────────────────────

const loginSchema = z.object({
  phone: z.string().min(10).max(15),
  password: z.string().min(6),
});

// ─── NextAuth v5 config ───────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        phone:    { label: "Phone",    type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { phone, password } = parsed.data;

        const user = await db.user.findUnique({ where: { phone } });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        // Return only safe fields — these go into the JWT token
        return {
          id:    user.id,
          name:  user.name,
          phone: user.phone,
          email: user.email ?? undefined,
          role:  user.role,
        };
      },
    }),
  ],

  // JWT strategy — no DB sessions needed, works on Vercel edge
  session: { strategy: "jwt" },

  callbacks: {
    // Attach role + phone to the JWT so we can check it in middleware
    async jwt({ token, user }) {
      if (user) {
        token.id    = user.id ?? "";
        token.phone = (user as { phone?: string }).phone ?? "";
        token.role  = (user as { role?: string }).role  ?? "CUSTOMER";
      }
      return token;
    },
    // Expose id, phone, role on the session object used in components
    async session({ session, token }) {
      if (token) {
        session.user.id    = token.id as string;
        session.user.phone = token.phone as string;
        session.user.role  = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});
