import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Missing NEXTAUTH_SECRET environment variable.");
  }

  const isSecure = req.url.startsWith("https://");
  const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";

  // Auth.js v5 uses the cookieName as salt
  let token = await getToken({
    req,
    secret,
    salt: cookieName,
    cookieName,
  });

  // Fallback to legacy NextAuth v4 cookie if present
  if (!token) {
    const legacyCookie = isSecure ? "__Secure-next-auth.session-token" : "next-auth.session-token";
    token = await getToken({
      req,
      secret,
      salt: legacyCookie,
      cookieName: legacyCookie,
    });
  }

  const path = req.nextUrl.pathname;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const userRole = token.role as string | undefined;

  if (path.startsWith("/doctor") && userRole !== "doctor") {
    return NextResponse.redirect(new URL("/patient/dashboard", req.url));
  }

  if (path.startsWith("/patient") && userRole !== "patient") {
    return NextResponse.redirect(new URL("/doctor/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/doctor/:path*", "/patient/:path*", "/dashboard/:path*"],
};
