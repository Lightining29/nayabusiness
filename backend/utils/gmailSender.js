/**
 * gmailSender.js
 * Sends email via Gmail using OAuth2 — no SMTP port needed.
 * Works on Render, Railway, Heroku — any cloud platform.
 *
 * Setup (one-time):
 * 1. Go to console.cloud.google.com → APIs → Gmail API → Enable
 * 2. Create OAuth2 credentials (Web App) — add https://developers.google.com/oauthplayground as redirect URI
 * 3. Go to https://developers.google.com/oauthplayground
 *    → Select Gmail API v1 → https://mail.google.com/ → Authorize → Exchange for tokens
 * 4. Copy Refresh Token
 * 5. Set these env vars:
 *    GMAIL_CLIENT_ID     = your client id
 *    GMAIL_CLIENT_SECRET = your client secret  
 *    GMAIL_REFRESH_TOKEN = refresh token from step 4
 *    GMAIL_USER          = your gmail address (brayw433@gmail.com)
 */
const nodemailer = require('nodemailer');

function getGmailConfig() {
  return {
    clientId:     process.env.GMAIL_CLIENT_ID     || '',
    clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
    refreshToken: process.env.GMAIL_REFRESH_TOKEN || '',
    user:         process.env.GMAIL_USER          || process.env.SMTP_USER || '',
    configured:   !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN && process.env.GMAIL_USER)
  };
}

async function sendViaGmail({ to, subject, html, text }) {
  const cfg = getGmailConfig();
  if (!cfg.configured) return null; // not configured, skip

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type:         'OAuth2',
      user:         cfg.user,
      clientId:     cfg.clientId,
      clientSecret: cfg.clientSecret,
      refreshToken: cfg.refreshToken
    }
  });

  const info = await transporter.sendMail({
    from:    `"Rancom Technologies" <${cfg.user}>`,
    to,
    subject,
    html,
    text: text || ''
  });

  console.log(`[Gmail OAuth2] ✅ Email sent to ${to} — messageId: ${info.messageId}`);
  return { devMode: false, messageId: info.messageId, delivery: { accepted: [to], rejected: [] } };
}

module.exports = { sendViaGmail, getGmailConfig };
