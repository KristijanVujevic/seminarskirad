// SignUp.js
"use client";
import React, { useState } from "react";
import { auth, firestore } from "@/app/Components/firebase";
import { useRouter } from "next/navigation";
import { Modal, Button } from "react-bootstrap";

import styles from "@/app/page.module.css";

const SignUp = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null); // State to hold error message
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignUp = async () => {
    try {
      const authResult = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const user = authResult.user;

      await firestore.collection("users").doc(user.uid).set({
        username: username,
      });

      console.log("User signed up successfully!");

      // Redirect to a new route after successful sign-up
      router.push("/");
    } catch (error) {
      console.error("Error signing up:", error.message);
      setError(error.message);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  return (
    <div className={styles.main}>
      <h2 className={styles.title}>Sign Up</h2>

      <h3>
        <a href="/signin">Already have an account?</a>
      </h3>

      <input
        style={{ color: "white" }}
        className={styles.card}
        type="email"
        value={email}
        placeholder="email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={{ color: "white" }}
        className={styles.card}
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        style={{ color: "white" }}
        className={styles.card}
        type="text"
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button className={styles.button} onClick={handleSignUp}>
        Sign Up
      </button>
      <Modal show={isModalOpen} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title style={{ display: "flex", justifyContent: "center" }}>
            Error
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{error}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SignUp;
