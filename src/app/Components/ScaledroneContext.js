// ScaledroneContext.js
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { randomColor, fetchUserData } from "./ChatComponent";
import { auth } from "./firebase";
const ScaledroneContext = createContext();

export const ScaledroneProvider = ({ children }) => {
  const [drone, setDrone] = useState(null);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const memoizedFetchUserData = useCallback(async (authUser) => {
    if (authUser) {
      await fetchUserData(authUser, setUserData);
    }
  }, []); // Dependency array can be empty since fetchUserData doesn't depend on any external variables

  useEffect(() => {
    const authListener = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      memoizedFetchUserData(authUser);
    });

    return () => {
      authListener();
    };
  }, [memoizedFetchUserData]); // Now, only memoizedFetchUserData is a dependency, because when using a standard useData it retriggers this useEffect which will result in re-rendering the messages

  useEffect(() => {
    // Only run the effect when userData is available
    if (!userData) {
      return;
    }

    const scaledrone = new Scaledrone("8Rr4ZSUaGeqKIfXZ", {
      data: { name: userData.username, color: randomColor() },
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
