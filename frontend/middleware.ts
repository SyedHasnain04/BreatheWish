import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (path.startsWith("/doctor") && token.role !== "doctor") {
      return NextResponse.redirect(new URL("/patient/dashboard", req.url));
    }

    if (path.startsWith("/patient") && token.role !== "patient") {
      return NextResponse.redirect(new URL("/doctor/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/doctor/:path*", "/patient/:path*", "/dashboard/:path*"],
};
