/**
 * Haptic feedback utility for mobile devices
 * Provides vibration feedback when wheel spinning completes
 */

/**
 * Checks if the device supports haptic feedback
 * @returns boolean indicating if vibration is supported
 */
export const isHapticSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * Triggers haptic feedback with different patterns for various events
 * @param pattern - Vibration pattern or duration
 */
export const triggerHapticFeedback = (pattern: number | number[] = 200): void => {
  if (!isHapticSupported()) {
    console.log('Haptic feedback not supported on this device');
    return;
  }

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.warn('Failed to trigger haptic feedback:', error);
  }
};

/**
 * Predefined haptic patterns for different wheel events
 */
export const HapticPatterns = {
  // Light tap for wheel start
  WHEEL_START: 50,
  
  // Medium vibration for wheel stop
  WHEEL_STOP: 200,
  
  // Strong vibration pattern for winner selection
  WINNER_SELECTED: [100, 50, 100],
  
  // Triple tap for multiple selections
  MULTIPLE_SELECTION: [80, 50, 80, 50, 80],
  
  // Success pattern for team creation
  TEAM_CREATED: [50, 30, 50, 30, 100],
  
  // Error pattern (if needed)
  ERROR: [200, 100, 200],
} as const;

/**
 * Convenient methods for common wheel events
 */
export const wheelHaptics = {
  /**
   * Light haptic feedback when wheel starts spinning
   */
  onSpinStart: () => triggerHapticFeedback(HapticPatterns.WHEEL_START),
  
  /**
   * Medium haptic feedback when wheel stops spinning
   */
  onSpinStop: () => triggerHapticFeedback(HapticPatterns.WHEEL_STOP),
  
  /**
   * Strong haptic feedback when winner is selected and revealed
   */
  onWinnerSelected: () => triggerHapticFeedback(HapticPatterns.WINNER_SELECTED),
  
  /**
   * Pattern haptic feedback for multiple item selection
   */
  onMultipleSelection: () => triggerHapticFeedback(HapticPatterns.MULTIPLE_SELECTION),
  
  /**
   * Success haptic feedback for team creation
   */
  onTeamCreated: () => triggerHapticFeedback(HapticPatterns.TEAM_CREATED),
};