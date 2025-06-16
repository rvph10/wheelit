/**
 * Wheel Types - Shared type definitions for wheel functionality
 * Contains all interfaces and types used across wheel components
 */

export type WheelMode = "simple" | "teams" | "weighted" | "multiple";

export interface WheelItem {
  id: string;
  name: string;
  weight?: number;
  color?: string;
}

export interface WheelConfig {
  mode: WheelMode;
  items: WheelItem[];
  teamCount?: number;
  selectCount?: number;
  removeAfterSpin?: boolean;
}

export interface SpinResult {
  type: "simple" | "teams" | "weighted" | "multiple";
  selectedItems?: WheelItem[];
  teams?: WheelItem[][];
  timestamp: number;
  position?: number; // Position when removeAfterSpin is enabled
} 