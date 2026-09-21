import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const { handlers } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        role: { label: "Role", type: "text" },
        doctor_id: { label: "Doctor ID", type: "text" },
        username: { label: "Username", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const backendUrl = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");
        const isDoctor = credentials.role === "doctor" || Boolean(credentials.doctor_id);

        try {
          let tokens: { access_token: string; token_type: string } | null = null;

          if (isDoctor) {
            const docId = ((credentials.doctor_id || credentials.username || "") as string).trim().toUpperCase();
            if (!docId) return null;

            // Try dedicated doctor endpoint first
            let res = await fetch(`${backendUrl}/auth/login/doctor`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ doctor_id: docId }),
              cache: "no-store",
            });

            // Fallback to standard OAuth2 form if needed
            if (!res.ok) {
              res = await fetch(`${backendUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                  username: docId,
                  password: "doctor_id_login",
                }),
                cache: "no-store",
              });
            }

            if (!res.ok) return null;
            tokens = await res.json();
          } else {
            // Patient login
            const identifier = ((credentials.username || credentials.email || "") as string).trim();
            const password = (credentials.password as string) || "";
            if (!identifier || !password) return null;

            // Try dedicated patient endpoint first
            let res = await fetch(`${backendUrl}/auth/login/patient`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: identifier, password }),
              cache: "no-store",
            });

            // Fallback to standard OAuth2 form
            if (!res.ok) {
              res = await fetch(`${backendUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                  username: identifier,
                  password: password,
                }),
                cache: "no-store",
              });
            }

            if (!res.ok) return null;
            tokens = await res.json();
          }

          if (!tokens?.access_token) return null;

          const userRes = await fetch(`${backendUrl}/auth/me`, {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
            cache: "no-store",
          });

          if (!userRes.ok) return null;
          const user = await userRes.json();

          return {
            id: user.id,
            email: user.email || user.username || user.doctor_id || "user@breathewish.internal",
            name: user.full_name,
            role: user.role,
            accessToken: tokens.access_token,
          };
        } catch (e) {
          console.error("Auth authorize error:", e);
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
