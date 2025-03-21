import React, { createContext, useContext, useState } from 'react';

type UserContextType = {
  isPremium: boolean;
  setIsPremium: (premium: boolean) => void;
};

const UserContext = createContext<UserContextType>({
  isPremium: false,
  setIsPremium: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPremium, setIsPremium] = useState(false);

  return (
    <UserContext.Provider value={{ isPremium, setIsPremium }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

// Add default export to fix routing warning
export default UserProvider;