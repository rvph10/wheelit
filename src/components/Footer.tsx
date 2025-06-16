import {
  Github,
  Coffee,
  Sparkles,
  Code2,
  ExternalLink,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";

/**
 * Enhanced Footer component with sophisticated layout and emotional design
 * Features improved visual hierarchy, better spacing, and engaging micro-interactions
 * Balances modern aesthetics with warm, personal touches
 */
export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/30 dark:to-purple-950/20 border-t border-gray-200/60 dark:border-gray-800/60 overflow-hidden">
      {/* Enhanced Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          ></div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 dark:to-black/10"></div>
      </div>

      <div className="relative container mx-auto px-6 py-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Section - Enhanced */}
          <div className="lg:col-span-4 text-center lg:text-left">
            <div className="space-y-6 flex flex-col justify-between">
              {/* Logo & Title */}
              <div className="space-y-3">
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
                    WheelIt
                  </h3>
                </div>

                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-sm mx-auto lg:mx-0">
                  Spinning innovation into reality, one project at a time
                </p>
              </div>
              {/* Stats or Features */}
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Active Development</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span>v1.0.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social & Actions - Centered */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-8">
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
              <Button
                variant="outline"
                size="lg"
                className="group flex-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 border-gray-200 dark:border-gray-700 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600"
                asChild
              >
                <a
                  href="https://github.com/rvph10/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit rvph's GitHub profile"
                >
                  <Github className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-medium">Explore Code</span>
                </a>
              </Button>

              <Button
                size="lg"
                className="group flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden"
                asChild
              >
                <a
                  href="https://buymeacoffee.com/rvph"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Support rvph on Buy Me a Coffee"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 animate-pulse"></div>
                  <Coffee className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
                  <span className="font-medium relative z-10">
                    Buy me a coffee
                  </span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:animate-pulse"></div>
                </a>
              </Button>
            </div>
          </div>

          {/* Company Section - Enhanced */}
          <div className="lg:col-span-4 text-center lg:text-right">
            <div className="space-y-6">
              {/* Company Badge */}
              <div className="inline-flex flex-col items-center lg:items-end space-y-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-full border border-blue-200/50 dark:border-blue-800/50">
                  <Code2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Founder & Dream Architect
                  </span>
                </div>

                <a
                  href="https://upintown.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-700/60 hover:border-purple-300/60 dark:hover:border-purple-600/60 transition-all duration-500 hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:via-blue-600 group-hover:to-purple-800 transition-all duration-300">
                      UpInTown
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                      upintown.dev
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full group-hover:scale-150 transition-transform duration-300 delay-100"></div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="mt-6 pt-8 border-t border-gradient-to-r from-blue-200/50 via-purple-200/50 to-pink-200/50 dark:border-gray-800/70">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} WheelIt
              </p>
            </div>

            {/* Status & Version Info */}
            <div className="flex items-center gap-6 text-sm text-gray-400 dark:text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                <span>Always evolving</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Innovation driven</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>Performance focused</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
