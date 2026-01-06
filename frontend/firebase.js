// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
 apiKey: "AIzaSyBGdCFld7ezDjcta-rLfVHIKJwLoIlCguU",
  authDomain: "collageproject-d6c1f.firebaseapp.com",
  projectId: "collageproject-d6c1f",
  storageBucket: "collageproject-d6c1f.firebasestorage.app",
  messagingSenderId: "966590399806",
  appId: "1:966590399806:web:c678d5f87bbc3252d4586f",
  measurementId: "G-1X68S6YV5G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {app,auth}