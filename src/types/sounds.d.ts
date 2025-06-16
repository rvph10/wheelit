/**
 * Type definitions for Web Audio API and sound effects
 * Extends global interfaces for sound management
 */

declare global {
  interface Window {
    /**
     * Safari webkit audio context support
     */
    webkitAudioContext?: typeof AudioContext;
  }
}

/**
 * Sound effect configurations interface
 */
export interface SoundConfig {
  volume: number;
  playbackRate: number;
  loop?: boolean;
}

/**
 * Sound effect types for wheel interactions
 */
export type WheelSoundType = 
  | 'wheel-start'
  | 'wheel-spinning'
  | 'wheel-stop'
  | 'wheel-tick'
  | 'winner-revealed'
  | 'multiple-select'
  | 'team-created';

/**
 * UI sound effect types
 */
export type UISoundType = 
  | 'button-click'
  | 'button-hover'
  | 'modal-open'
  | 'modal-close'
  | 'item-add'
  | 'item-remove'
  | 'mode-change'
  | 'success'
  | 'error'
  | 'warning'
  | 'item-select';

/**
 * All available sound effect types
 */
export type SoundEffectType = WheelSoundType | UISoundType;

/**
 * Sound manager interface for managing audio playback
 */
export interface ISoundManager {
  generateSounds(): Promise<void>;
  loadSound(name: string, url: string): Promise<void>;
  playSound(name: string, options?: Partial<SoundConfig>): Promise<void>;
  setVolume(volume: number): void;
  setEnabled(enabled: boolean): void;
  isAudioEnabled(): boolean;
}

export {}; 