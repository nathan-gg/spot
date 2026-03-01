// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBL6raaVHZhWbijQb3GFf28QZ0hSb2EEYY",
  authDomain: "spotapp-a1e2a.firebaseapp.com",
  projectId: "spotapp-a1e2a",
  storageBucket: "spotapp-a1e2a.firebasestorage.app",
  messagingSenderId: "985600098832",
  appId: "1:985600098832:web:6b126b9ea543a072040095",
  measurementId: "G-DC9EW58L17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);