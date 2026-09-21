import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const { handlers } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
          
          const res = await fetch(`${backendUrl}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              username: credentials.email as string,
              password: credentials.password as string,
            }),
          });

          if (!res.ok) return null;
          const tokens = await res.json();

          const userRes = await fetch(`${backendUrl}/auth/me`, {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });

          if (!userRes.ok) return null;
          const user = await userRes.json();

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            role: user.role,
            accessToken: tokens.access_token,
          };
        } catch (e) {
          console.error("Auth error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // NextAuth's callback types don't include our custom fields (role, accessToken, id).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.id = user.id;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        (session as { accessToken?: string }).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});

export const { GET, POST } = handlers;
