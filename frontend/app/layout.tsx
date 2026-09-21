import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "../components/shared/SessionProviderWrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "BreatheWish — AI-assisted pneumonia screening",
  description:
    "Upload a chest X-ray, get an AI pre-read with a Grad-CAM heatmap, and a prescription from a verified doctor.",
  openGraph: {
    title: "BreatheWish — AI-assisted pneumonia screening",
    description:
      "AI pre-read of chest X-rays. Every result reviewed by a doctor before it reaches the patient.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-surface focus:text-text-primary focus:px-4 focus:py-2 focus:rounded-lg focus:border focus:border-border"
        >
          Skip to content
        </a>
        <SessionProviderWrapper>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#121A1D",
                color: "#EAF0EE",
                border: "1px solid #25333A",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#6FB5AC", secondary: "#0B1113" }, duration: 3000 },
              error: { iconTheme: { primary: "#E58A85", secondary: "#0B1113" }, duration: 5000 },
            }}
          />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
