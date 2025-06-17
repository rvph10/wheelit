"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Button } from "./button";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  isVisible: boolean;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastStyles = {
  success:
    "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
  error:
    "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
  warning:
    "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
};

/**
 * Toast notification component
 * Provides visual feedback for user actions
 */
export const Toast = ({
  message,
  type = "info",
  duration = 4000,
  onClose,
  isVisible,
}: ToastProps) => {
  const [show, setShow] = useState(isVisible);
  const Icon = toastIcons[type];

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose?.(), 300); // Allow animation to complete
  };

  if (!show) return null;

  return (
    <div
      className={`
      fixed top-4 right-4 z-50 max-w-md p-4 border rounded-lg shadow-lg backdrop-blur-sm
      transform transition-all duration-300 ease-in-out
      ${show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      ${toastStyles[type]}
    `}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

/**
 * Hook for managing toast notifications
 */
export const useToast = () => {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    isVisible: boolean;
  } | null>(null);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => (prev ? { ...prev, isVisible: false } : null));
  };

  const ToastComponent = toast ? (
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      onClose={hideToast}
    />
  ) : null;

  return {
    showToast,
    hideToast,
    ToastComponent,
  };
};
