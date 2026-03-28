// ไฟล์: src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFWUVaIICoIoMuLTGOQAoBDSHkfg8fjeM",
  authDomain: "lgov-26d9e.firebaseapp.com",
  projectId: "lgov-26d9e",
  storageBucket: "lgov-26d9e.firebasestorage.app",
  messagingSenderId: "129833008495",
  appId: "1:129833008495:web:bae13c9369d6915d69fc9a",
  measurementId: "G-3J7LDW9SWL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ส่งออกตัวแปร db เพื่อให้ App.tsx เรียกใช้งานฐานข้อมูลได้
export const db = getFirestore(app);