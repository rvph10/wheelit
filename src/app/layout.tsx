import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
    default: "WheelIt - Interactive Decision Wheel & Team Randomizer",
    template: "%s | WheelIt",
  },
  description:
    "Make decisions fun with WheelIt! Create custom spinning wheels, randomize team selections, and engage your audience with our interactive decision-making tool. Perfect for games, team building, and quick choices.",
  keywords: [
    "decision wheel",
    "random picker",
    "spinner",
    "randomizer",
    "team selector",
    "interactive wheel",
    "decision maker",
    "random picker",
    "wheel of fortune",
    "team building",
    "games",
  ],
  authors: [{ name: "WheelIt Team" }],
  creator: "WheelIt",
  publisher: "WheelIt",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wheelit.app",
    siteName: "WheelIt",
    title: "WheelIt - Make Decisions Fun with Interactive Spinning Wheels",
    description:
      "Create custom spinning wheels and randomize team selections. Perfect for games, team building, and decision making. Start spinning now!",
    images: [
      {
        url: "/api/og?title=WheelIt&subtitle=Make%20Decisions%20Fun%20with%20Interactive%20Spinning%20Wheels",
        width: 1200,
        height: 630,
        alt: "WheelIt Interactive Decision Wheel Interface",
      },
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WheelIt - Interactive Decision Wheel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@wheelit",
    creator: "@wheelit",
    title: "WheelIt - Interactive Decision Wheel & Team Randomizer",
    description:
      "Make decisions fun with custom spinning wheels. Perfect for teams, games, and quick choices!",
    images: [
      "/api/og?title=WheelIt&subtitle=Make%20Decisions%20Fun%20with%20Interactive%20Spinning%20Wheels",
    ],
  },
  alternates: {
    canonical: "https://wheelit.app",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: "technology",
  classification: "Interactive Tools",
  metadataBase: new URL("https://wheelit.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "WheelIt",
              description:
                "Interactive decision wheel and team randomizer tool for making choices fun and engaging.",
              url: "https://wheelit.app",
              applicationCategory: "UtilityApplication",
              operatingSystem: "Web",
              browserRequirements: "Requires JavaScript enabled",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              creator: {
                "@type": "Organization",
                name: "WheelIt Team",
              },
              featureList: [
                "Custom wheel creation",
                "Team randomization",
                "Interactive spinning animation",
                "Responsive design",
                "Real-time results",
              ],
            }),
          }}
        />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://vitals.vercel-analytics.com" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />

        {/* Apple touch icon and favicon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="360x360"
          href="/apple-touch-icon@2x.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="540x540"
          href="/apple-touch-icon@3x.png"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <main className="flex-grow">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
