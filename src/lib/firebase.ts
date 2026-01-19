import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBWdfgqEZc2p130n1XJ4-UG5R3TNQiNDbo",
  authDomain: "cota-f2f4a.firebaseapp.com",
  projectId: "cota-f2f4a",
  storageBucket: "cota-f2f4a.firebasestorage.app",
  messagingSenderId: "943691635019",
  appId: "1:943691635019:web:3b24d84fd49bd8238470ce"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
