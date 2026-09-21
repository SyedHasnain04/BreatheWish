"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "../../../components/hero/LandingNav";

const field =
  "w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 transition-colors duration-200 hover:border-text-muted/50 focus:outline-none focus:border-doctor-accent focus:ring-1 focus:ring-doctor-accent aria-[invalid=true]:border-severe";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const next: Record<string, string> = {};
    if (!fullName.trim()) next.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirm !== password) next.confirm = "The passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const res = await fetch("/api/proxy/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName.trim(), role: "patient" }),
      });

      if (!res.ok) {
        let detail = "";
        try {
          detail = (await res.json())?.detail;
        } catch {
          /* non-JSON error */
        }
        setFormError(
          res.status === 400 && /already/i.test(String(detail))
            ? "An account with that email already exists. Try logging in."
            : "We couldn't create your account. Please try again."
        );
        setLoading(false);
        return;
      }

      // Log straight in so the patient lands on their dashboard
      const result = await signIn("credentials", { email, password, redirect: false });
      router.push(result?.error ? "/login" : "/patient/dashboard");
    } catch {
      setFormError("Network problem. Check your connection and try again.");
      setLoading(false);
    }
  };

  const inv = (k: string) =>
    ({
      "aria-invalid": !!errors[k],
      "aria-describedby": errors[k] ? `${k}-err` : undefined,
    } as const);
  const err = (k: string) =>
    errors[k] && (
      <p id={`${k}-err`} className="text-xs text-severe-soft mt-1.5">
        {errors[k]}
      </p>
    );

  return (
    <main id="main" className="min-h-[100dvh] grid lg:grid-cols-[1.1fr_0.9fr] bg-background">
      <aside className="relative grain hidden lg:flex flex-col justify-between p-12 bg-surface border-r border-border overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -bottom-40 -left-24 w-[36rem] h-[36rem] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(closest-side, rgba(111,181,172,0.14), rgba(111,181,172,0) 70%)" }}
        />
        <Link href="/" className="relative flex items-center gap-2.5 text-text-primary w-fit">
          <span className="text-doctor-accent">
            <LogoMark />
          </span>
          <span className="text-lg font-semibold tracking-tight">BreatheWish</span>
        </Link>
        <p className="relative text-3xl font-semibold tracking-tight text-text-primary leading-[1.15] max-w-[18ch]">
          Upload once. A doctor does the rest.
        </p>
      </aside>

      <section className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="link-quiet text-sm inline-block mb-10 lg:hidden">
            ← Back to home
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-1.5">
            Create a patient account
          </h1>
          <p className="text-sm text-text-muted mb-8">
            Are you a doctor? Accounts for doctors are set up by an administrator.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="name" className="block text-sm text-text-muted mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className={field}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                {...inv("name")}
              />
              {err("name")}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-text-muted mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={field}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                {...inv("email")}
              />
              {err("email")}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-text-muted mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className={field}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                {...inv("password")}
              />
              {err("password")}
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm text-text-muted mb-1.5">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                className={field}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                {...inv("confirm")}
              />
              {err("confirm")}
            </div>

            {formError && (
              <p
                role="alert"
                className="text-sm text-severe-soft bg-severe-bg border border-severe/30 rounded-lg px-3.5 py-2.5"
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

            <p className="text-xs text-text-muted">
              By continuing you agree to the{" "}
              <Link href="/terms" className="link-quiet">
                terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="link-quiet">
                privacy policy
              </Link>
              .
            </p>
          </form>

          <p className="text-sm text-text-muted mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-doctor-accent hover:underline underline-offset-4">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
