importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey:
    "AIzaSyC-JvHTBwBr7sEHlHIliblGftkfWt5AgyY",

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
});

const messaging =
  firebase.messaging();

messaging.onBackgroundMessage(
  (payload) => {

    self.registration.showNotification(
      payload.notification.title,

      {
        body:
          payload.notification.body,

        icon: "/icon.png",
      }
    );
  }
);