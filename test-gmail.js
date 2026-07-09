/**
 * Run this AFTER adding GMAIL_REFRESH_TOKEN to .env
 * node test-gmail.js
 */
require('dotenv').config({ path: 'backend/.env' });
const { sendViaGmail, getGmailConfig } = require('./backend/utils/gmailSender');

const cfg = getGmailConfig();
console.log('Gmail OAuth2 configured:', cfg.configured);
console.log('Gmail user:', cfg.user);
console.log('Has refresh token:', cfg.refreshToken.length > 0);

if (!cfg.configured) {
  console.log('\n❌ Not configured. Add GMAIL_REFRESH_TOKEN to .env first.');
  console.log('   Get it from: https://developers.google.com/oauthplayground');
  process.exit(1);
}

sendViaGmail({
  to: cfg.user,
  subject: 'Test Interview Email — Rancom Technologies',
  html: '<h2 style="color:#8b5cf6">✅ Gmail OAuth2 Works!</h2><p>Interview emails will now be delivered from Render.</p>',
  text: 'Gmail OAuth2 test email from Rancom Technologies'
})
.then(r => {
  console.log('\n✅ Email sent successfully!');
  console.log('   Message ID:', r.messageId);
  console.log('\nNow add these to Render Dashboard → Environment:');
  console.log('   GMAIL_CLIENT_ID    =', cfg.clientId);
  console.log('   GMAIL_CLIENT_SECRET= (already set)');
  console.log('   GMAIL_USER         =', cfg.user);
  console.log('   GMAIL_REFRESH_TOKEN= (copy from your .env)');
})
.catch(e => {
  console.error('\n❌ Failed:', e.message);
  console.log('\nMake sure you:');
  console.log('1. Enabled Gmail API in Google Cloud Console');
  console.log('2. Added https://developers.google.com/oauthplayground as OAuth redirect URI');
  console.log('3. Used the correct refresh token');
});
