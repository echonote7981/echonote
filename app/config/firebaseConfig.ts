import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase Config (Replace with your credentials)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize auth
const auth = getAuth(app);
// Setup persistence - this won't throw errors but AsyncStorage
// will need to be manually used in the app code
const firestore = getFirestore(app);

// Store and retrieve user data in AsyncStorage manually
// This avoids the Firebase Auth persistence warning
const storeUserSession = async (userId: string) => {
  try {
    await AsyncStorage.setItem('firebase_user_id', userId);
  } catch (error) {
    console.error('Error storing user session:', error);
  }
};

const retrieveUserSession = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('firebase_user_id');
  } catch (error) {
    console.error('Error retrieving user session:', error);
    return null;
  }
};

export { auth, firestore, signInAnonymously, storeUserSession, retrieveUserSession };

// Added for expo-router compatibility - prevents warning
export default function FirebaseConfig() {
  return null;
}
