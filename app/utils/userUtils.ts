import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore - Ignore missing type declarations for uuid
import { v4 as uuidv4 } from 'uuid';
import { auth, signInAnonymously, storeUserSession, retrieveUserSession } from '../config/firebaseConfig';

/**
 * Generates or retrieves a user ID from AsyncStorage
 * This is used for users who don't explicitly log in
 */
export const generateUserId = async (): Promise<string> => {
  // Get stored ID or null if not found
  const storedId = await AsyncStorage.getItem('userId');
  
  // If no stored ID, generate a new one
  if (!storedId) {
    const newId = uuidv4(); // Generate new UUID
    await AsyncStorage.setItem('userId', newId);
    return newId;
  }
  
  // Return the stored ID (TypeScript now knows this is a string)
  return storedId;
};

/**
 * Authenticates user anonymously with Firebase
 * Returns the Firebase UID which can be used to track user data
 */
export const authenticateUser = async (): Promise<string> => {
  try {
    // Check if we have a stored session first
    const storedUserId = await retrieveUserSession();
    
    if (storedUserId && auth.currentUser) {
      console.log("Using stored user ID:", storedUserId);
      return storedUserId;
    }
    
    // If no stored session, create a new one
    const userCredential = await signInAnonymously(auth);
    const userId = userCredential.user.uid;
    
    // Store the user ID for future sessions
    await storeUserSession(userId);
    
    console.log("New user authenticated ID:", userId);
    return userId;
  } catch (error) {
    console.error("Authentication Failed:", error);
    // Fall back to local UUID if Firebase auth fails
    return generateUserId();
  }
};

// Added default export for expo-router compatibility
export default function UserUtils() {
  return null;
}
