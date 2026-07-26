import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TraceGuard — Know Your Digital Footprint",
  description: "AI-powered OSINT platform that analyzes your digital exposure across data breaches, social media, and the web. Get actionable threat intelligence and privacy recommendations.",
  keywords: "OSINT, cybersecurity, digital footprint, data breach, privacy, threat intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased font-sans">
        <div className="particle-bg" />
        <div className="grid-bg min-h-screen relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
