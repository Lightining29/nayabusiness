require('dotenv').config({ path: 'backend/.env' });

const {
  sendEmail,
  getMailerPublicConfig,
  extractEmailAddress
} = require('./backend/utils/mailer');

const config = getMailerPublicConfig();
const smtpFrom = extractEmailAddress(process.env.SMTP_FROM);
const to = process.env.BREVO_TEST_TO || process.env.TEST_EMAIL || process.env.GMAIL_USER || smtpFrom;

const mask = (value) => {
  const raw = String(value || '');
  if (!raw) return '(not set)';
  if (raw.length <= 12) return 'configured';
  return `${raw.slice(0, 8)}...${raw.slice(-4)}`;
};

console.log('Mail provider:', config.provider || '(not set)');
console.log('Brevo REST configured:', config.brevo.configured);
console.log('SMTP host:', config.smtp.host || '(not set)');
console.log('SMTP user:', config.smtp.user || '(not set)');
console.log('SMTP pass:', mask(process.env.SMTP_PASS));
console.log('Test recipient:', to || '(not set)');

if (!['brevo', 'brevo-smtp'].includes(config.provider)) {
  console.log('\nBrevo is not the active provider. Set either:');
  console.log('  BREVO_API_KEY + BREVO_SENDER_EMAIL');
  console.log('  or SMTP_HOST=smtp-relay.brevo.com + SMTP_USER + SMTP_PASS + SMTP_FROM');
  process.exit(1);
}

if (!to) {
  console.log('\nSet BREVO_TEST_TO or TEST_EMAIL for the test recipient.');
  process.exit(1);
}

sendEmail({
  to,
  subject: 'Brevo email test - Rancom Technologies',
  html: '<h2>Brevo email is working</h2><p>Interview invitations will use the active Brevo provider.</p>',
  text: 'Brevo email is working. Interview invitations will use the active Brevo provider.'
})
  .then((result) => {
    console.log('\nBrevo email sent.');
    console.log('Provider:', result.delivery?.provider || config.provider);
    console.log('Message ID:', result.messageId || result.delivery?.messageId || 'n/a');
  })
  .catch((err) => {
    console.error('\nBrevo email failed:', err.message);
    process.exitCode = 1;
  });
