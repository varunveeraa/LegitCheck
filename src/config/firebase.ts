// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhv2Xh1dOGmsCqb2pRHgaUZcwptiwVjbs",
  authDomain: "docveri.firebaseapp.com",
  projectId: "docveri",
  storageBucket: "docveri.firebasestorage.app",
  messagingSenderId: "701867860833",
  appId: "1:701867860833:web:74aa3ec8814498ba5bdb20",
  measurementId: "G-XV17S2DF3K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;