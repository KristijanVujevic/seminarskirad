import * as firebase from "firebase/app";

import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCuhqc9a7GxkX6KlfMzvpsN1I8D9--tHvM",
  authDomain: "chatapp-for-seminarski.firebaseapp.com",
  projectId: "chatapp-for-seminarski",
  storageBucket: "chatapp-for-seminarski.appspot.com",
  messagingSenderId: "361111047028",
  appId: "1:361111047028:web:4abfcdb36730b0793afa21",
  measurementId: "G-3S7YRK7FP5",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const signUp = async (email, password) => {
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    console.log("User successfully signed up!");
  } catch (error) {
    console.error("Error signing up:", error.message);
  }
};

// Function for signing in a user
const signIn = async (email, password) => {
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    console.log("User successfully signed in!");
  } catch (error) {
    console.error("Error signing in:", error.message);
  }
};
