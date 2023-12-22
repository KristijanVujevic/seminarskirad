// MessageContext.js
import { createContext, useState } from "react";

const MessageContext = createContext();

const MessageContextProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  const addMessage = (newMessage) => {
    // Check if the message already exists in the messages array
    const existingMessage = messages.find(
      (message) => message.id === newMessage.id
    );

    if (!existingMessage) {
      // If the message doesn't exist, add it to the messages array
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  };

  return (
    <MessageContext.Provider value={{ messages, addMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export { MessageContext, MessageContextProvider };
