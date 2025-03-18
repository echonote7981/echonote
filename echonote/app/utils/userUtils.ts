import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { auth, signInAnonymously } from '../config/firebaseConfig';

/**
 * Generates or retrieves a user ID from AsyncStorage
 * This is used for users who don't explicitly log in
 */
export const generateUserId = async () => {
  let userId = await AsyncStorage.getItem('userId');
  if (!userId) {
    userId = uuidv4(); // Generate new UUID
    await AsyncStorage.setItem('userId', userId);
  }
  return userId;
};

/**
 * Authenticates user anonymously with Firebase
 * Returns the Firebase UID which can be used to track user data
 */
export const authenticateUser = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    const userId = userCredential.user.uid;
    console.log("User ID:", userId);
    return userId;
  } catch (error) {
    console.error("Authentication Failed:", error);
    // Fall back to local UUID if Firebase auth fails
    return generateUserId();
  }
};
