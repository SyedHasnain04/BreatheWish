import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "../components/shared/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "BreatheWish — AI-Powered Pneumonia Detection",
  description: "Hospital-grade chest X-ray analysis with AI assistance and doctor verification. Get fast, reliable pneumonia detection with BreatheWish.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans">
        <SessionProviderWrapper>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1E293B",
                color: "#F1F5F9",
                border: "1px solid #334155",
                borderRadius: "12px",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#10B981", secondary: "#fff" }, duration: 3000 },
              error: { iconTheme: { primary: "#EF4444", secondary: "#fff" }, duration: 5000 },
            }}
          />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
