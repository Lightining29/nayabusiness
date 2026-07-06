import { useState, useEffect, useCallback } from 'react';
import { requestNotificationPermission, onForegroundMessage } from './firebase';

const TOKEN_KEY = 'fcm_token';

export function usePushNotifications() {
  const [permission, setPermission]   = useState(Notification?.permission || 'default');
  const [token, setToken]             = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading]         = useState(false);
  const [foregroundMsg, setForegroundMsg] = useState(null);

  // Save token to backend
  const saveTokenToServer = useCallback(async (fcmToken) => {
    try {
      await fetch('/api/notifications/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: fcmToken,
          userId: null, // optionally pass logged-in user id
          topics: ['all']
        })
      });
    } catch (err) {
      console.error('[FCM] Failed to save token to server:', err);
    }
  }, []);

  // Subscribe: request permission + get token
  const subscribe = useCallback(async () => {
    setLoading(true);
    try {
      const fcmToken = await requestNotificationPermission();
      if (fcmToken) {
        setToken(fcmToken);
        setPermission('granted');
        localStorage.setItem(TOKEN_KEY, fcmToken);
        await saveTokenToServer(fcmToken);
        return true;
      } else {
        setPermission(Notification?.permission || 'denied');
        return false;
      }
    } finally {
      setLoading(false);
    }
  }, [saveTokenToServer]);

  // Unsubscribe
  const unsubscribe = useCallback(async () => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      try {
        await fetch('/api/notifications/token', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: stored })
        });
      } catch { /* silent */ }
      localStorage.removeItem(TOKEN_KEY);
    }
    setToken(null);
    setPermission('default');
  }, []);

  // Auto-restore token on mount if already granted
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored && Notification?.permission === 'granted') {
      setPermission('granted');
      setToken(stored);
      saveTokenToServer(stored);
    }
  }, [saveTokenToServer]);

  // Listen for foreground messages
  useEffect(() => {
    const unsub = onForegroundMessage((msg) => {
      setForegroundMsg(msg);
      // Show browser notification manually for foreground
      if (Notification?.permission === 'granted') {
        new Notification(msg.title || 'Rancom Technologies', {
          body:  msg.body,
          icon:  msg.icon || '/favicon.svg',
          badge: '/favicon.svg',
          tag:   'rancom-fg'
        });
      }
    });
    return unsub;
  }, []);

  return {
    permission,   // 'default' | 'granted' | 'denied'
    token,        // FCM token string or null
    loading,      // requesting permission
    foregroundMsg,// last foreground message received
    subscribe,    // call to request permission & register
    unsubscribe,  // call to opt out
    isSupported:  'Notification' in window && 'serviceWorker' in navigator,
  };
}
