import * as Localization from 'expo-localization';

export const getSafeLocale = () => {
  try {
    return Localization.locale || 'en-US';
  } catch (error) {
    console.warn('Failed to get locale:', error);
    return 'en-US';
  }
};

export const isRTL = () => {
  try {
    return Localization.isRTL;
  } catch {
    return false;
  }
};
