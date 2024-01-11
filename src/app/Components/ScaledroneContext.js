// ScaledroneContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { randomColor, fetchUserData } from "./ChatComponent";
import { auth } from "./firebase";
const ScaledroneContext = createContext();

export const ScaledroneProvider = ({ children }) => {
  const [drone, setDrone] = useState(null);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const authListener = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);

      if (authUser) {
        fetchUserData(authUser, setUserData);
      }
    });

    return () => {
      authListener();
    };
  }, []); // No dependencies, so it runs once when the component mounts

  useEffect(() => {
    const scaledrone = new Scaledrone("8Rr4ZSUaGeqKIfXZ", {
      data: { name: userData?.username, color: randomColor() },
    });
    setDrone(scaledrone);

    return () => {
      scaledrone.close();
    };
  }, [userData]); // Re-run whenever userData changes

  return (
    <ScaledroneContext.Provider value={{ drone }}>
      {children}
    </ScaledroneContext.Provider>
  );
};

export const useScaledrone = () => {
  return useContext(ScaledroneContext);
};
