import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "a-very-secure-random-secret-key-123" });
  const path = req.nextUrl.pathname;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/doctor") && (token as any).role !== "doctor") {
    return NextResponse.redirect(new URL("/patient/dashboard", req.url));
  }

  if (path.startsWith("/patient") && (token as any).role !== "patient") {
    return NextResponse.redirect(new URL("/doctor/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/doctor/:path*", "/patient/:path*", "/dashboard/:path*"],
};
