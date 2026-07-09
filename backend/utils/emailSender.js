'use strict';

/**
 * emailSender.js
 * Sends email via Brevo REST API (HTTPS port 443).
 * Works on Render — no SMTP port blocking issues.
 * Requires: BREVO_API_KEY (xkeysib-...), BREVO_SENDER_EMAIL
 */
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

function isConfigured() {
  const key = process.env.BREVO_API_KEY || '';
  return key.startsWith('xkeysib-') && key.length > 20 && !!process.env.BREVO_SENDER_EMAIL;
}

async function sendEmail({ to, subject, html, text }) {
  const key   = process.env.BREVO_API_KEY || '';
  const from  = process.env.BREVO_SENDER_EMAIL || '';
  const name  = process.env.BREVO_SENDER_NAME  || 'Rancom Technologies';

  if (!isConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[EMAIL DEV] BREVO_API_KEY not set — logging only.\n  To: ${to}\n  Subject: ${subject}`);
      return { devMode: true };
    }
    throw new Error('Email not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL in Render Environment Variables.');
  }

  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key':       key,
      'Accept':        'application/json'
    },
    body: JSON.stringify({
      sender:      { name, email: from },
      to:          [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text || ''
    })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(`Brevo: ${data.message || data.code || `HTTP ${res.status}`}`);
  }

  console.log(`[Brevo] ✅ Email sent to ${to} — messageId: ${data.messageId}`);
  return { devMode: false, messageId: data.messageId, delivery: { accepted: [to], rejected: [] } };
}

module.exports = { sendEmail, isConfigured };
