// src/firebase/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyA8vuFRowcXFzk3_SaLcUk3qn4clhvz0VU",
  authDomain: "finadr-c216d.firebaseapp.com",
  projectId: "finadr-c216d",
  storageBucket: "finadr-c216d.appspot.com",
  messagingSenderId: "608681523529",
  appId: "1:608681523529:web:8f3bed536feada05224298"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);
export default app;
