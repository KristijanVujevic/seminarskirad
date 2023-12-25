// UserInput.js
import React, { useState } from "react";

import { auth } from "@/app/Components/firebase";
import { useScaledrone } from "./ScaledroneContext";
import { fetchUserData } from "./ChatComponent";

const UserInput = ({ user, setUserData, userData }) => {
  const { drone } = useScaledrone();
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentUser = auth.currentUser;

    if (currentUser && drone) {
      console.log("Sending message:", message);

      const messageId = Math.random().toString(36).substr(2, 9);
      drone.publish({
        room: "observable-my-room",
        message: {
          msgId: messageId,
          sender: userData.username, // Assuming you want to send user data as the sender
          message: message,
          uid: currentUser.uid,
        },
      });

      setMessage("");

      // Fetch user data after sending a message
      await fetchUserData(user, setUserData);
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
