import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
  getMessaging,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyC-JvHTBwBr7sEHlHIliblGftkfWt5AgyY",
  authDomain:
    "notification-system-26f48.firebaseapp.com",
  projectId:
    "notification-system-26f48",
  storageBucket:
    "notification-system-26f48.firebasestorage.app",
  messagingSenderId:
    "149884084945",
  appId:
    "1:149884084945:web:62534eefb5eee2cdb9dbf0",
  measurementId:
    "G-FELTDFDPXJ",
};

const app =
  initializeApp(firebaseConfig);

export const messaging =
  getMessaging(app);