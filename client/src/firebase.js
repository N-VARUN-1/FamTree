// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDEu3iJYfwI-eUGwX-mPxHcCVn9uJEK8kg",
    authDomain: "famtree-34bc8.firebaseapp.com",
    projectId: "famtree-34bc8",
    storageBucket: "famtree-34bc8.firebasestorage.app",
    messagingSenderId: "288867716714",
    appId: "1:288867716714:web:8d36327b1fe7862c4a8413",
    measurementId: "G-K1FT3R3VFH"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);