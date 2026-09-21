import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

/**
 * Same-origin proxy to the FastAPI backend. It attaches the user's access token
 * from the NextAuth session, so the browser never handles the backend JWT.
 *
 * Only the route groups the app actually uses are forwarded.
 */
const ALLOWED = [
  "cases",
  "prescriptions",
  "follow-up",
  "second-opinion",
  "consultations",
  "notifications",
];

async function handler(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { detail: "Server is missing NEXTAUTH_SECRET" },
      { status: 500 }
    );
  }

  const backend = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");
  // Keep the trailing slash: FastAPI treats /cases and /cases/ as different routes.
  const subpath = req.nextUrl.pathname.replace(/^\/api\/proxy/, "");
  const first = subpath.split("/").filter(Boolean)[0] ?? "";

  const isRegister = subpath === "/auth/register" && req.method === "POST";
  if (!isRegister && !ALLOWED.includes(first)) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  let body: BodyInit | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  if (isRegister) {
    // Public sign-up is patients only. Doctor accounts are created by an administrator.
    try {
      const payload = JSON.parse(new TextDecoder().decode(body as ArrayBuffer));
      body = JSON.stringify({
        email: payload.email,
        password: payload.password,
        full_name: payload.full_name,
        date_of_birth: payload.date_of_birth || null,
        role: "patient",
      });
      headers.set("content-type", "application/json");
    } catch {
      return NextResponse.json({ detail: "Invalid request" }, { status: 400 });
    }
  } else {
    const token = await getToken({ req, secret });
    const accessToken = (token as { accessToken?: string } | null)?.accessToken;
    if (!accessToken) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }
    headers.set("authorization", `Bearer ${accessToken}`);
  }

  try {
    const upstream = await fetch(`${backend}${subpath}${req.nextUrl.search}`, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });
    const out = new Headers();
    const ct = upstream.headers.get("content-type");
    if (ct) out.set("content-type", ct);
    return new NextResponse(upstream.body, { status: upstream.status, headers: out });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable" }, { status: 502 });
  }
}

export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };
