import type { Metadata, Viewport } from "next";
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
  title: "Money Tracker",
  description: "Monitor keuangan Anda dengan mudah",
  manifest: "/manifest.json", // Tambahkan baris ini
  icons: {
    icon: "/next.svg", // Arahkan ke file yang ada di folder public
    apple: "/next.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb", // Biru sesuai dashboard kita
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
        {children}
      </body>
    </html>
  );
}
