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
    subject: `${otp} is your Rancom Technologies verification code`,
    text: `Hello${displayName},\n\nYour Rancom Technologies verification code is ${otp}. It expires in ${minutes} minutes.\n\nIf you did not request this code, please ignore this email.`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 10px; background-color: #f6f9fc;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04); border: 1px solid #e2e8f0;">
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0e7490 0%, #0891b2 100%); padding: 32px 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">Rancom Technologies</h1>
              <p style="color: rgba(255, 255, 255, 0.85); margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">Secure Email Verification</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 32px; background-color: #ffffff;">
              <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Hello${displayName},</p>
              <p style="color: #475569; font-size: 14px; line-height: 22px; margin: 0 0 24px 0;">
                Thank you for applying to join Rancom Technologies. To complete your career registration, please use the 6-digit verification code below:
              </p>
              
              <!-- OTP Container -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px 10px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0891b2; display: inline-block; padding-left: 8px;">${otp}</span>
                  </td>
                </tr>
              </table>

              <!-- Notice Details -->
              <p style="color: #475569; font-size: 13px; line-height: 20px; margin: 24px 0 0 0;">
                ⏳ This verification code is valid for <strong>${minutes} minutes</strong>.
              </p>
              <p style="color: #64748b; font-size: 12px; line-height: 18px; margin: 16px 0 0 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                🛡️ <strong>Security Tip:</strong> If you did not request this verification code, please ignore this email. Your registration remains secure.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
              <p style="color: #94a3b8; font-size: 11px; line-height: 16px; margin: 0;">
                &copy; 2026 Rancom Technologies. All rights reserved.<br>
                This is an automated system email. Please do not reply directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  });

  return { devMode: false };
}

module.exports = { sendOtpEmail };
