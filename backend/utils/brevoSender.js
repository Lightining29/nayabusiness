/**
 * brevoSender.js
 * Sends emails via Brevo (Sendinblue) REST API — port 443 HTTPS.
 * Requires BREVO_API_KEY (xkeysib-... format from Brevo Console > API Keys).
 * NOT the SMTP password (xsmtpsib-...).
 *
 * Get your REST API key:
 *   Brevo Console → Settings → API Keys → Generate new API key
 *   The key starts with: xkeysib-
 */
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

function getBrevoConfig() {
  const apiKey = String(process.env.BREVO_API_KEY || '').trim();
  const senderEmail = String(process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || '').trim();
  const senderName = String(process.env.BREVO_SENDER_NAME || 'Rancom Technologies').trim();
  // Accept both REST key (xkeysib-) AND SMTP key (xsmtpsib-) — Brevo API accepts both
  const isValidKey = (apiKey.startsWith('xkeysib-') || apiKey.startsWith('xsmtpsib-')) && apiKey.length > 20;
  return {
    apiKey,
    senderEmail,
    senderName,
    configured: isValidKey && Boolean(senderEmail)
  };
}

/**
 * Send email via Brevo HTTP REST API (HTTPS port 443).
 * Works on Render, Heroku, Railway — no port blocking issues.
 */
async function sendViaBrevo({ to, subject, html, text }) {
  const cfg = getBrevoConfig();

  if (!cfg.configured) {
    console.warn('[Brevo] Not configured — skipping');
    return null; // let caller try next provider
  }

  const payload = {
    sender:      { name: cfg.senderName, email: cfg.senderEmail },
    to:          [{ email: to }],
    subject,
    htmlContent: html,
    textContent: text || '',
  };

  const res = await fetch(BREVO_API, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key':       cfg.apiKey,
      'Accept':        'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || data?.error || `Brevo API error ${res.status}`;
    // On auth failure — return null so caller falls through to Gmail
    if (res.status === 401 || res.status === 403) {
      console.warn(`[Brevo] Auth failed (${msg}) — trying next provider`);
      return null;
    }
    throw new Error(`Brevo API: ${msg}`);
  }

  console.log(`[Brevo] ✅ Email sent to ${to} — messageId: ${data.messageId || 'n/a'}`);
  return { devMode: false, messageId: data.messageId, delivery: { accepted: [to], rejected: [] } };
}

module.exports = { sendViaBrevo, getBrevoConfig };
