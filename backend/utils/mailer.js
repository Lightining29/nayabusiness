const nodemailer = require('nodemailer');
const dns = require('dns');

// Force DNS lookup to prioritize IPv4 over IPv6. 
// This fixes connect ENETUNREACH IPv6 errors on cloud platforms like Render.
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

let transporter;

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: { user, pass }
    });
  }

  return transporter;
}

async function sendOtpEmail({ to, otp, name }) {
  const mailer = getTransporter();
  const displayName = name ? ` ${name}` : '';
  const minutes = Number(process.env.OTP_TTL_MINUTES || 10);

  if (!mailer) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Email verification OTP for ${to}: ${otp}`);
      return { devMode: true };
    }

    throw new Error('Email service is not configured');
  }

  await mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'Your Rancom Technologies verification code',
    text: `Hello${displayName},\n\nYour Rancom Technologies verification code is ${otp}. It expires in ${minutes} minutes.\n\nIf you did not request this code, ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin: 0 0 12px;">Verify your email</h2>
        <p>Hello${displayName},</p>
        <p>Your Rancom Technologies verification code is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 18px 0;">${otp}</p>
        <p>This code expires in ${minutes} minutes.</p>
        <p>If you did not request this code, ignore this email.</p>
      </div>
    `
  });

  return { devMode: false };
}

module.exports = { sendOtpEmail };
