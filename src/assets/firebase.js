// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAATfhFoCCYVOx340w5cMaIGM1mE_4aqFo",
    authDomain: "score-valorant-team-lloiy.firebaseapp.com",
    projectId: "score-valorant-team-lloiy",
    storageBucket: "score-valorant-team-lloiy.firebasestorage.app",
    messagingSenderId: "636058517253",
    appId: "1:636058517253:web:a5f5951a727935372dc16c",
    measurementId: "G-RPZQ2F8TTJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };