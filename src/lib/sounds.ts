/**
 * Sound effects utility for wheel interactions
 * Provides audio feedback for different wheel events and user interactions
 */

import { generateAllSounds } from './generateSounds';

/**
 * Audio context for managing sound effects
 * Using Web Audio API for better performance and control
 */
class SoundManager {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private isEnabled: boolean = true;
  private volume: number = 0.5;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeAudioContext();
  }

  /**
   * Initialize the audio context (lazy initialization)
   */
  private async initializeAudioContext(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Type declaration for webkit audio context
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Generate and load all sound effects programmatically
   */
  async generateSounds(): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
      if (!this.audioContext) return;
    }

    try {
      const sounds = await generateAllSounds(this.audioContext);
      this.audioBuffers = sounds;
      this.isInitialized = true;
      console.log('Sound effects generated successfully');
    } catch (error) {
      console.warn('Failed to generate sound effects:', error);
    }
  }

  /**
   * Load an audio file and store it in the buffer (legacy method for custom sounds)
   * @param name - The name/key for the sound
   * @param url - The URL of the audio file
   */
  async loadSound(name: string, url: string): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
      if (!this.audioContext) return;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(name, audioBuffer);
    } catch (error) {
      console.warn(`Failed to load sound ${name}:`, error);
    }
  }

  /**
   * Play a sound by name
   * @param name - The name of the sound to play
   * @param options - Playback options
   */
  async playSound(
    name: string, 
    options: { 
      volume?: number; 
      playbackRate?: number; 
      loop?: boolean 
    } = {}
  ): Promise<void> {
    if (!this.isEnabled || !this.audioContext || !this.audioBuffers.has(name)) {
      return;
    }

    // Resume audio context if it's suspended (required for user interaction)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    try {
      const buffer = this.audioBuffers.get(name)!;
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      source.playbackRate.value = options.playbackRate || 1.0;
      source.loop = options.loop || false;

      gainNode.gain.value = (options.volume || this.volume) * this.volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
    } catch (error) {
      console.warn(`Failed to play sound ${name}:`, error);
    }
  }

  /**
   * Set the global volume for all sounds
   * @param volume - Volume level between 0 and 1
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Enable or disable sound effects
   * @param enabled - Whether to enable sound effects
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if sound effects are enabled
   * @returns boolean indicating if sound effects are enabled
   */
  isAudioEnabled(): boolean {
    return this.isEnabled && this.audioContext !== null;
  }
}

// Global sound manager instance
const soundManager = new SoundManager();

/**
 * Predefined sound effect names and configurations
 */
export const SoundEffects = {
  // UI interaction sounds
  BUTTON_CLICK: 'button-click',
  BUTTON_HOVER: 'button-hover',
  MODAL_OPEN: 'modal-open',
  MODAL_CLOSE: 'modal-close',
  
  // Wheel spinning sounds
  WHEEL_START: 'wheel-start',
  WHEEL_SPINNING: 'wheel-spinning',
  WHEEL_STOP: 'wheel-stop',
  WHEEL_TICK: 'wheel-tick',
  
  // Selection and result sounds
  ITEM_SELECT: 'item-select',
  WINNER_REVEALED: 'winner-revealed',
  MULTIPLE_SELECT: 'multiple-select',
  TEAM_CREATED: 'team-created',
  
  // Feedback sounds
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  
  // Item management sounds
  ITEM_ADD: 'item-add',
  ITEM_REMOVE: 'item-remove',
  
  // Mode change sounds
  MODE_CHANGE: 'mode-change',
} as const;

/**
 * Sound effect configurations with volume and playback settings
 */
export const SoundConfigs = {
  [SoundEffects.BUTTON_CLICK]: { volume: 0.3, playbackRate: 1.0 },
  [SoundEffects.BUTTON_HOVER]: { volume: 0.1, playbackRate: 1.2 },
  [SoundEffects.MODAL_OPEN]: { volume: 0.4, playbackRate: 1.0 },
  [SoundEffects.MODAL_CLOSE]: { volume: 0.3, playbackRate: 1.0 },
  
  [SoundEffects.WHEEL_START]: { volume: 0.5, playbackRate: 1.0 },
  [SoundEffects.WHEEL_SPINNING]: { volume: 0.3, playbackRate: 1.0, loop: true },
  [SoundEffects.WHEEL_STOP]: { volume: 0.6, playbackRate: 1.0 },
  [SoundEffects.WHEEL_TICK]: { volume: 0.2, playbackRate: 1.0 },
  
  [SoundEffects.ITEM_SELECT]: { volume: 0.4, playbackRate: 1.1 },
  [SoundEffects.WINNER_REVEALED]: { volume: 0.8, playbackRate: 1.0 },
  [SoundEffects.MULTIPLE_SELECT]: { volume: 0.5, playbackRate: 1.0 },
  [SoundEffects.TEAM_CREATED]: { volume: 0.6, playbackRate: 1.0 },
  
  [SoundEffects.SUCCESS]: { volume: 0.5, playbackRate: 1.0 },
  [SoundEffects.ERROR]: { volume: 0.4, playbackRate: 0.8 },
  [SoundEffects.WARNING]: { volume: 0.4, playbackRate: 0.9 },
  
  [SoundEffects.ITEM_ADD]: { volume: 0.3, playbackRate: 1.2 },
  [SoundEffects.ITEM_REMOVE]: { volume: 0.3, playbackRate: 0.8 },
  
  [SoundEffects.MODE_CHANGE]: { volume: 0.4, playbackRate: 1.0 },
} as const;

/**
 * Initialize all sound effects
 * Should be called once during app initialization
 */
export const initializeSounds = async (): Promise<void> => {
  try {
    await soundManager.generateSounds();
    console.log('Sound effects initialized successfully');
  } catch (error) {
    console.warn('Some sound effects failed to load:', error);
  }
};

/**
 * Play a sound effect with predefined configuration
 * @param soundName - The name of the sound effect to play
 * @param customOptions - Optional custom playback options
 */
export const playSound = async (
  soundName: string,
  customOptions?: { volume?: number; playbackRate?: number; loop?: boolean }
): Promise<void> => {
  const config = SoundConfigs[soundName as keyof typeof SoundConfigs];
  const options = { ...config, ...customOptions };
  await soundManager.playSound(soundName, options);
};

/**
 * Convenient methods for common wheel sound events
 * Similar to wheelHaptics but for audio feedback
 */
export const wheelSounds = {
  /**
   * Play sound when wheel starts spinning
   */
  onSpinStart: async () => {
    await playSound('wheel-start');
  },

  /**
   * Play continuous spinning sound (looped)
   */
  onSpinning: async () => {
    await playSound('wheel-spinning');
  },

  /**
   * Play sound when wheel stops spinning
   */
  onSpinStop: async () => {
    await playSound('wheel-stop');
  },

  /**
   * Play winner reveal sound with celebration effect
   */
  onWinnerRevealed: async () => {
    await playSound('winner-revealed');
  },

  /**
   * Play sound for multiple item selection
   */
  onMultipleSelection: async () => {
    await playSound('multiple-select');
  },

  /**
   * Play sound when teams are created
   */
  onTeamCreated: async () => {
    await playSound('team-created');
  },
};

/**
 * UI interaction sounds
 */
export const uiSounds = {
  /**
   * Play button click sound
   */
  onButtonClick: async () => {
    await playSound('button-click');
  },

  /**
   * Play button hover sound
   */
  onButtonHover: async () => {
    await playSound('button-hover');
  },

  /**
   * Play modal open sound
   */
  onModalOpen: async () => {
    await playSound('modal-open');
  },

  /**
   * Play modal close sound
   */
  onModalClose: async () => {
    await playSound('modal-close');
  },

  /**
   * Play item addition sound
   */
  onItemAdd: async () => {
    await playSound('item-add');
  },

  /**
   * Play item removal sound
   */
  onItemRemove: async () => {
    await playSound('item-remove');
  },

  /**
   * Play mode change sound
   */
  onModeChange: async () => {
    await playSound('mode-change');
  },

  /**
   * Play success feedback sound
   */
  onSuccess: async () => {
    await playSound('success');
  },

  /**
   * Play error feedback sound
   */
  onError: async () => {
    await playSound('error');
  },
};

/**
 * Global sound settings
 */
export const soundSettings = {
  /**
   * Set the global volume for all sound effects
   * @param volume - Volume level between 0 and 1
   */
  setVolume: (volume: number) => {
    soundManager.setVolume(volume);
  },

  /**
   * Enable or disable all sound effects
   * @param enabled - Whether to enable sound effects
   */
  setEnabled: (enabled: boolean) => {
    soundManager.setEnabled(enabled);
  },

  /**
   * Check if sound effects are currently enabled and supported
   * @returns boolean indicating if sound effects are available
   */
  isEnabled: (): boolean => {
    return soundManager.isAudioEnabled();
  },
};

export default soundManager; 