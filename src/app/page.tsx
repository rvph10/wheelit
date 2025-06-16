import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title:
    "WheelIt - Interactive Decision Wheel & Team Randomizer | Make Choices Fun",
  description:
    "Create custom spinning wheels, randomize team selections, and make decisions fun with WheelIt. Perfect for games, team building, presentations, and quick choices. No signup required!",
  keywords: [
    "decision wheel",
    "spinner tool",
    "random picker",
    "team randomizer",
    "wheel of fortune",
    "decision maker",
    "interactive spinner",
    "team building tool",
    "random selector",
    "choice wheel",
  ],
  openGraph: {
    title: "WheelIt - Make Decisions Fun with Interactive Spinning Wheels",
    description:
      "Create custom spinning wheels and randomize team selections. Perfect for games, team building, and decision making. Start spinning now!",
    url: "https://wheelit.app",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WheelIt Interactive Decision Wheel Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WheelIt - Interactive Decision Wheel & Team Randomizer",
    description:
      "Make decisions fun with custom spinning wheels. Perfect for teams, games, and quick choices!",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://wheelit.app",
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
};

/**
 * Home page for WheelIt - Interactive Decision Wheel Application
 *
 * This page serves as the main landing page featuring:
 * - Hero section with animated elements
 * - Feature highlights
 * - Call-to-action for users to start using the spinner
 *
 * @returns JSX element containing the home page content
 */
export default function Home() {
  return (
    <>
      {/* SEO-friendly content that's indexable */}
      <div className="sr-only">
        <h1>WheelIt - Interactive Decision Wheel and Team Randomizer</h1>
        <p>
          Make decisions effortlessly with our interactive spinning wheel
          application. Perfect for team building, games, presentations, and
          everyday choices. Create custom wheels with your own options,
          randomize team selections, and engage your audience with beautiful
          animations.
        </p>

        <h2>Key Features:</h2>
        <ul>
          <li>Custom spinning wheels with your own options</li>
          <li>Team randomization and group creation</li>
          <li>Beautiful animations and interactive design</li>
          <li>No registration required - start immediately</li>
          <li>Mobile-friendly responsive design</li>
          <li>Privacy-focused - no data collection</li>
        </ul>

        <h2>Perfect for:</h2>
        <ul>
          <li>Team building activities and icebreakers</li>
          <li>Classroom activities and educational games</li>
          <li>Business presentations and decision making</li>
          <li>Party games and entertainment</li>
          <li>Random selections and fair choices</li>
          <li>Group formations and team assignments</li>
        </ul>
      </div>

      {/* Interactive client component */}
      <HomeClient />
    </>
  );
}
