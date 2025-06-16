import type { Metadata } from "next";
import SetupClient from "@/components/SetupClient";

export const metadata: Metadata = {
  title: "Setup Your Wheel | WheelIt - Configure Spinner Options",
  description:
    "Configure your custom spinning wheel with multiple modes: simple picks, team creation, weighted choices, and multiple selections. Set up your options and start spinning!",
  keywords: [
    "wheel setup",
    "spinner configuration",
    "custom wheel",
    "team randomizer setup",
    "weighted spinner",
    "multiple choice wheel",
    "wheel options",
    "random picker setup",
  ],
  openGraph: {
    title: "Setup Your Custom Spinning Wheel | WheelIt",
    description:
      "Configure your spinning wheel with custom options, team modes, weighted choices and more. Perfect for decision making and team building.",
    url: "https://wheelit.app/setup",
    type: "website",
    images: [
      {
        url: "/api/og?title=Setup%20Your%20Wheel&subtitle=Configure%20custom%20options%20and%20modes&theme=default",
        width: 1200,
        height: 630,
        alt: "WheelIt Setup Configuration Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Setup Your Custom Spinning Wheel | WheelIt",
    description:
      "Configure your spinning wheel with custom options, team modes, and weighted choices.",
    images: [
      "/api/og?title=Setup%20Your%20Wheel&subtitle=Configure%20custom%20options%20and%20modes&theme=default",
    ],
  },
  alternates: {
    canonical: "https://wheelit.app/setup",
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
 * Setup page for configuring wheel options and modes
 *
 * This page allows users to:
 * - Choose between different wheel modes (simple, teams, weighted, multiple)
 * - Add and configure wheel items
 * - Set percentages for weighted mode
 * - Configure team counts and selection options
 *
 * @returns JSX element containing the setup page content
 */
export default function SetupPage() {
  return (
    <>
      {/* SEO-friendly content for search engines */}
      <div className="sr-only">
        <h1>Setup Your Custom Spinning Wheel - WheelIt Configuration</h1>
        <p>
          Configure your spinning wheel with our intuitive setup interface.
          Choose from multiple modes including simple picks, team creation,
          weighted choices, and multiple selections. Perfect for team building,
          games, and decision making.
        </p>

        <h2>Available Wheel Modes:</h2>
        <ul>
          <li>Simple Mode - Pick one random item from your list</li>
          <li>Teams Mode - Create balanced teams automatically</li>
          <li>Weighted Mode - Set custom percentages for each option</li>
          <li>Multiple Mode - Select several items at once</li>
        </ul>

        <h2>Setup Features:</h2>
        <ul>
          <li>Add unlimited items to your wheel</li>
          <li>Edit item names and weights</li>
          <li>Auto-distribute percentages for weighted mode</li>
          <li>Configure team counts and selection quantities</li>
          <li>Real-time validation and feedback</li>
          <li>Save configurations automatically</li>
                </ul>

        <h2>Perfect for:</h2>
        <ul>
          <li>Team formation and group activities</li>
          <li>Classroom randomization and games</li>
          <li>Business decision making and presentations</li>
          <li>Event planning and activity selection</li>
          <li>Fair distribution and random assignments</li>
                </ul>
      </div>

      {/* Interactive setup component */}
      <SetupClient />
    </>
  );
}
