/**
 * Locale utilities to handle missing RNLocalize module
 * This provides fallback functionality when the native module isn't available
 */

// Get device locale safely
export const getDeviceLocale = (): string => {
  try {
    // Try to use the browser locale if available (for web)
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language;
    }
    
    // Default fallback
    return 'en-US';
  } catch (error) {
    console.warn('Failed to get device locale, falling back to English', error);
    return 'en-US';
  }
};

// Format date according to locale
export const formatDate = (date: Date): string => {
  try {
    return date.toLocaleDateString(getDeviceLocale(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.warn('Error formatting date, using default format', error);
    return date.toLocaleDateString('en-US');
  }
};

// Format time according to locale
export const formatTime = (date: Date): string => {
  try {
    return date.toLocaleTimeString(getDeviceLocale(), {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('Error formatting time, using default format', error);
    return date.toLocaleTimeString('en-US');
  }
};

// Format number according to locale
export const formatNumber = (num: number): string => {
  try {
    return num.toLocaleString(getDeviceLocale());
  } catch (error) {
    console.warn('Error formatting number, using default format', error);
    return num.toLocaleString('en-US');
  }
};
