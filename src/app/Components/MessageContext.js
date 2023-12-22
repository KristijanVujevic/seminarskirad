// MessageContext.js
import { createContext, useState } from "react";

const MessageContext = createContext();

const MessageContextProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  const addMessage = (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  return (
    <MessageContext.Provider value={{ messages, addMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export { MessageContext, MessageContextProvider };
