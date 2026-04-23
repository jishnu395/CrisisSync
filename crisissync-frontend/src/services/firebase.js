import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";

// Your config from Firebase Console → Project Settings → Your Apps
const firebaseConfig = {
  apiKey: "AIzaSyDgku8CripjFp8JMEA1aol-Gmqe5XH25PI",
  authDomain: "crisissync-codecrafters.firebaseapp.com",
  projectId: "crisissync-codecrafters",
};

// initializeApp MUST come first
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // pass `app` explicitly

export async function loginAnonymously() {
  const result = await signInAnonymously(auth);
  return result.user.uid;
}

export { auth };