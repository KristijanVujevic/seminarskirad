import React, { useEffect, useRef, useState } from "react";
import Members from "./Members";
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

function randomColor() {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16);
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
  const [oldMessages, setOldMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [me, setMe] = useState({
    username: userData?.username,
    color: randomColor(),
  });
  const membersRef = useRef();
  membersRef.current = members;

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
      const room = drone.subscribe("observable-my-room", { historyCount: 20 });

      room.on("open", (error) => {
        if (error) {
          console.error(error);
        } else {
          console.log(`Connected to room`);
        }
      });
      room.on("members", (members) => {
        setMembers(members);
      });
      room.on("member_join", (member) => {
        setMembers([...membersRef.current, member]);
      });
      room.on("member_leave", ({ id }) => {
        const index = membersRef.current.findIndex((m) => m.id === id);
        const newMembers = [...membersRef.current];
        newMembers.splice(index, 1);
        setMembers(newMembers);
      });

      room.on("message", (messageData) => {
        // Update state with the new message
        setMessages((prevMessages) => [...prevMessages, messageData]);
      });

      drone.on("error", (error) => console.error(error));

      room.on("history_message", ({ data }) => {
        setOldMessages((prevOldMessages) => [...prevOldMessages, data]);
      });
      fetchUserData(user, setUserData);

      return () => {
        if (drone.client) {
          drone.client.close();
        }
      };
    }
  }, [user, drone]);

  const renderHistoryMessage = (oldMessages) => {
    if (!oldMessages) {
      return null;
    }
    const isMyMessage = oldMessages.uid === user?.uid;
    const timestamp = timeConverter(oldMessages.timestamp);
    const senderUsername = isMyMessage ? "You" : oldMessages.sender;

    return (
      <div
        key={oldMessages.msgId}
        className={
          isMyMessage
            ? `${styles.message} ${styles.myMessage}`
            : `${styles.message} ${styles.otherUserMessage}`
        }
      >
        <p className="line-limit">{oldMessages.message}</p>
        <p>Sent by: {senderUsername}</p>
        <small>{timestamp}</small>
      </div>
    );
  };
  const renderMessage = (messages) => {
    if (!messages) {
      return null;
    }

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
        <Row className={styles.content} style={{ maxWidth: "100vw" }}>
          {userData ? (
            <Col style={{ display: "flex", justifyContent: "center" }}>
              <h1>Logged in as: {userData.username}</h1>
              <Button variant="danger" onClick={handleLogout}>
                Logout
              </Button>
              {members && <Members members={members} me={me} />}
            </Col>
          ) : (
            <Col>
              <p className={styles.description}>Loading user data...</p>
            </Col>
          )}
          <Col>
            <Col
              className={styles.messagesContainer}
              style={{ width: "100vw" }}
            >
              {oldMessages.map((msgData) =>
                renderHistoryMessage({
                  ...msgData,
                  senderUsername: userData?.uid === msgData.sender,
                })
              )}
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
        <Row
          className={styles.grid}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Col>
            <Link style={{ fontSize: "10vh " }} href={"/signin"}>
              Sign in!
            </Link>
          </Col>
          <Col>
            <br />
          </Col>
          <Col>
            <Link style={{ fontSize: "10vh " }} href={"/signup"}>
              Create an account!
            </Link>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ChatComponent;
