/**
 * gmailSender.js
 * Sends email via Gmail REST API using OAuth2 — no SMTP port needed.
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
const { sendViaGmail: sendViaGmailRest } = require('./emailSender');

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

  return sendViaGmailRest({ to, subject, html, text });
}

module.exports = { sendViaGmail, getGmailConfig };
