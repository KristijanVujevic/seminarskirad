import React, { useContext, useState } from "react";
import { MessageContext } from "./MessageContext";
import { auth } from "@/app/Components/firebase";

const UserInput = () => {
  const messageContext = useContext(MessageContext);
  const [poruka, setPoruka] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get the current user
    const currentUser = auth.currentUser;

    if (currentUser) {
      // Log the message to the console
      console.log(poruka);

      // Reset the textarea after submitting, if needed
      setPoruka("");

      // Add the message to the context with sender information
      messageContext.addMessage({ message: poruka, sender: currentUser.uid });
    } else {
      console.log("User not logged in");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={3}
          placeholder="Enter message"
          value={poruka}
          onChange={(e) => setPoruka(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default UserInput;
