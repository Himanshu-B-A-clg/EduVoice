// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyBR05lydKwW5Lan0AHRKwDJK_ilyklsDPw",
    authDomain: "finalyear-3578e.firebaseapp.com",
    projectId: "finalyear-3578e",
    storageBucket: "finalyear-3578e.firebasestorage.app",
    messagingSenderId: "298753298884",
    appId: "1:298753298884:web:ca0d297b49c6cebe709491",
    measurementId: "G-K0WC84F1S5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
