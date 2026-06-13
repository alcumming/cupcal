import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// NaN Holo — display typeface for titles, headings and display text.
const holo = localFont({
  src: "./fonts/NaNHolo-Normal-VF.woff2",
  variable: "--font-holo",
  weight: "100 900",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "World Cup 2026 Calendar — only your teams, auto-updating",
    template: "%s · World Cup Calendar",
  },
  description:
    "Build a custom FIFA World Cup 2026 calendar with just the teams you follow. Subscribe once in Google Calendar, Apple Calendar or Outlook — knockout games appear automatically as your teams qualify. Free, no account needed.",
  keywords: [
    "World Cup 2026 calendar",
    "World Cup 2026 schedule",
    "World Cup fixtures Google Calendar",
    "World Cup iCal subscription",
    "FIFA World Cup 2026 dates",
  ],
  openGraph: {
    title: "World Cup 2026 Calendar — only your teams, auto-updating",
    description:
      "Pick your teams, subscribe once, and your calendar fills in knockout games as the tournament unfolds. Spoiler-free by default.",
    type: "website",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${holo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
