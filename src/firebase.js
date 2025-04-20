import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_PIDV8pkLv4kl3nnU5zgYe6gy_EOkki8",
  authDomain: "travel-tracker-web.firebaseapp.com",
  projectId: "travel-tracker-web",
  storageBucket: "travel-tracker-web.firebasestorage.app",
  messagingSenderId: "971416350629",
  appId: "1:971416350629:web:a46522541840eb4e88024c",
  measurementId: "G-WQPEFV7LT2",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// ✅ Safe browser-only offline persistence
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Firestore persistence failed: Multiple tabs open");
    } else if (err.code === "unimplemented") {
      console.warn("Firestore persistence is not available in this browser");
    }
  });
}
