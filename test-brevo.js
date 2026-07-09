require('dotenv').config({ path: 'backend/.env' });

const {
  sendEmail,
  getMailerPublicConfig,
  getMailerErrorMessage,
  extractEmailAddress
} = require('./backend/utils/mailer');

const config = getMailerPublicConfig();
const smtpFrom = extractEmailAddress(process.env.SMTP_FROM);
const to = process.env.BREVO_TEST_TO || process.env.TEST_EMAIL || smtpFrom;

const mask = (value) => {
  const raw = String(value || '');
  if (!raw) return '(not set)';
  if (raw.includes('@')) {
    const [local, domain] = raw.split('@');
    return `${local.slice(0, 2)}***@${domain}`;
  }
  if (raw.length <= 12) return 'configured';
  return `${raw.slice(0, 8)}...${raw.slice(-4)}`;
};

console.log('Mail provider:', config.provider || '(not set)');
console.log('SMTP host:', config.smtp.host || '(not set)');
console.log('SMTP user:', config.smtp.user || '(not set)');
console.log('SMTP pass:', mask(process.env.SMTP_PASS));
console.log('Test recipient:', to || '(not set)');

if (config.provider !== 'brevo-smtp' && config.provider !== 'brevo') {
  console.log('\nBrevo is not the active provider. Set:');
  console.log('  SMTP_HOST=smtp-relay.brevo.com');
  console.log('  SMTP_PORT=587');
  console.log('  SMTP_SECURE=false');
  console.log('  SMTP_USER=<Brevo SMTP login>');
  console.log('  SMTP_PASS=<Brevo SMTP key>');
  console.log('  SMTP_FROM=<verified Brevo sender>');
  process.exit(1);
}

if (!to) {
  console.log('\nSet BREVO_TEST_TO or TEST_EMAIL for the test recipient.');
  process.exit(1);
}

sendEmail({
  to,
  subject: 'Brevo email test - Rancom Technologies',
  html: '<h2>Brevo email is working</h2><p>Interview invitations now use only Brevo.</p>',
  text: 'Brevo email is working. Interview invitations now use only Brevo.'
})
  .then((result) => {
    console.log('\nBrevo email sent.');
    console.log('Provider:', result.delivery?.provider || config.provider);
    console.log('Message ID:', result.messageId || result.delivery?.messageId || 'n/a');
  })
  .catch((err) => {
    console.error('\nBrevo email failed:', getMailerErrorMessage(err));
    process.exitCode = 1;
  });
