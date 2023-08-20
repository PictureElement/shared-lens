// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAo8HQA-g7WqmOQP2JH9k6KfG0EIM9ceeU",
  authDomain: "vk-wedding-86fc6.firebaseapp.com",
  projectId: "vk-wedding-86fc6",
  storageBucket: "vk-wedding-86fc6.appspot.com",
  messagingSenderId: "836992563098",
  appId: "1:836992563098:web:1f465005f51b971366ec23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);