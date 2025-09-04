// In public/firebase-messaging-sw.js
// Import the Firebase scripts for the v9 compatibility libraries
importScripts("https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.21.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker
// Use your actual Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyA8vuFRowcXFzk3_SaLcUk3qn4clhvz0VU",
  authDomain: "finadr-c216d.firebaseapp.com",
  projectId: "finadr-c216d",
  storageBucket: "finadr-c216d.appspot.com",
  messagingSenderId: "608681523529",
  appId: "1:608681523529:web:8f3bed536feada05224298",
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png' // Make sure you have this icon in your public folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
