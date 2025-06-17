"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, AlertTriangle, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error boundary component to catch and handle JavaScript errors
 * Provides a user-friendly error interface with recovery options
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // You could also log to an error reporting service here
    // errorReportingService.logError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleClearStorage = () => {
    try {
      localStorage.clear();
      this.handleRetry();
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl text-gray-800 dark:text-gray-200">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                We encountered an unexpected error. Don&apos;t worry, your data
                is safe!
              </p>

              {/* Error details in development */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="whitespace-pre-wrap text-red-600 dark:text-red-400">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>

                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Home
                </Button>

                <Button
                  variant="ghost"
                  onClick={this.handleClearStorage}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear Saved Data & Retry
                </Button>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                If the problem persists, try refreshing the page or clearing
                your browser cache.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
