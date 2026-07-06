const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const FcmToken = require('../models/FcmToken');

// ─── Initialize Firebase Admin SDK (singleton) ───────────────────────────────
function getAdminApp() {
  if (admin.apps.length > 0) return admin.apps[0];

  try {
    let credential;

    // Option 1: Full JSON string in FIREBASE_SERVICE_ACCOUNT
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(sa);

    // Option 2: Individual env vars (used in this project)
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      credential = admin.credential.cert({
        type:          'service_account',
        project_id:    process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
        private_key:   process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email:  process.env.FIREBASE_CLIENT_EMAIL,
        client_id:     process.env.FIREBASE_CLIENT_ID || '',
        auth_uri:      'https://accounts.google.com/o/oauth2/auth',
        token_uri:     'https://oauth2.googleapis.com/token',
      });

    } else {
      console.error('[FCM] No Firebase credentials found in environment variables.');
      return null;
    }

    return admin.initializeApp({ credential });
  } catch (err) {
    console.error('[FCM] Firebase Admin init error:', err.message);
    return null;
  }
}

// ─── Save / refresh FCM token ─────────────────────────────────────────────────
// POST /api/notifications/token
router.post('/token', async (req, res) => {
  const { token, userId, topics } = req.body;
  if (!token) return res.status(400).json({ error: 'FCM token is required.' });

  try {
    await FcmToken.findOneAndUpdate(
      { token },
      {
        token,
        userId: userId || null,
        userAgent: req.headers['user-agent'] || '',
        topics: topics || ['all'],
        active: true,
        lastSeenAt: new Date()
      },
      { upsert: true, new: true }
    );
    return res.json({ success: true, message: 'Token saved.' });
  } catch (err) {
    console.error('[FCM] Token save error:', err);
    return res.status(500).json({ error: 'Failed to save token.' });
  }
});

// ─── Remove FCM token (user unsubscribed) ─────────────────────────────────────
// DELETE /api/notifications/token
router.delete('/token', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token is required.' });
  try {
    await FcmToken.findOneAndUpdate({ token }, { active: false });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove token.' });
  }
});

// ─── Get subscriber count (admin) ─────────────────────────────────────────────
// GET /api/notifications/stats
router.get('/stats', async (req, res) => {
  try {
    const total  = await FcmToken.countDocuments({ active: true });
    return res.json({ total });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// ─── Send notification (admin only) ──────────────────────────────────────────
// POST /api/notifications/send
// Body: { title, body, icon, url, topic }
// topic = 'all' sends to all active tokens (batch)
router.post('/send', async (req, res) => {
  // Simple admin auth check via header
  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== (process.env.ADMIN_PASSWORD || 'rancom@2026')) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const {
    title = 'Rancom Technologies',
    body  = '',
    icon  = '/favicon.svg',
    url   = 'https://www.rancomtechnologies.com/',
    topic = 'all'
  } = req.body;

  if (!body) return res.status(400).json({ error: 'Notification body is required.' });

  const firebaseApp = getAdminApp();
  if (!firebaseApp) {
    return res.status(503).json({ error: 'Firebase Admin not configured. Add FIREBASE_SERVICE_ACCOUNT to env vars.' });
  }

  try {
    // Fetch active tokens
    const query = topic === 'all' ? { active: true } : { active: true, topics: topic };
    const tokenDocs = await FcmToken.find(query).select('token').lean();

    if (tokenDocs.length === 0) {
      return res.json({ success: true, sent: 0, message: 'No active subscribers.' });
    }

    const tokens = tokenDocs.map(t => t.token);

    // FCM allows max 500 tokens per multicast call
    const CHUNK = 500;
    let successCount = 0;
    let failCount = 0;
    const invalidTokens = [];

    for (let i = 0; i < tokens.length; i += CHUNK) {
      const chunk = tokens.slice(i, i + CHUNK);
      const message = {
        tokens: chunk,
        notification: { title, body, imageUrl: icon },
        webpush: {
          fcmOptions: { link: url },
          notification: {
            title,
            body,
            icon,
            badge: '/favicon.svg',
            requireInteraction: false,
            data: { url }
          }
        },
        data: { url, title, body }
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      successCount += response.successCount;
      failCount    += response.failureCount;

      // Collect invalid / expired tokens to deactivate
      response.responses.forEach((r, idx) => {
        if (!r.success) {
          const code = r.error?.code || '';
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            invalidTokens.push(chunk[idx]);
          }
        }
      });
    }

    // Deactivate stale tokens
    if (invalidTokens.length > 0) {
      await FcmToken.updateMany(
        { token: { $in: invalidTokens } },
        { active: false }
      );
    }

    return res.json({
      success: true,
      sent: successCount,
      failed: failCount,
      deactivated: invalidTokens.length,
      message: `Notification sent to ${successCount} subscriber(s).`
    });

  } catch (err) {
    console.error('[FCM] Send error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send notification.' });
  }
});

module.exports = router;
