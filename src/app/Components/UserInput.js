// UserInput.js
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
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
          timestamp: new Date().getTime() / 1000,
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
      <Form onSubmit={handleSubmit}>
        <textarea
          rows={3}
          placeholder="Enter message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button variant="outline-success" type="submit">
          Send
        </Button>
      </Form>
    </div>
  );
};

export default UserInput;
