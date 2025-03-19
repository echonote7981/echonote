import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { firestore } from '../config/firebaseConfig';

// Define the type for our context
type UserContextType = {
  isPremium: boolean;
  setIsPremium: React.Dispatch<React.SetStateAction<boolean>>;
  recordingTime: number;
  saveRecordingTime: (timeInSeconds: number) => Promise<void>;
  checkRecordingLimit: () => boolean;
};

// Create context with a default value that matches our type
const initialContextValue: UserContextType = {
  isPremium: false,
  setIsPremium: () => {},
  recordingTime: 0,
  saveRecordingTime: async () => {},
  checkRecordingLimit: () => true
};

const UserContext = createContext<UserContextType>(initialContextValue);

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [isPremium, setIsPremium] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // Get premium status
      const premiumStatus = await AsyncStorage.getItem('isPremium');
      setIsPremium(premiumStatus === 'true');
      
      // Get recording time
      const totalTime = await AsyncStorage.getItem('recordingTime');
      setRecordingTime(totalTime ? parseInt(totalTime, 10) : 0);
      
      // Get user ID
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(storedUserId);
    };
    
    fetchUserData();
  }, []);

  const saveRecordingTime = async (timeInSeconds: number): Promise<void> => {
    const newTotal = recordingTime + timeInSeconds;
    setRecordingTime(newTotal);
    await AsyncStorage.setItem('recordingTime', newTotal.toString());
    
    // If we have a userId, update Firestore as well
    if (userId) {
      try {
        const userRef = doc(firestore, 'users', userId);
        await updateDoc(userRef, {
          totalRecordingTime: increment(timeInSeconds)
        });
      } catch (error) {
        console.error('Error updating Firestore:', error);
        // Continue even if Firestore update fails
      }
    }
  };

  const checkRecordingLimit = (): boolean => {
    // 4 hours limit (in seconds)
    return recordingTime < 14400;
  };

  // Create the context value object
  const contextValue: UserContextType = {
    isPremium, 
    setIsPremium, 
    recordingTime, 
    checkRecordingLimit, 
    saveRecordingTime
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  return context;
};
