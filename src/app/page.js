"use client";
import "dotenv/config";
import ChatComponent from "./Components/ChatComponent";

import { ScaledroneProvider } from "./Components/ScaledroneContext";

import styles from "./page.module.css";
import firebase from "./Components/firebase";
export default function Home() {
  return (
    <main className={styles.main}>
      <ScaledroneProvider>
        <ChatComponent />
      </ScaledroneProvider>
    </main>
  );
}
