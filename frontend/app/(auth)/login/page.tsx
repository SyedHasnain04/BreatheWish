"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "../../../components/hero/LandingNav";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const field =
    "w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 transition-colors duration-200 hover:border-text-muted/50 focus:outline-none focus:border-doctor-accent focus:ring-1 focus:ring-doctor-accent";

  return (
    <main id="main" className="min-h-[100dvh] grid lg:grid-cols-[1.1fr_0.9fr] bg-background">
      <aside className="relative grain hidden lg:flex flex-col justify-between p-12 bg-surface border-r border-border overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -bottom-40 -left-24 w-[36rem] h-[36rem] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(closest-side, rgba(111,181,172,0.14), rgba(111,181,172,0) 70%)",
          }}
        />
        <Link href="/" className="relative flex items-center gap-2.5 text-text-primary w-fit">
          <span className="text-doctor-accent">
            <LogoMark />
          </span>
          <span className="text-lg font-semibold tracking-tight">BreatheWish</span>
        </Link>
        <p className="relative text-3xl font-semibold tracking-tight text-text-primary leading-[1.15] max-w-[18ch]">
          Every result is reviewed by a doctor.
        </p>
      </aside>

      <section className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="link-quiet text-sm inline-block mb-10 lg:hidden"
          >
            ← Back to home
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-1.5">
            Log in
          </h1>
          <p className="text-sm text-text-muted mb-8">Use the email you registered with.</p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
            <div>
              <label htmlFor="email" className="block text-sm text-text-muted mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className={field}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-text-muted mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                className={field}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!error}
              />
            </div>

            {error && (
              <p
                role="alert"
                className="text-sm text-severe-soft bg-severe-bg border border-severe/30 rounded-lg px-3.5 py-2.5"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <Link href="/" className="link-quiet text-sm hidden lg:inline-block mt-8">
            ← Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
