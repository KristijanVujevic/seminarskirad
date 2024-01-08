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
import ImageModal from "./ImageModal";
import { useToasts } from "react-toast-notifications";

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
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [visibleMessages, setVisibleMessages] = useState(20); // Adjust the initial number as needed
  const messagesContainerRef = useRef(null);
  const { addToast } = useToasts();

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

  const openImageModal = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
  };
  const closeImageModal = () => {
    setSelectedImageUrl(null);
  };
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

        addToast(messageData.text, { appearance: "success" });
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
  }, [user, drone, addToast]);
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const renderHistoryMessage = (oldMessages) => {
    if (!oldMessages) {
      return null;
    }

    const isMyMessage = oldMessages.uid === user?.uid;
    const timestamp = timeConverter(oldMessages.timestamp);
    const senderUsername = isMyMessage ? "You" : oldMessages.sender;

    let messageContent;
    if (oldMessages.audioURL) {
      // Handle voice message rendering
      messageContent = (
        <div>
          <audio controls>
            <source src={oldMessages.audioURL} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    } else if (oldMessages.imageURL) {
      // Handle image message rendering
      messageContent = (
        <div>
          <img
            src={oldMessages.imageURL}
            alt="Image"
            style={{
              maxWidth: "50%",
              height: "auto",
              cursor: "pointer",
              "@media (maxWidth: 768px)": {
                // Adjust the values based on your preference
                maxWidth: "40%",
              },
            }}
            onClick={() => openImageModal(oldMessages.imageURL)}
          />
        </div>
      );
    } else {
      // Handle text message rendering
      messageContent = <p className="line-limit">{oldMessages.message}</p>;
    }

    return (
      <div
        key={oldMessages.msgId}
        className={
          isMyMessage
            ? `${styles.message} ${styles.myMessage}`
            : `${styles.message} ${styles.otherUserMessage}`
        }
      >
        {messageContent}
        <p>Sent by: {senderUsername}</p>
        <small>{timestamp}</small>
      </div>
    );
  };

  const renderSingleMessage = (message) => {
    if (!message) {
      return null;
    }

    const isMyMessage = message.data.uid === user?.uid;
    const timestamp = timeConverter(message.timestamp);
    const senderUsername = isMyMessage ? "You" : message.data.sender;

    let messageContent;
    if (message.data.audioURL) {
      // Handle voice message rendering
      messageContent = (
        <div>
          <audio controls>
            <source src={message.data.audioURL} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    } else if (message.data.imageURL) {
      // Handle image message rendering
      messageContent = (
        <div>
          <img
            src={message.data.imageURL}
            alt="Image"
            style={{ maxWidth: "100%", cursor: "pointer" }}
            onClick={() => openImageModal(message.data.imageURL)}
          />
        </div>
      );
    } else {
      // Handle text message rendering
      messageContent = <p className="line-limit">{message.data.message}</p>;
    }

    return (
      <div
        key={message.id}
        className={
          isMyMessage
            ? `${styles.message} ${styles.myMessage}`
            : `${styles.message} ${styles.otherUserMessage}`
        }
      >
        {messageContent}
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
                renderSingleMessage({
                  ...messageData,
                  senderUsername:
                    userData?.uid === messageData.sender
                      ? "You"
                      : userData?.username,
                })
              )}
              <div
                style={{ float: "left", clear: "both" }}
                ref={messagesContainerRef}
              />
            </Col>
          </Col>
          <Col>
            <UserInput
              user={user}
              userData={userData}
              setUserData={setUserData}
            />
            <ImageModal imageUrl={selectedImageUrl} onClose={closeImageModal} />
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
