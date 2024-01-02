// SignIn.js
"use client";
import React, { useState } from "react";
import { auth, firestore } from "@/app/Components/firebase";
import { useRouter } from "next/navigation";
import { Modal, Button } from "react-bootstrap";
import styles from "@/app/page.module.css";

const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // State to hold error message
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await auth.signInWithEmailAndPassword(email, password);
      console.log("User signed in successfully!");
      // Redirect to another page after successful sign-in
      router.push("/");
    } catch (error) {
      console.error("Error signing in:", error.message);
      setError(error.message);
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  return (
    <div className={styles.main}>
      <h2 className={styles.title}>Sign In</h2>

      <h3>
        <a href="/signup">Create a new account!</a>
      </h3>

      <input
        className={styles.card}
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className={styles.card}
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className={`${styles.button} ${loading ? styles.disabled : ""}`}
        onClick={handleSignIn}
        disabled={loading}
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>
      <Modal show={isModalOpen} onHide={closeModal}>
        <Modal.Header
          style={{ display: "flex", justifyContent: "center" }}
          closeButton
        >
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className={`${styles.card}`}>{error}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className={`${styles.card}`}
            variant="secondary"
            onClick={closeModal}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SignIn;
