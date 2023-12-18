// ScaledroneContext.js
import { createContext, useContext, useEffect, useState } from "react";

const ScaledroneContext = createContext();

export const ScaledroneProvider = ({ children }) => {
  const [drone, setDrone] = useState(null);

  useEffect(() => {
    const scaledrone = new Scaledrone("8Rr4ZSUaGeqKIfXZ");
    setDrone(scaledrone);

    return () => {
      scaledrone.close();
    };
  }, []);

  return (
    <ScaledroneContext.Provider value={{ drone }}>
      {children}
    </ScaledroneContext.Provider>
  );
};

export const useScaledrone = () => {
  return useContext(ScaledroneContext);
};
