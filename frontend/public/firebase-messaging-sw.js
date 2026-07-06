// Firebase Cloud Messaging Service Worker
// Handles background push notifications when the website is closed or backgrounded.
// This file is served at /firebase-messaging-sw.js (root of the domain).

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ── Firebase config (hardcoded — safe, these are public keys) ─────────────────
firebase.initializeApp({
  apiKey:            'AIzaSyCuLWXlEZvND52GfzJJXXVhvKU_Ha5mfik',
  authDomain:        'rancom-technologies.firebaseapp.com',
  projectId:         'rancom-technologies',
  storageBucket:     'rancom-technologies.firebasestorage.app',
  messagingSenderId: '1089422502374',
  appId:             '1:1089422502374:web:fd33dc116d5103e670ce27',
});

const messaging = firebase.messaging();

// ── Background message handler ────────────────────────────────────────────────
// Fires when a push notification arrives while the tab is closed / hidden
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const title   = payload.notification?.title || 'Rancom Technologies';
  const body    = payload.notification?.body  || '';
  const icon    = payload.notification?.icon  || '/favicon.svg';
  const clickUrl = payload.data?.url          || 'https://www.rancomtechnologies.com/';

  self.registration.showNotification(title, {
    body,
    icon,
    badge:              '/favicon.svg',
    data:               { url: clickUrl },
    tag:                'rancom-push',      // replaces any existing notification
    requireInteraction: false,
    actions: [
      { action: 'open',    title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  });
});

// ── Notification click handler ─────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || 'https://www.rancomtechnologies.com/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing tab if already open
        for (const client of windowClients) {
          if (client.url.includes('rancomtechnologies.com') && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Otherwise open a new tab
        return clients.openWindow(url);
      })
  );
});
