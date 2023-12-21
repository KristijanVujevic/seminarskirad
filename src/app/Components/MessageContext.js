// MessageContext.js
import { createContext, useState } from "react";

const MessageContext = createContext();

const MessageContextProvider = ({ children }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const addMessage = (newMessage) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: newMessage.message, sender: newMessage.sender },
    ]);
  };

  return (
    <MessageContext.Provider
      value={{ message, setMessage, messages, setMessages, addMessage }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export { MessageContext, MessageContextProvider };
