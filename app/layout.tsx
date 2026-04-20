import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | SpeakEasy",
    default: "SpeakEasy — AI Speaking Practice",
  },
  description:
    "AI-powered English speaking practice for ESL learners. Structured lessons, pronunciation scoring, and instant feedback.",
  applicationName: "SpeakEasy",
  keywords: ["ESL", "English", "speaking", "pronunciation", "AI", "language learning"],
  authors: [{ name: "Innov8ive.AI" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SpeakEasy",
  },
  openGraph: {
    type: "website",
    siteName: "SpeakEasy",
    title: "SpeakEasy — AI Speaking Practice",
    description:
      "The app that teaches you to speak from day one. AI-powered pronunciation scoring and structured lessons.",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E56A0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
