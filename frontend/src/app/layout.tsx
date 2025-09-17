import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindSupport",
  description:
    "Anonymous supportive chat, screening, journaling, and counselor connections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background text-foreground" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <div className="w-full bg-yellow-100 text-yellow-900 text-sm py-2 px-4 border-b border-yellow-300">
          <p>
            This tool is not a diagnostic service. If you are in crisis or thinking about self-harm,
            call your local emergency number immediately or reach your regional hotline.
          </p>
        </div>
        <header className="w-full border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold">MindSupport</Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/chat">Talk now</Link>
              <Link href="/screening">Screening</Link>
              <Link href="/journal">Journal</Link>
              <Link href="/counselors">Counselors</Link>
              <Link href="/resources">Resources</Link>
              <Link href="/admin" className="opacity-80">Admin</Link>
            </div>
          </nav>
        </header>
        <main className="max-w-6xl mx-auto w-full px-4 py-6">{children}</main>
        <footer className="w-full border-t border-black/10 dark:border-white/10 py-6 text-sm">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} MindSupport</span>
            <div className="opacity-80">
              Use of this app implies consent to our safety and data policies.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
