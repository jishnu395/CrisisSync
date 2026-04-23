import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgku8CripjFp8JMEA1aol-Gmqe5XH25PI",
  authDomain: "crisissync-codecrafters.firebaseapp.com",
  projectId: "crisissync-codecrafters",
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

export async function loginAnonymously() {
  const result = await signInAnonymously(auth);
  return result.user.uid;
}

export { auth, db };
