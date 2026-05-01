import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,  // ← change this line
  authDomain: "crisissync-codecrafters.firebaseapp.com",
  projectId: "crisissync-codecrafters",
  storageBucket: "crisissync-codecrafters.firebasestorage.app",
  messagingSenderId: "349274111564",
  appId: "1:349274111564:web:f3c5a2470dbe84e58abee9",
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

export async function loginAnonymously() {
  const result = await signInAnonymously(auth);
  return result.user.uid;
}

export { auth, db };
