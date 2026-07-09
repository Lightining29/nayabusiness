/**
 * emailSender.js
 * Sends email via multiple providers — tries each in order:
 * 1. Resend (https://resend.com) — free 3000 emails/month, pure HTTPS
 * 2. Gmail OAuth2 — pure HTTPS, no SMTP port
 * 3. SMTP fallback — local dev only
 */
const nodemailer = require('nodemailer');

// ── Resend ──────────────────────────────────────────────────────────────────
function resendConfigured() {
  return !!process.env.RESEND_API_KEY;
}

async function sendViaResend({ to, subject, html, text }) {
  const fetch = (...a) => import('node-fetch').then(({ default: f }) => f(...a));
  const from = process.env.RESEND_FROM || process.env.GMAIL_USER || 'onboarding@resend.dev';

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({ from, to, subject, html, text })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend: ${data.message || data.name || res.status}`);

  console.log(`[Resend] ✅ Sent to ${to} — ${data.id}`);
  return { devMode: false, messageId: data.id, delivery: { accepted: [to], rejected: [] } };
}

// ── Gmail OAuth2 ─────────────────────────────────────────────────────────────
function gmailConfigured() {
  return !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET &&
            process.env.GMAIL_REFRESH_TOKEN && process.env.GMAIL_USER);
}

async function sendViaGmail({ to, subject, html, text }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type:         'OAuth2',
      user:         process.env.GMAIL_USER,
      clientId:     process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    }
  });
  const from = `"${process.env.GMAIL_FROM_NAME || 'Rancom Technologies'}" <${process.env.GMAIL_USER}>`;
  const info = await transporter.sendMail({ from, to, subject, html, text: text || '' });
  console.log(`[Gmail OAuth2] ✅ Sent to ${to} — ${info.messageId}`);
  return { devMode: false, messageId: info.messageId, delivery: { accepted: [to], rejected: [] } };
}

function isConfigured() {
  return resendConfigured() || gmailConfigured();
}

async function sendEmail({ to, subject, html, text }) {
  // 1. Resend (best — free, HTTPS, works on all cloud platforms)
  if (resendConfigured()) {
    return sendViaResend({ to, subject, html, text });
  }

  // 2. Gmail OAuth2 (HTTPS, no SMTP port)
  if (gmailConfigured()) {
    return sendViaGmail({ to, subject, html, text });
  }

  // 3. Not configured
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[EMAIL DEV] No provider configured — logging only.\n  To: ${to}\n  Subject: ${subject}`);
    return { devMode: true };
  }

  throw new Error(
    'No email provider configured. ' +
    'Set RESEND_API_KEY (free at resend.com) in Render Environment Variables.'
  );
}

module.exports = { sendEmail, isConfigured, resendConfigured, gmailConfigured };
