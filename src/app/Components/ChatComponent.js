// ChatComponent.js
import React, { useContext, useEffect, useState } from "react";
import { MessageContext } from "./MessageContext";
import { useScaledrone } from "./ScaledroneContext";
import { auth, firestore } from "@/app/Components/firebase";
import UserInput from "./UserInput";
import { Button, Container, Row, Col } from "react-bootstrap";
import styles from "@/app/page.module.css";

const ChatComponent = () => {
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

  React.useEffect(() => {
    let room;

    const initRoom = async () => {
      if (!room) {
        room = drone.subscribe("observable-my-room");

        room.on("open", (error) => {
          if (error) {
            console.error(error);
          } else {
            console.log(`Connected to room`);
          }
        });

        room.on("message", (messageData) => {
          console.log("Received message:", messageData);
          messageContext.addMessage({
            id: messageData.data.id,
            message: messageData.data.message,
            sender: messageData.data.sender,
          });
        });

        drone.on("error", (error) => console.error(error));
      }
    };

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

    if (user && drone) {
      initRoom();
      fetchUserData();
    }

    return () => {
      if (room) {
        room.unsubscribe();
      }

      if (drone && drone.client) {
        drone.client.close();
      }
    };
  }, [user, drone, messageContext]);

  const renderMessage = (messageData) => {
    console.log("Rendering a message!");
    const isMyMessage = messageData.sender === user?.uid;
    const senderUsername = isMyMessage ? "You" : "Other User";

    return (
      <div
        key={messageData.id}
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
                renderMessage(messageData)
              )}
            </Col>
            <Button variant="primary" className={styles.card}>
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
            <p>Sign in!</p>
          </Col>
          <Col>
            <br />
          </Col>
          <Col>
            <p>Create an account!</p>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ChatComponent;
