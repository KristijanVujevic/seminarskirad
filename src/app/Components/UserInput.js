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
      drone.publish({
        room: "observable-my-room", // Replace with your room name
        message: {
          sender: currentUser.uid,
          message: message,
        },
      });

      // Reset the textarea after submitting, if needed
      setMessage("");

      // Add the message to the context with sender information
      messageContext.addMessage({
        message: message,
        sender: currentUser.uid, // Add sender information here
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
