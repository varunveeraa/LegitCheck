import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDhv2Xh1dOGmsCqb2pRHgaUZcwptiwVjbs",
  authDomain: "docveri.firebaseapp.com",
  projectId: "docveri",
  storageBucket: "docveri.firebasestorage.app",
  messagingSenderId: "701867860833",
  appId: "1:701867860833:web:bea3347e7a00e3145bdb20",
  measurementId: "G-PTD8DTHYPZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;