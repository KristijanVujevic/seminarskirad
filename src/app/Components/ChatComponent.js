import React, { useContext, useEffect, useState } from "react";
import { MessageContext } from "./MessageContext";
import { useScaledrone } from "./ScaledroneContext";
import Link from "next/link";
import { auth, firestore } from "@/app/Components/firebase";
import UserInput from "./UserInput";
import { Button, Container, Row, Col } from "react-bootstrap";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import styles from "@/app/page.module.css";

const ChatComponent = () => {
  const router = useRouter();
  const messageContext = useContext(MessageContext);
  const { drone } = useScaledrone();

  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const authListener = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });

    return () => {
      authListener();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/signin");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  useEffect(() => {
    let room;

    const connectToRoom = () => {
      // Subscribe to the room
      room = drone.subscribe("observable-my-room");

      // Handle room open event
      room.on("open", (error) => {
        if (error) {
          console.error(error);
        } else {
          console.log(`Connected to room`);
        }
      });

      // Handle incoming messages
      room.on("message", (messageData) => {
        console.log("Received message:", messageData);
        messageContext.addMessage({
          id: messageData.data.id, // Use a unique identifier
          message: messageData.data.message,
          sender: messageData.data.sender,
        });
      });
    };

    const handleRoomError = (error) => {
      console.error("Error connecting to room:", error);
    };

    // Set up room connection and listeners
    if (user && drone) {
      connectToRoom();
      drone.on("error", handleRoomError);

      // Fetch user data
      const fetchUserData = async () => {
        try {
          const doc = await firestore.collection("users").doc(user.uid).get();
          if (doc.exists) {
            setUserData(doc.data());
          } else {
            console.error("User document does not exist");
          }
        } catch (error) {
          console.error("Error fetching user data:", error.message);
        }
      };

      fetchUserData();

      // Clean up when component unmounts
      return () => {
        if (room) {
          room.unsubscribe(); // Unsubscribe from the room
        }

        if (drone.client) {
          drone.client.close();
        }
      };
    }
  }, [user, drone, messageContext]);

  const renderMessage = (messageData) => {
    const isMyMessage = messageData.sender === user?.uid;
    const senderUsername = isMyMessage ? "You" : "Other User";

    return (
      <div
        key={messageData.message}
        className={
          isMyMessage
            ? `${styles.message} ${styles.myMessage}`
            : `${styles.message} ${styles.otherUserMessage}`
        }
      >
        {messageData && messageData.message ? (
          <div>
            <p>{messageData.message}</p>
            <p>Sent by: {senderUsername}</p>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <Container fluid className={styles.main}>
      {user ? (
        <Row className={styles.content}>
          {userData ? (
            <Col>
              <p className={styles.description}>
                Welcome, {userData.username}!
              </p>
            </Col>
          ) : (
            <Col>
              <p className={styles.description}>Loading user data...</p>
            </Col>
          )}
          <Col>
            <Col className={styles.messagesContainer}>
              {messageContext.messages.map((messageData) =>
                renderMessage({
                  ...messageData,
                  senderUsername:
                    userData?.uid === messageData.sender
                      ? "You"
                      : userData?.username,
                })
              )}
            </Col>
            <Button
              variant="primary"
              className={styles.card}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Col>
          <Col>
            <UserInput />
          </Col>
        </Row>
      ) : (
        <Row className={styles.grid}>
          <Col>
            <Link href={"/signin"}>Sign in!</Link>
          </Col>
          <Col>
            <br />
          </Col>
          <Col>
            <Link href={"/signup"}>Create an account!</Link>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ChatComponent;
