import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Missing NEXTAUTH_SECRET environment variable.");
  }

  const token = await getToken({ req, secret });
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
