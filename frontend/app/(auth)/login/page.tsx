"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "../../../components/hero/LandingNav";

export default function LoginPage() {
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;
      if (role === "doctor") {
        const cleanedId = doctorId.trim().toUpperCase();
        if (!cleanedId) {
          setError("Please enter your Hospital ID card number.");
          setLoading(false);
          return;
        }
        result = await signIn("credentials", {
          redirect: false,
          role: "doctor",
          doctor_id: cleanedId,
          username: cleanedId,
        });
      } else {
        const cleanedUser = username.trim();
        if (!cleanedUser || !password) {
          setError("Please enter both your username and password.");
          setLoading(false);
          return;
        }
        result = await signIn("credentials", {
          redirect: false,
          role: "patient",
          username: cleanedUser,
          password,
        });
      }

      if (result?.error) {
        setError(
          role === "doctor"
            ? "Invalid Hospital ID card number. Please check your badge or credentials."
            : "Invalid username or password. Please try again."
        );
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login exception:", err);
      setError(
        "The server is taking longer than usual to respond (Render cold start can take ~30–45s). Please wait a moment and try again."
      );
      setLoading(false);
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
            className="link-quiet text-sm inline-block mb-8 lg:hidden"
          >
            ← Back to home
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-1.5">
            Log in
          </h1>
          <p className="text-sm text-text-muted mb-6">
            Select your role to access your portal.
          </p>

          {/* Role selector tabs */}
          <div className="grid grid-cols-2 p-1 bg-surface border border-border rounded-xl mb-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => {
                setRole("patient");
                setError("");
              }}
              className={`py-2 text-center rounded-lg transition-all duration-150 ${
                role === "patient"
                  ? "bg-background text-text-primary shadow-sm border border-border"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("doctor");
                setError("");
              }}
              className={`py-2 text-center rounded-lg transition-all duration-150 ${
                role === "doctor"
                  ? "bg-background text-doctor-accent shadow-sm border border-border"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Doctor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
            {role === "patient" ? (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm text-text-muted mb-1.5">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    autoComplete="username"
                    className={field}
                    placeholder="e.g. ravi_kumar"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
              </>
            ) : (
              <div>
                <label htmlFor="doctorId" className="block text-sm text-text-muted mb-1.5">
                  Hospital ID Card Number
                </label>
                <input
                  id="doctorId"
                  type="text"
                  required
                  autoComplete="off"
                  className={`${field} uppercase tracking-wider font-mono`}
                  placeholder="e.g. BWD-ARUN01"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value.toUpperCase())}
                  aria-invalid={!!error}
                />
                <p className="text-xs text-text-muted mt-2">
                  No password required. Verified doctors authenticate directly with their assigned ID badge number.
                </p>
              </div>
            )}

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
              className="btn-primary w-full disabled:opacity-60 disabled:pointer-events-none mt-2"
            >
              {loading ? "Authenticating…" : role === "doctor" ? "Access Doctor Portal" : "Log in"}
            </button>
          </form>

          {role === "patient" && (
            <p className="text-xs text-text-muted text-center mt-5">
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="text-doctor-accent hover:underline">
                Register as patient
              </Link>
            </p>
          )}

          {/* Quick Demo Autofill Hint */}
          <div className="mt-8 p-3 bg-surface/60 border border-border/80 rounded-lg text-xs text-text-muted space-y-1">
            <span className="font-semibold text-text-primary block mb-1">Demo Credentials:</span>
            {role === "patient" ? (
              <div className="flex items-center justify-between">
                <span>User: <code className="text-text-primary">ravi_kumar</code> / <code className="text-text-primary">patient123</code></span>
                <button
                  type="button"
                  onClick={() => {
                    setUsername("ravi_kumar");
                    setPassword("patient123");
                  }}
                  className="text-doctor-accent underline hover:text-doctor-accent/80 ml-2"
                >
                  Autofill
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span>Doctor ID: <code className="text-text-primary">BWD-ARUN01</code></span>
                <button
                  type="button"
                  onClick={() => {
                    setDoctorId("BWD-ARUN01");
                  }}
                  className="text-doctor-accent underline hover:text-doctor-accent/80 ml-2"
                >
                  Autofill
                </button>
              </div>
            )}
          </div>

          <Link href="/" className="link-quiet text-sm hidden lg:inline-block mt-6">
            ← Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
