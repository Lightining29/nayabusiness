import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            'AIzaSyCuLWXlEZvND52GfzJJXXVhvKU_Ha5mfik',
  authDomain:        'rancom-technologies.firebaseapp.com',
  projectId:         'rancom-technologies',
  storageBucket:     'rancom-technologies.firebasestorage.app',
  messagingSenderId: '1089422502374',
  appId:             '1:1089422502374:web:fd33dc116d5103e670ce27',
  measurementId:     'G-H8615QQ4N2',
};

export const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  'BEYOlrDB5RMESOkRZXf2Ac04iH3ukokV9YFCuKCq8DnAn5zptUQ0yADjXU2Q9Y3U7U6XvMIJACmg8yd4kxJmJEA';

let app;
let messaging;

function getFirebaseApp() {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseMessaging() {
  if (!messaging) {
    try {
      messaging = getMessaging(getFirebaseApp());
    } catch (e) {
      console.warn('Firebase Messaging init failed:', e.message);
      return null;
    }
  }
  return messaging;
}

/**
 * Request notification permission and get FCM token.
 * Returns the token string, or null if denied / unsupported.
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications.');
    return null;
  }

  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied.');
      return null;
    }

    // Register the Firebase service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const msg = getFirebaseMessaging();
    if (!msg) return null;

    const token = await getToken(msg, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('FCM Token:', token);
      return token;
    }

    console.warn('No FCM token received.');
    return null;
  } catch (err) {
    console.error('FCM token error:', err);
    return null;
  }
}

/**
 * Listen for foreground messages (when the site is open).
 * callback receives { title, body, icon, data }
 */
export function onForegroundMessage(callback) {
  const msg = getFirebaseMessaging();
  if (!msg) return () => {};
  return onMessage(msg, (payload) => {
    const { title, body, icon } = payload.notification || {};
    callback({ title, body, icon, data: payload.data });
  });
}
