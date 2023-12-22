// UserInput.js
import React, { useContext, useState } from "react";
import { MessageContext } from "./MessageContext";
import { auth } from "@/app/Components/firebase";
import { useScaledrone } from "./ScaledroneContext";

const UserInput = () => {
  const messageContext = useContext(MessageContext);
  const { drone } = useScaledrone();
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get the current user
    const currentUser = auth.currentUser;

    if (currentUser && drone) {
      console.log("Sending message:", message);

      // Use room.publish to send a message to the room
      const messageId = Math.random().toString(36).substr(2, 9);
      drone.publish({
        room: "observable-my-room",
        message: {
          id: messageId,
          sender: currentUser.uid,
          message: message,
        },
      });

      // Reset the textarea after submitting, if needed
      setMessage("");

      // Add the message to the context with sender information
      messageContext.addMessage({
        id: messageId,
        message: message,
        sender: currentUser.uid,
      });
    } else {
      console.log("User not logged in or drone not initialized");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={3}
          placeholder="Enter message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default UserInput;
