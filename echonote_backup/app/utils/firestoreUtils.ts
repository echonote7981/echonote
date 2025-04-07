import { firestore } from "../config/firebaseConfig";
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

// Define TypeScript interfaces for our data
interface RecordingData {
  id: string;
  title: string;
  duration: number;
  audioUri: string;
  transcript?: string;
  notes?: string;
  createdAt: Date;
  [key: string]: any; // Allow additional properties
}

/**
 * Save recording data to Firestore under the user's document
 * @param userId Firebase UID of the user
 * @param recordingData Object containing recording metadata
 */
export const saveRecording = async (userId: string, recordingData: RecordingData) => {
  try {
    const userRef = doc(firestore, "users", userId);
    
    // Check if user document exists
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // If the user document exists, update the recordings array
      await updateDoc(userRef, {
        recordings: arrayUnion(recordingData)
      });
    } else {
      // If the user document doesn't exist, create it with the recording
      await setDoc(userRef, { 
        recordings: [recordingData],
        createdAt: new Date(),
        totalRecordingTime: recordingData.duration || 0
      });
    }
    
    console.log("Recording saved successfully.");
    return true;
  } catch (error) {
    console.error("Error saving recording:", error);
    return false;
  }
};

/**
 * Update user recording time in Firestore
 * @param userId Firebase UID of the user
 * @param duration Duration in seconds to add to total recording time
 */
export const updateRecordingTime = async (userId: string, duration: number) => {
  try {
    const userRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentTotal = userData.totalRecordingTime || 0;
      
      await updateDoc(userRef, {
        totalRecordingTime: currentTotal + duration
      });
    } else {
      await setDoc(userRef, {
        totalRecordingTime: duration,
        createdAt: new Date()
      });
    }
    
    console.log("Recording time updated successfully.");
    return true;
  } catch (error) {
    console.error("Error updating recording time:", error);
    return false;
  }
};
