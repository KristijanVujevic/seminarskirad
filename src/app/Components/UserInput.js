// Import necessary libraries and icons
import React, { useState, useRef } from "react";
import { Button, Form } from "react-bootstrap";
import {
  BsFillMicFill,
  BsFillImageFill,
  BsMicMuteFill,
  BsSendFill,
} from "react-icons/bs";
import { auth, firestore, storage } from "@/app/Components/firebase"; // Adjust the path accordingly
import { useScaledrone } from "./ScaledroneContext";
import { fetchUserData } from "./ChatComponent";

const UserInput = ({ user, setUserData, userData }) => {
  const { drone } = useScaledrone();
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Function to handle sending text messages
  const sendTextMessage = async () => {
    const currentUser = auth.currentUser;

    if (currentUser && drone) {
      console.log("Sending message:", message);

      const messageId = Math.random().toString(36).substr(2, 9);
      drone.publish({
        room: "observable-my-room",
        message: {
          msgId: messageId,
          sender: userData.username,
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

  // Function to handle sending voice messages
  const sendVoiceMessage = async (audioBlob) => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser && drone) {
        console.log("Sending voice message");

        // Upload audio to Firebase Storage
        const audioRef = storage
          .ref()
          .child(`voice_messages/${Date.now()}.mp3`);
        const uploadTask = await audioRef.put(audioBlob, {
          metadata: { uid: currentUser.uid },
        });

        // Get the download URL of the uploaded audio
        const audioURL = await uploadTask.ref.getDownloadURL();
        console.log("Audio URL:", audioURL);

        // Store voice message details in Firestore
        const messageId = Math.random().toString(36).substr(2, 9);
        await firestore.collection("voice_messages").add({
          msgId: messageId,
          sender: userData.username,
          timestamp: new Date().getTime() / 1000,
          audioURL: audioURL,
          uid: currentUser.uid,
        });

        // Publish the voice message to the Scaledrone room
        drone.publish({
          room: "observable-my-room",
          message: {
            msgId: messageId,
            sender: userData.username,
            timestamp: new Date().getTime() / 1000,
            audioURL: audioURL,
            uid: currentUser.uid,
            messageType: "voice", // Optionally, you can include a messageType field to differentiate voice messages
          },
        });

        // Fetch user data after sending a message
        await fetchUserData(user, setUserData);
      } else {
        console.log("User not logged in or drone not initialized");
      }
    } catch (error) {
      console.error("Error sending voice message:", error);
      // Handle error appropriately
    }
  };

  // Function to handle sending images
  const sendImageMessage = async () => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser && drone) {
        // Open a file picker for image selection
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async (e) => {
          const file = e.target.files[0];

          if (file) {
            console.log("Selected image:", file);

            // Upload image to Firebase Storage
            const imageRef = storage
              .ref()
              .child(`image_messages/${Date.now()}_${file.name}`);
            const uploadTask = await imageRef.put(file);

            // Get the download URL of the uploaded image
            const imageURL = await uploadTask.ref.getDownloadURL();

            // Store image message details in Firestore
            const messageId = Math.random().toString(36).substr(2, 9);
            await firestore.collection("image_messages").add({
              msgId: messageId,
              sender: userData.username,
              timestamp: new Date().getTime() / 1000,
              imageURL: imageURL,
              uid: currentUser.uid,
            });

            // Publish the image message to the Scaledrone room
            drone.publish({
              room: "observable-my-room",
              message: {
                msgId: messageId,
                sender: userData.username,
                timestamp: new Date().getTime() / 1000,
                imageURL: imageURL,
                uid: currentUser.uid,
                messageType: "image",
              },
            });

            // Fetch user data after sending a message
            await fetchUserData(user, setUserData);
          }
        };

        input.click();
      } else {
        console.log("User not logged in or drone not initialized");
      }
    } catch (error) {
      console.error("Error sending image message:", error);
      // Handle error appropriately
    }
  };

  // Function to handle audio recording start
  const handleRecordStart = () => {
    try {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
          await sendVoiceMessage(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
        mediaRecorderRef.current = mediaRecorder;
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      // Handle error appropriately
    }
  };

  // Function to handle audio recording stop
  const handleRecordStop = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      chunksRef.current = [];
    }
  };

  return (
    <div className="user-input-container">
      <Form
        className="userinput"
        onSubmit={(e) => {
          e.preventDefault();
          sendTextMessage();
        }}
      >
        <input
          className="input-message"
          type="text"
          rows={3}
          placeholder="Enter message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          autoFocus
          required
        />
        <Button variant="outline-success" type="submit">
          <BsSendFill />
        </Button>
        {/* Button for starting recording */}
        <Button
          variant="outline-primary"
          onClick={handleRecordStart}
          disabled={isRecording}
        >
          {isRecording ? "Recording..." : ""}
          <BsFillMicFill />
        </Button>
        {/* Button for stopping recording */}
        <Button
          variant="outline-danger"
          onClick={handleRecordStop}
          disabled={!isRecording}
        >
          <BsMicMuteFill />
        </Button>
        <Button variant="outline-warning" onClick={sendImageMessage}>
          <BsFillImageFill />
        </Button>
      </Form>
    </div>
  );
};

export default UserInput;
