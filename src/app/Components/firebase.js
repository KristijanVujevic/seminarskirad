import firebase from "firebase/compat/app"; // Import the 'app' module
import "firebase/compat/auth"; // Import the 'auth' module
import "firebase/compat/storage";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCuhqc9a7GxkX6KlfMzvpsN1I8D9--tHvM",
  authDomain: "chatapp-for-seminarski.firebaseapp.com",
  projectId: "chatapp-for-seminarski",
  storageBucket: "chatapp-for-seminarski.appspot.com",
  messagingSenderId: "361111047028",
  appId: "1:361111047028:web:4abfcdb36730b0793afa21",
  measurementId: "G-3S7YRK7FP5",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(); // Access the auth module directly
const firestore = firebaseApp.firestore();
const storage = firebase.storage();
export { auth, firestore, firebaseApp, storage };
