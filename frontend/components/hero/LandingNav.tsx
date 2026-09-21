"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#patients", label: "Patients" },
  { href: "#doctors", label: "Doctors" },
];

export function LogoMark({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 3.5v8.2c0 3.2-2.3 5.3-5.6 5.3C4.4 11.4 5.9 6.4 10 3.5Z" />
      <path d="M14 3.5v8.2c0 3.2 2.3 5.3 5.6 5.3-0.0-5.6-1.5-10.6-5.6-13.5Z" />
      <path d="M12 3v7" />
    </svg>
  );
}

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-[background-color,border-color] duration-300 border-b ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-border"
          : "bg-transparent border-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
      >
        <Link href="/" className="flex items-center gap-2.5 text-text-primary">
          <span className="text-doctor-accent">
            <LogoMark />
          </span>
          <span className="text-lg font-semibold tracking-tight">BreatheWish</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8 text-sm text-text-muted">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="hover:text-text-primary transition-colors duration-200"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm text-text-muted hover:text-text-primary transition-colors duration-200 px-3 py-2"
          >
            Log in
          </Link>
          <Link href="/login" className="btn-primary text-sm !py-2 !px-4">
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
}
