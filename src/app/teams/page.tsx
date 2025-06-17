"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ShareExportModal from "@/components/ShareExportModal";
import {
  ArrowLeft,
  RotateCcw,
  Share,
  Users,
  Sparkles,
  Shuffle,
  Trophy,
} from "lucide-react";

interface WheelItem {
  id: string;
  name: string;
  weight?: number;
  color?: string;
  locked?: boolean; // Add locked property for weight mode
}

// Add team constraint interface
interface TeamConstraint {
  id: string;
  item1Id: string;
  item2Id: string;
  type: "avoid" | "separate";
}

interface WheelConfig {
  mode: "simple" | "teams" | "weighted" | "multiple";
  items: WheelItem[];
  teamCount?: number;
  selectCount?: number;
  removeAfterSpin?: boolean;
  teamConstraints?: TeamConstraint[]; // Add constraints support
}

interface TeamsResult {
  teams: WheelItem[][];
  timestamp: number;
}

interface SpinResult {
  type: "simple" | "teams" | "weighted" | "multiple";
  selectedItems?: WheelItem[];
  teams?: WheelItem[][];
  timestamp: number;
  position?: number;
}

/**
 * Enhanced Teams page component with realistic card shuffling animation
 */
export default function TeamsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<WheelConfig>({
    mode: "teams",
    items: [],
    teamCount: 2,
  });
  const [isShuffling, setIsShuffling] = useState(false);
  const [teams, setTeams] = useState<WheelItem[][]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shuffleHistory, setShuffleHistory] = useState<TeamsResult[]>([]);
  const [showShareExportModal, setShowShareExportModal] = useState(false);
  const [currentResult, setCurrentResult] = useState<SpinResult | null>(null);

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const teamsGridRef = useRef<HTMLDivElement>(null);
  const shuffleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem("wheelit-config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.mode === "teams") {
          setConfig(parsed);
        } else {
          // Redirect to setup if not in teams mode
          router.push("/setup");
          return;
        }
      } catch (error) {
        console.error("Failed to load saved config:", error);
        router.push("/setup");
        return;
      }
    } else {
      router.push("/setup");
      return;
    }

    // Load shuffle history
    const savedHistory = localStorage.getItem("wheelit-teams-history");
    if (savedHistory) {
      try {
        setShuffleHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to load shuffle history:", error);
      }
    }

    // Initial page animation
    const ctx = gsap.context(() => {
      gsap.set(containerRef.current, { opacity: 0, y: 20 });
      gsap.to(containerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    }, containerRef);

    // Capture current ref value for cleanup
    const currentTeamsGrid = teamsGridRef.current;

    return () => {
      ctx.revert();
      // Clean up any remaining team animations
      gsap.killTweensOf(currentTeamsGrid);
      gsap.killTweensOf("[data-member]");
    };
  }, [router]);

  /**
   * Creates balanced teams by shuffling items and distributing them evenly
   */
  const createBalancedTeams = (
    items: WheelItem[],
    teamCount: number
  ): WheelItem[][] => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const teams: WheelItem[][] = Array.from({ length: teamCount }, () => []);

    shuffled.forEach((item, index) => {
      teams[index % teamCount].push(item);
    });

    return teams;
  };

  /**
   * Creates teams and reveals them with staggered animations
   */
  const performTeamCreation = async () => {
    if (isShuffling || config.items.length === 0) return;

    setIsShuffling(true);
    setShowConfetti(false);

    // Kill any existing animations to prevent conflicts
    gsap.killTweensOf(teamsGridRef.current);
    gsap.killTweensOf("[data-member]");

    setTeams([]);

    // Short delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Create balanced teams
    const newTeams = createBalancedTeams(config.items, config.teamCount || 2);
    setTeams(newTeams);

    // Create SpinResult for sharing modal
    const spinResult: SpinResult = {
      type: "teams",
      teams: newTeams,
      timestamp: Date.now(),
    };
    setCurrentResult(spinResult);

    // Save to history
    const result: TeamsResult = {
      teams: newTeams,
      timestamp: Date.now(),
    };

    const newHistory = [result, ...shuffleHistory].slice(0, 10);
    setShuffleHistory(newHistory);
    localStorage.setItem("wheelit-teams-history", JSON.stringify(newHistory));

    setIsShuffling(false);
    setShowConfetti(true);

    // Hide confetti after 3 seconds
    setTimeout(() => setShowConfetti(false), 3000);

    // Simple and smooth teams reveal animation
    gsap.delayedCall(0.1, () => {
      if (teamsGridRef.current) {
        // Animate teams appearance with a clean fade-in
        gsap.fromTo(
          teamsGridRef.current.children,
          {
            opacity: 0,
            y: 30,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            onComplete: () => {
              // Then animate the team members
              const allMemberElements =
                teamsGridRef.current?.querySelectorAll("[data-member]");
              if (allMemberElements) {
                gsap.fromTo(
                  allMemberElements,
                  {
                    opacity: 0,
                    y: 15,
                  },
                  {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: "power2.out",
                  }
                );
              }
            },
          }
        );
      }
    });
  };

  /**
   * Convert TeamsResult history to SpinResult format for sharing modal
   */
  const getSpinHistoryFromTeamsHistory = (): SpinResult[] => {
    return shuffleHistory.map((result) => ({
      type: "teams" as const,
      teams: result.teams,
      timestamp: result.timestamp,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <div ref={containerRef} className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/setup")}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Back to Setup</span>
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 justify-center">
              <Users className="h-8 w-8 text-green-500" />
              Teams Creator
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Create {config.teamCount} balanced teams from{" "}
              {config.items.length} members
            </p>
          </div>

          <div className="flex gap-2">
            <Badge variant="secondary" className="text-sm">
              {config.teamCount} teams
            </Badge>
            <Badge variant="outline" className="text-sm">
              {config.items.length} members
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Cards Pool & Controls */}
          <div className="space-y-6">
            {/* Cards Pool with Deck Center */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[300px]">
                  {/* Member List */}
                  <div className="grid grid-cols-2 gap-3">
                    {config.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-xl text-center font-medium shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="text-gray-800 dark:text-gray-200 font-semibold">
                          {item.name}
                        </div>
                      </div>
                    ))}
                  </div>

                  {config.items.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No team members found. Please go back to setup.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Shuffle Controls */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Button
                    ref={shuffleButtonRef}
                    size="lg"
                    onClick={performTeamCreation}
                    disabled={isShuffling || config.items.length === 0}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-lg px-8 py-6 w-full relative overflow-hidden group"
                  >
                    {/* Button background animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <span className="relative z-10 flex items-center justify-center">
                      {isShuffling ? (
                        <>
                          <RotateCcw className="mr-2 h-5 w-5 animate-spin" />
                          Shuffling Cards...
                        </>
                      ) : (
                        <>
                          <Shuffle className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                          {teams.length > 0
                            ? "Shuffle Again"
                            : "Deal the Cards"}
                        </>
                      )}
                    </span>
                  </Button>

                  {teams.length > 0 && !isShuffling && (
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowShareExportModal(true)}
                        className="flex items-center gap-2 hover:scale-105 transition-transform bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200"
                      >
                        <Share className="h-4 w-4" />
                        Share & Export
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Results */}
            {shuffleHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {shuffleHistory.map((result, index) => (
                      <div
                        key={result.timestamp}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <div className="font-medium">
                          Deal #{shuffleHistory.length - index}:{" "}
                          {result.teams.length} teams
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Teams Result */}
          <div className="space-y-6">
            {teams.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Teams Result
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowShareExportModal(true)}
                      className="ml-auto flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200"
                    >
                      <Share className="h-4 w-4" />
                      Share & Export
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={teamsGridRef} className="space-y-4">
                    {teams.map((team, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300"
                      >
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                          <Users className="h-4 w-4 text-green-500" />
                          Team {index + 1}
                          <Badge variant="secondary" className="ml-auto">
                            {team.length} members
                          </Badge>
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {team.map((member, memberIndex) => (
                            <div
                              key={member.id}
                              data-member
                              className="p-3 bg-white dark:bg-gray-900 rounded-lg border text-center font-medium text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {memberIndex + 1}.
                                </span>
                                <span>{member.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <div className="relative mb-6">
                      <Shuffle className="h-16 w-16 mx-auto opacity-50" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Ready to Deal the Cards!
                    </h3>
                    <p className="text-sm leading-relaxed">
                      Watch as your members get shuffled like a deck of cards
                      and dealt into balanced teams with realistic card
                      animations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Share & Export Modal */}
      <ShareExportModal
        isOpen={showShareExportModal}
        onClose={() => setShowShareExportModal(false)}
        config={config}
        result={currentResult}
        spinHistory={getSpinHistoryFromTeamsHistory()}
      />
    </div>
  );
}
