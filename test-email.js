require('dotenv').config({ path: 'backend/.env' });
const { sendEmail, isConfigured } = require('./backend/utils/emailSender');

console.log('Gmail OAuth2 configured:', isConfigured());

if (!isConfigured()) {
  console.log('\nMissing env vars:');
  if (!process.env.GMAIL_CLIENT_ID)     console.log('  ❌ GMAIL_CLIENT_ID');
  if (!process.env.GMAIL_CLIENT_SECRET) console.log('  ❌ GMAIL_CLIENT_SECRET');
  if (!process.env.GMAIL_REFRESH_TOKEN) console.log('  ❌ GMAIL_REFRESH_TOKEN — get from https://developers.google.com/oauthplayground');
  if (!process.env.GMAIL_USER)          console.log('  ❌ GMAIL_USER');
  process.exit(1);
}

sendEmail({
  to: process.env.GMAIL_USER,
  subject: '✅ Gmail OAuth2 Works — Rancom Technologies',
  html: '<h2 style="color:#8b5cf6">Email is working on Render!</h2><p>Gmail OAuth2 is correctly configured.</p>',
  text: 'Gmail OAuth2 test — Rancom Technologies'
})
.then(r => {
  console.log('\n✅ Email sent!', r.messageId);
  console.log('\nNow add these to Render → Environment:');
  console.log('  GMAIL_CLIENT_ID    =', process.env.GMAIL_CLIENT_ID);
  console.log('  GMAIL_CLIENT_SECRET=', process.env.GMAIL_CLIENT_SECRET);
  console.log('  GMAIL_USER         =', process.env.GMAIL_USER);
  console.log('  GMAIL_FROM_NAME    = Rancom Technologies');
  console.log('  GMAIL_REFRESH_TOKEN=', process.env.GMAIL_REFRESH_TOKEN);
})
.catch(e => console.error('\n❌ Failed:', e.message));
