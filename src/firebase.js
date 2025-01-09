// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAHRbOt-EXAMPLE",
  authDomain: "depo-stok-31ca2.firebaseapp.com",
  projectId: "depo-stok-31ca2",
  storageBucket: "depo-stok-31ca2.appspot.com",
  messagingSenderId: "603516286341",
  appId: "1:603516286341:web:e4fc702b4cd45bbcf140ec",
  measurementId: "G-P2B1B3X1EL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
