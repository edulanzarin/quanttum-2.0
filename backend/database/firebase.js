// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9NhITakVX__c5aiiYNp0rX8z0WfXcTwY",
  authDomain: "quanttum2.firebaseapp.com",
  projectId: "quanttum2",
  storageBucket: "quanttum2.firebasestorage.app",
  messagingSenderId: "642949416782",
  appId: "1:642949416782:web:a4fdfd25a6d63e2944801f",
  measurementId: "G-1BV3HZPLX6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);