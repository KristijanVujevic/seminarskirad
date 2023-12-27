import React, { useEffect, useState } from "react";

import { useScaledrone } from "./ScaledroneContext";
import Link from "next/link";
import { auth, firestore } from "@/app/Components/firebase";
import UserInput from "./UserInput";
import { Button, Container, Row, Col } from "react-bootstrap";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import styles from "@/app/page.module.css";
function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time =
    date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
  return time;
}

const fetchUserData = async (user, setUserData) => {
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

export { fetchUserData };
const ChatComponent = () => {
  const router = useRouter();

  const { drone } = useScaledrone();

  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);

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
    if (user && drone) {
      const room = drone.subscribe("observable-my-room");

      room.on("open", (error) => {
        if (error) {
          console.error(error);
        } else {
          console.log(`Connected to room`);
        }
      });

      room.on("message", (messageData) => {
        // Update state with the new message
        setMessages((prevMessages) => [...prevMessages, messageData]);
      });

      drone.on("error", (error) => console.error(error));

      fetchUserData(user, setUserData);

      return () => {
        if (drone.client) {
          drone.client.close();
        }
      };
    }
  }, [user, drone]);

  const renderMessage = (messages) => {
    if (!messages) {
      return null;
    }
    console.log(messages);
    const isMyMessage = messages.data.uid === user?.uid;
    const timestamp = timeConverter(messages.timestamp);
    const senderUsername = isMyMessage ? "You" : messages.data.sender;

    return (
      <div
        key={messages.id}
        className={
          isMyMessage
            ? `${styles.message} ${styles.myMessage}`
            : `${styles.message} ${styles.otherUserMessage}`
        }
      >
        <p className="line-limit">{messages.data.message}</p>
        <p>Sent by: {senderUsername}</p>
        <small>{timestamp}</small>
      </div>
    );
  };

  return (
    <Container fluid className={styles.main}>
      {user ? (
        <Row className={styles.content}>
          {userData ? (
            <Col>
              <h1>Logged in as: {userData.username}</h1>
              <Button variant="danger" onClick={handleLogout}>
                Logout
              </Button>
            </Col>
          ) : (
            <Col>
              <p className={styles.description}>Loading user data...</p>
            </Col>
          )}
          <Col>
            <Col className={styles.messagesContainer}>
              {messages.map((messageData) =>
                renderMessage({
                  ...messageData,
                  senderUsername:
                    userData?.uid === messageData.sender
                      ? "You"
                      : userData?.username,
                })
              )}
            </Col>
          </Col>
          <Col>
            <UserInput
              user={user}
              userData={userData}
              setUserData={setUserData}
            />
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
