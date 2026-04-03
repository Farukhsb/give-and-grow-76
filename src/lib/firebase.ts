import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAyYfeCekl8hkUdFruRgPoa7QKu8vjFTpY",
  authDomain: "charityapp-2e130.firebaseapp.com",
  projectId: "charityapp-2e130",
  storageBucket: "charityapp-2e130.firebasestorage.app",
  messagingSenderId: "269691432320",
  appId: "1:269691432320:web:8ab968fcc82749cc982565",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
