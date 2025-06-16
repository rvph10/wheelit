/**
 * Type definitions for Vibration API
 * Extends the Navigator interface with vibrate method support
 */

declare global {
  interface Navigator {
    /**
     * Vibrates the device for the specified duration or pattern
     * @param pattern - Duration in milliseconds or pattern array [vibrate, pause, vibrate, ...]
     * @returns boolean indicating if vibration was successfully initiated
     */
    vibrate(pattern: number | number[]): boolean;
  }
}

export {}; 