import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
        <AuthProvider>
          <PresenceProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
