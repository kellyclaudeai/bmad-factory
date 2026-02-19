import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PerformanceDashboard } from "@/components/monitoring/PerformanceDashboard";
import { PerformanceMonitoringProvider } from "@/components/providers/PerformanceMonitoringProvider";
import { PresenceProvider } from "@/components/providers/PresenceProvider";
import { AuthProvider } from "@/lib/contexts/AuthContext";
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
  title: "SlackLite",
  description: "SlackLite foundation app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <PerformanceMonitoringProvider />
          <AuthProvider>
            <PresenceProvider />
            {children}
          </AuthProvider>
        </ErrorBoundary>
        <PerformanceDashboard />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
