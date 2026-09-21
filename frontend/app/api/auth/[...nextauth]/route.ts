import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const { handlers } = NextAuth({
  trustHost: true,
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

        const backendUrl = (process.env.BACKEND_URL || "https://breathewish-api.onrender.com").replace(/\/$/, "");
        const isDoctor = credentials.role === "doctor" || Boolean(credentials.doctor_id);

        try {
          let tokens: { access_token: string; token_type: string } | null = null;

          if (isDoctor) {
            const docId = ((credentials.doctor_id || credentials.username || "") as string).trim().toUpperCase();
            if (!docId) return null;

            const legacyDoctorMap: Record<string, string> = {
              "BWD-ARUN01": "arun@hospital.com",
              "BWD-PRIYA1": "priya@hospital.com",
              "BWD-VIKR01": "vikram@hospital.com",
              "BWD-RAJA01": "rajan@hospital.com",
              "BWD-SUNI01": "sunita@hospital.com",
            };
            const mappedUser = legacyDoctorMap[docId] || docId;
            const mappedPass = legacyDoctorMap[docId] ? "doctor123" : "doctor_id_login";

            // Single high-speed request
            let res = await fetch(`${backendUrl}/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                username: mappedUser,
                password: mappedPass,
              }),
              cache: "no-store",
              signal: AbortSignal.timeout(20000),
            });

            if (!res.ok) {
              // Try dedicated doctor endpoint if standard returned error
              res = await fetch(`${backendUrl}/auth/login/doctor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ doctor_id: docId }),
                cache: "no-store",
                signal: AbortSignal.timeout(20000),
              });
            }

            if (!res.ok) return null;
            tokens = await res.json();
          } else {
            // Patient login
            const identifier = ((credentials.username || credentials.email || "") as string).trim();
            const password = (credentials.password as string) || "";
            if (!identifier || !password) return null;

            const legacyPatientMap: Record<string, string> = {
              ravi_kumar: "ravi@patient.com",
              priya_nair: "priya@patient.com",
            };
            const mappedUser = legacyPatientMap[identifier] || identifier;

            // Single high-speed request
            let res = await fetch(`${backendUrl}/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                username: mappedUser,
                password: password,
              }),
              cache: "no-store",
              signal: AbortSignal.timeout(20000),
            });

            if (!res.ok) {
              // Fallback to JSON endpoint
              res = await fetch(`${backendUrl}/auth/login/patient`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: identifier, password }),
                cache: "no-store",
                signal: AbortSignal.timeout(20000),
              });
            }

            if (!res.ok) return null;
            tokens = await res.json();
          }

          if (!tokens?.access_token) return null;

          // Decode user directly from JWT payload in 0.1ms without an extra network round-trip!
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let user: any = null;
          try {
            const parts = tokens.access_token.split(".");
            if (parts.length === 3) {
              const payloadJson = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
              if (payloadJson?.id && payloadJson?.role) {
                user = {
                  id: payloadJson.id,
                  email: payloadJson.sub || payloadJson.id,
                  name: isDoctor ? (credentials.doctor_id || "Dr. Staff") : (credentials.username || "Patient"),
                  role: payloadJson.role,
                  accessToken: tokens.access_token,
                };
              }
            }
          } catch {
            /* fallback to fetch /auth/me below */
          }

          if (!user) {
            const userRes = await fetch(`${backendUrl}/auth/me`, {
              headers: { Authorization: `Bearer ${tokens.access_token}` },
              cache: "no-store",
              signal: AbortSignal.timeout(10000),
            });

            if (!userRes.ok) return null;
            const fullUser = await userRes.json();
            user = {
              id: fullUser.id,
              email: fullUser.email || fullUser.username || "user@breathewish.internal",
              name: fullUser.full_name,
              role: fullUser.role,
              accessToken: tokens.access_token,
            };
          }

          return user;
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
