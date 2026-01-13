import type { Metadata } from "next";
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
  title: "Smart Hotel | Premium Management",
  description: "Next-Gen Hotel Management Platform",
};

import { AuthProvider } from "@/context/AuthContext";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { ChatWidget } from "@/components/ChatWidget";

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
          <AtmosphericBackground />
          {children}
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
