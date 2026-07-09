/**
 * emailSender.js
 * Sends email via multiple providers — tries each in order:
 * 1. Resend (https://resend.com) — free 3000 emails/month, pure HTTPS
 * 2. Gmail REST API with OAuth2 — pure HTTPS, no SMTP port
 * 3. SMTP fallback — local dev only
 */
const fetch = (...a) => import('node-fetch').then(({ default: f }) => f(...a));

function getTimeoutMs() {
  const timeout = Number(process.env.EMAIL_SEND_TIMEOUT_MS || 15000);
  return Number.isFinite(timeout) && timeout > 0 ? timeout : 15000;
}

async function timedFetch(url, options, provider) {
  const controller = new AbortController();
  const timeoutMs = getTimeoutMs();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`${provider} timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

function cleanHeader(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

function encodeHeader(value) {
  const clean = cleanHeader(value);
  return /^[\x00-\x7F]*$/.test(clean)
    ? clean
    : `=?UTF-8?B?${Buffer.from(clean, 'utf8').toString('base64')}?=`;
}

function formatAddress(name, email) {
  const cleanEmail = cleanHeader(email);
  const cleanName = cleanHeader(name).replace(/"/g, '');
  return cleanName ? `"${cleanName}" <${cleanEmail}>` : cleanEmail;
}

function encodeBase64Url(value) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

// ── Resend ──────────────────────────────────────────────────────────────────
function resendConfigured() {
  return !!process.env.RESEND_API_KEY;
}

async function sendViaResend({ to, subject, html, text }) {
  const from = process.env.RESEND_FROM || process.env.GMAIL_USER || 'onboarding@resend.dev';

  const res = await timedFetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({ from, to, subject, html, text })
  }, 'Resend');

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
  const tokenRes = await timedFetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      grant_type:    'refresh_token'
    })
  }, 'Gmail OAuth');

  const tokenData = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || !tokenData.access_token) {
    const reason = [tokenData.error, tokenData.error_description].filter(Boolean).join(': ') || tokenRes.status;
    throw new Error(`Gmail OAuth: ${reason}`);
  }

  const boundary = `rancom_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const from = formatAddress(process.env.GMAIL_FROM_NAME || 'Rancom Technologies', process.env.GMAIL_USER);
  const rawMessage = [
    `From: ${from}`,
    `To: ${cleanHeader(to)}`,
    `Subject: ${encodeHeader(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    text || '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    html || '',
    `--${boundary}--`,
    ''
  ].join('\r\n');

  const sendRes = await timedFetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Content-Type':  'application/json'
    },
    body: JSON.stringify({ raw: encodeBase64Url(rawMessage) })
  }, 'Gmail API');

  const data = await sendRes.json().catch(() => ({}));
  if (!sendRes.ok) {
    const detail = data?.error?.message || data?.message || sendRes.status;
    throw new Error(`Gmail API: ${detail}`);
  }

  console.log(`[Gmail API] ✅ Sent to ${to} — ${data.id}`);
  return {
    devMode: false,
    messageId: data.id,
    delivery: { accepted: [to], rejected: [], provider: 'gmail-api' }
  };
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
    'Set RESEND_API_KEY, or set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, and GMAIL_USER.'
  );
}

module.exports = {
  sendEmail,
  sendViaGmail,
  isConfigured,
  resendConfigured,
  gmailConfigured
};
