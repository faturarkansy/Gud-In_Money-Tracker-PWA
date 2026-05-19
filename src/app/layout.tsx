import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import OrientationGuard from "@/components/OrientationGuard"; // Jalankan detektor terpisah

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Money Tracker",
  description: "Monitor keuangan Anda dengan mudah",
  manifest: "/manifest.json",
  icons: {
    icon: "/next.svg",
    apple: "/next.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}

        {/* Panggil pelindung orientasi di sini */}
        <OrientationGuard />
      </body>
    </html>
  );
}
