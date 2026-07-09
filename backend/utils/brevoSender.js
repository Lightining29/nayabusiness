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

function getTimeoutMs() {
  const timeout = Number(process.env.EMAIL_SEND_TIMEOUT_MS || 15000);
  return Number.isFinite(timeout) && timeout > 0 ? timeout : 15000;
}

function getBrevoConfig() {
  const apiKey = String(process.env.BREVO_API_KEY || '').trim();
  const senderEmail = String(process.env.BREVO_SENDER_EMAIL || '').trim();
  const senderName = String(process.env.BREVO_SENDER_NAME || 'Rancom Technologies').trim();
  return {
    apiKey,
    senderEmail,
    senderName,
    configured: Boolean(apiKey && senderEmail)
  };
}

/**
 * Send email via Brevo HTTP REST API (HTTPS port 443).
 * Works on Render, Heroku, Railway — no port blocking issues.
 */
async function sendViaBrevo({ to, subject, html, text }) {
  const cfg = getBrevoConfig();

  if (!cfg.configured) {
    if (cfg.apiKey || cfg.senderEmail) {
      const missing = [
        cfg.apiKey ? null : 'BREVO_API_KEY',
        cfg.senderEmail ? null : 'BREVO_SENDER_EMAIL'
      ].filter(Boolean).join(' and ');
      throw new Error(`${missing} must be set to send through Brevo.`);
    }
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

  const controller = new AbortController();
  const timeoutMs = getTimeoutMs();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(BREVO_API, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key':       cfg.apiKey,
        'Accept':        'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Brevo API timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || data?.error || `Brevo API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Brevo API authentication failed: ${msg}. Check BREVO_API_KEY and verify BREVO_SENDER_EMAIL in Brevo.`);
    }
    throw new Error(`Brevo API: ${msg}`);
  }

  console.log(`[Brevo] ✅ Email sent to ${to} — messageId: ${data.messageId || 'n/a'}`);
  return { devMode: false, messageId: data.messageId, delivery: { accepted: [to], rejected: [], provider: 'brevo' } };
}

module.exports = { sendViaBrevo, getBrevoConfig };
