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
  title: "Steam Item Tracker",
  description: "Track and monitor your Steam items' prices and market trends in real-time",
  keywords: ["Steam", "Item Tracker", "Market Prices", "Steam Market", "Price Monitoring", "Gaming Items"],
  authors: [{ name: "Steam Item Tracker Team" }],
  openGraph: {
    title: "Steam Item Tracker",
    description: "Track and monitor your Steam items' prices and market trends in real-time",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Steam Item Tracker",
    description: "Track and monitor your Steam items' prices and market trends in real-time",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "noindex, nofollow",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
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
