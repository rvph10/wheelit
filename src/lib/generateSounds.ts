/**
 * Sound generation utility for creating programmatic audio effects
 * Uses Web Audio API to generate sounds without requiring audio files
 */

/**
 * Generate a simple tone sound effect
 * @param context - Audio context
 * @param frequency - Frequency in Hz
 * @param duration - Duration in seconds
 * @param type - Oscillator type
 * @param volume - Volume level (0-1)
 * @returns Promise<AudioBuffer>
 */
export const generateTone = async (
  context: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.5
): Promise<AudioBuffer> => {
  const sampleRate = context.sampleRate;
  const bufferLength = sampleRate * duration;
  const buffer = context.createBuffer(1, bufferLength, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferLength; i++) {
    const time = i / sampleRate;
    let sample = 0;

    switch (type) {
      case 'sine':
        sample = Math.sin(2 * Math.PI * frequency * time);
        break;
      case 'square':
        sample = Math.sin(2 * Math.PI * frequency * time) > 0 ? 1 : -1;
        break;
      case 'triangle':
        sample = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * time));
        break;
      case 'sawtooth':
        sample = 2 * (frequency * time - Math.floor(frequency * time + 0.5));
        break;
    }

    // Apply envelope (fade in/out) to prevent clicks
    const fadeTime = 0.01; // 10ms fade
    const fadeLength = fadeTime * sampleRate;
    
    if (i < fadeLength) {
      sample *= i / fadeLength; // Fade in
    } else if (i > bufferLength - fadeLength) {
      sample *= (bufferLength - i) / fadeLength; // Fade out
    }

    data[i] = sample * volume;
  }

  return buffer;
};

/**
 * Generate a multi-tone sound effect (chord)
 * @param context - Audio context
 * @param frequencies - Array of frequencies in Hz
 * @param duration - Duration in seconds
 * @param volume - Volume level (0-1)
 * @returns Promise<AudioBuffer>
 */
export const generateChord = async (
  context: AudioContext,
  frequencies: number[],
  duration: number,
  volume: number = 0.5
): Promise<AudioBuffer> => {
  const sampleRate = context.sampleRate;
  const bufferLength = sampleRate * duration;
  const buffer = context.createBuffer(1, bufferLength, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferLength; i++) {
    const time = i / sampleRate;
    let sample = 0;

    // Sum all frequencies
    frequencies.forEach(freq => {
      sample += Math.sin(2 * Math.PI * freq * time);
    });

    // Normalize by number of frequencies
    sample /= frequencies.length;

    // Apply envelope
    const fadeTime = 0.01;
    const fadeLength = fadeTime * sampleRate;
    
    if (i < fadeLength) {
      sample *= i / fadeLength;
    } else if (i > bufferLength - fadeLength) {
      sample *= (bufferLength - i) / fadeLength;
    }

    data[i] = sample * volume;
  }

  return buffer;
};

/**
 * Generate a sweep sound effect (frequency changes over time)
 * @param context - Audio context
 * @param startFreq - Starting frequency in Hz
 * @param endFreq - Ending frequency in Hz
 * @param duration - Duration in seconds
 * @param volume - Volume level (0-1)
 * @returns Promise<AudioBuffer>
 */
export const generateSweep = async (
  context: AudioContext,
  startFreq: number,
  endFreq: number,
  duration: number,
  volume: number = 0.5
): Promise<AudioBuffer> => {
  const sampleRate = context.sampleRate;
  const bufferLength = sampleRate * duration;
  const buffer = context.createBuffer(1, bufferLength, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferLength; i++) {
    const time = i / sampleRate;
    const progress = time / duration;
    
    // Linear interpolation between start and end frequency
    const frequency = startFreq + (endFreq - startFreq) * progress;
    
    let sample = Math.sin(2 * Math.PI * frequency * time);

    // Apply envelope
    const fadeTime = 0.01;
    const fadeLength = fadeTime * sampleRate;
    
    if (i < fadeLength) {
      sample *= i / fadeLength;
    } else if (i > bufferLength - fadeLength) {
      sample *= (bufferLength - i) / fadeLength;
    }

    data[i] = sample * volume;
  }

  return buffer;
};

/**
 * Generate noise burst sound effect
 * @param context - Audio context
 * @param duration - Duration in seconds
 * @param filterFreq - Low-pass filter frequency
 * @param volume - Volume level (0-1)
 * @returns Promise<AudioBuffer>
 */
export const generateNoise = async (
  context: AudioContext,
  duration: number,
  filterFreq: number = 1000,
  volume: number = 0.3
): Promise<AudioBuffer> => {
  const sampleRate = context.sampleRate;
  const bufferLength = sampleRate * duration;
  const buffer = context.createBuffer(1, bufferLength, sampleRate);
  const data = buffer.getChannelData(0);

  // Simple low-pass filter state
  let filterState = 0;
  const filterAlpha = filterFreq / (filterFreq + sampleRate);

  for (let i = 0; i < bufferLength; i++) {
    // Generate white noise
    let sample = (Math.random() * 2 - 1);
    
    // Apply simple low-pass filter
    filterState = filterState + filterAlpha * (sample - filterState);
    sample = filterState;

    // Apply envelope
    const fadeTime = 0.005; // Shorter fade for noise
    const fadeLength = fadeTime * sampleRate;
    
    if (i < fadeLength) {
      sample *= i / fadeLength;
    } else if (i > bufferLength - fadeLength) {
      sample *= (bufferLength - i) / fadeLength;
    }

    data[i] = sample * volume;
  }

  return buffer;
};

/**
 * Sound effect recipes for different wheel events
 */
export const SoundRecipes = {
  // UI sounds
  'button-click': (context: AudioContext) => 
    generateTone(context, 800, 0.1, 'sine', 0.3),
    
  'button-hover': (context: AudioContext) => 
    generateTone(context, 600, 0.05, 'sine', 0.1),
    
  'modal-open': (context: AudioContext) => 
    generateChord(context, [440, 554, 659], 0.3, 0.4),
    
  'modal-close': (context: AudioContext) => 
    generateSweep(context, 659, 440, 0.2, 0.3),

  // Wheel sounds
  'wheel-start': (context: AudioContext) => 
    generateSweep(context, 200, 400, 0.3, 0.5),
    
  'wheel-spinning': (context: AudioContext) => 
    generateTone(context, 300, 1.0, 'square', 0.2),
    
  'wheel-stop': (context: AudioContext) => 
    generateSweep(context, 400, 200, 0.5, 0.6),
    
  'wheel-tick': (context: AudioContext) => 
    generateTone(context, 1000, 0.05, 'square', 0.2),

  // Selection sounds
  'item-select': (context: AudioContext) => 
    generateTone(context, 660, 0.15, 'sine', 0.4),
    
  'winner-revealed': (context: AudioContext) => 
    generateChord(context, [523, 659, 784, 1047], 0.8, 0.8),
    
  'multiple-select': (context: AudioContext) => 
    generateChord(context, [440, 554, 659], 0.4, 0.5),
    
  'team-created': (context: AudioContext) => 
    generateChord(context, [392, 494, 587], 0.6, 0.6),

  // Feedback sounds
  'success': (context: AudioContext) => 
    generateChord(context, [523, 659, 784], 0.5, 0.5),
    
  'error': (context: AudioContext) => 
    generateTone(context, 220, 0.4, 'square', 0.4),
    
  'warning': (context: AudioContext) => 
    generateTone(context, 440, 0.3, 'triangle', 0.4),

  // Item management sounds
  'item-add': (context: AudioContext) => 
    generateSweep(context, 440, 880, 0.2, 0.3),
    
  'item-remove': (context: AudioContext) => 
    generateSweep(context, 880, 440, 0.2, 0.3),

  // Mode change sound
  'mode-change': (context: AudioContext) => 
    generateChord(context, [349, 440, 523], 0.4, 0.4),
} as const;

/**
 * Generate all sound effects and return them as a map
 * @param context - Audio context
 * @returns Promise<Map<string, AudioBuffer>>
 */
export const generateAllSounds = async (context: AudioContext): Promise<Map<string, AudioBuffer>> => {
  const soundMap = new Map<string, AudioBuffer>();
  
  const generatePromises = Object.entries(SoundRecipes).map(async ([name, recipe]) => {
    try {
      const buffer = await recipe(context);
      soundMap.set(name, buffer);
    } catch (error) {
      console.warn(`Failed to generate sound ${name}:`, error);
    }
  });

  await Promise.all(generatePromises);
  return soundMap;
}; 