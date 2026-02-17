import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXTAUTH_URL || "https://lumierejewels.com";

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lumière Jewels — Exquisite Handcrafted Jewelry",
    template: "%s | Lumière Jewels",
  },
  description:
    "Discover exquisite handcrafted jewelry — from dazzling diamond rings to elegant gold necklaces. Premium quality, transparent pricing, certified gemstones.",
  keywords: [
    "jewelry",
    "gold jewelry",
    "diamond rings",
    "necklaces",
    "earrings",
    "bracelets",
    "handcrafted jewelry",
    "luxury jewelry",
    "Indian jewelry",
    "BIS hallmark",
    "certified gemstones",
    "22K gold",
    "platinum jewelry",
    "bridal jewelry",
    "engagement rings",
  ],
  authors: [{ name: "Lumière Jewels" }],
  creator: "Lumière Jewels",
  publisher: "Lumière Jewels",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Lumière Jewels",
    title: "Lumière Jewels — Exquisite Handcrafted Jewelry",
    description:
      "Discover exquisite handcrafted jewelry with transparent pricing and certified gemstones.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumière Jewels — Exquisite Handcrafted Jewelry",
    description:
      "Discover exquisite handcrafted jewelry with transparent pricing and certified gemstones.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
