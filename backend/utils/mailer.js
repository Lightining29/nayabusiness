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

module.exports = { sendOtpEmail, sendTestInviteEmail, sendInterviewEmail };

async function sendInterviewEmail({ to, name, position, interviewDate, interviewTime, mode, location, meetLink, interviewers, notes }) {
  const mailer = getTransporter();
  const displayName = name || 'Candidate';
  const dateStr = interviewDate ? new Date(interviewDate).toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : interviewDate;
  const modeLabel = { online:'Online (Video Call)', offline:'In-Person', phone:'Phone Interview' }[mode] || mode;

  if (!mailer) {
    console.log(`[INTERVIEW INVITE] To: ${to} | Date: ${interviewDate} ${interviewTime} | Mode: ${mode}`);
    return { devMode: true };
  }

  await mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `Interview Invitation — ${position} | Rancom Technologies`,
    text: `Hello ${displayName},\n\nYou are invited for an interview at Rancom Technologies.\n\nPosition: ${position}\nDate: ${dateStr}\nTime: ${interviewTime}\nMode: ${modeLabel}\n${location ? `Location: ${location}\n` : ''}${meetLink ? `Meeting Link: ${meetLink}\n` : ''}${interviewers ? `Interviewer(s): ${interviewers}\n` : ''}${notes ? `Notes: ${notes}\n` : ''}\nBest regards,\nHR Team — Rancom Technologies Pvt Ltd`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f6f9fc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;">
<tr><td align="center" style="padding:40px 12px;background:#f6f9fc;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.1);border:1px solid #e2e8f0;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e40af 60%,#0ea5e9 100%);padding:36px 32px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">Rancom Technologies</h1>
    <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;font-weight:500;">Human Resources · Recruitment</p>
  </td></tr>

  <!-- Congratulations banner -->
  <tr><td style="background:linear-gradient(135deg,#fdf4ff,#fae8ff);padding:18px 32px;border-bottom:1px solid #e9d5ff;">
    <p style="margin:0;font-size:15px;font-weight:800;color:#6b21a8;">🎉 Congratulations, ${displayName}!</p>
    <p style="margin:6px 0 0;font-size:13px;color:#7c3aed;">You have been shortlisted for an interview at Rancom Technologies Pvt Ltd.</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:32px 32px 28px;">
    <p style="color:#1e293b;font-size:14px;line-height:22px;margin:0 0 24px;">
      We are pleased to invite you for the <strong>${position}</strong> interview. Please find the details below:
    </p>

    <!-- Interview details card -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <tr><td style="background:#f8fafc;padding:14px 20px;border-bottom:1px solid #e2e8f0;">
        <p style="margin:0;font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">📋 Position</p>
        <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#0f172a;">${position}</p>
      </td></tr>
      <tr><td style="padding:0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="50%" style="padding:14px 20px;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">📅 Date</p>
              <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#0f172a;">${dateStr}</p>
            </td>
            <td width="50%" style="padding:14px 20px;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">⏰ Time</p>
              <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#0f172a;">${interviewTime}</p>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding:14px 20px;${(location || meetLink) ? 'border-bottom:1px solid #e2e8f0;' : ''}">
              <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">💻 Mode</p>
              <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#0f172a;">${modeLabel}</p>
            </td>
          </tr>
          ${location ? `<tr><td colspan="2" style="padding:14px 20px;${meetLink ? 'border-bottom:1px solid #e2e8f0;' : ''}">
            <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">📍 Location</p>
            <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#0f172a;">${location}</p>
          </td></tr>` : ''}
          ${meetLink ? `<tr><td colspan="2" style="padding:14px 20px;">
            <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">🔗 Meeting Link</p>
            <a href="${meetLink}" style="display:inline-block;margin-top:6px;padding:8px 18px;background:linear-gradient(135deg,#0ea5e9,#0369a1);color:white;font-size:13px;font-weight:700;text-decoration:none;border-radius:8px;">Join Meeting</a>
          </td></tr>` : ''}
        </table>
      </td></tr>
    </table>

    ${interviewers ? `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;"><tr><td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 20px;">
      <p style="margin:0;font-size:11px;font-weight:700;color:#166534;text-transform:uppercase;">👤 Interviewer(s)</p>
      <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#14532d;">${interviewers}</p>
    </td></tr></table>` : ''}

    ${notes ? `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;"><tr><td style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 20px;">
      <p style="margin:0;font-size:11px;font-weight:700;color:#c2410c;text-transform:uppercase;">📝 Additional Notes</p>
      <p style="margin:6px 0 0;font-size:13px;color:#7c2d12;line-height:20px;">${notes}</p>
    </td></tr></table>` : ''}

    <!-- Tips -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;"><tr><td style="background:#f1f5f9;border-radius:10px;padding:16px 20px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:800;color:#475569;text-transform:uppercase;">💡 Preparation Tips</p>
      <ul style="margin:0;padding-left:18px;color:#475569;font-size:13px;line-height:22px;">
        <li>Research Rancom Technologies and our services</li>
        <li>Review your resume and be ready to discuss your experience</li>
        <li>${mode === 'online' ? 'Test your camera, microphone, and internet connection before the call' : 'Arrive 10 minutes early at the venue'}</li>
        <li>Prepare questions to ask the interviewer</li>
      </ul>
    </td></tr></table>

    <p style="color:#64748b;font-size:13px;line-height:20px;margin:0;">
      To confirm or reschedule, reply to this email or contact HR at
      <a href="mailto:${process.env.SMTP_USER}" style="color:#0ea5e9;font-weight:600;">${process.env.SMTP_USER}</a>.
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td align="center" style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;">
    <p style="color:#94a3b8;font-size:11px;margin:0;line-height:18px;">
      © 2026 Rancom Technologies Pvt Ltd · Group of Appletree Infotech<br>
      This is an automated HR email. Please do not reply directly to this address.
    </p>
  </td></tr>
</table></td></tr></table>
</body></html>`
  });
  return { devMode: false };
}

async function sendTestInviteEmail({ to, name, assessmentTitle, accessCode, testUrl, duration, expiresAt }) {
  const mailer = getTransporter();
  const displayName = name ? name : 'Candidate';
  const expiryStr = expiresAt ? new Date(expiresAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }) : 'No expiry';

  if (!mailer) {
    console.log(`[TEST INVITE] To: ${to} | Code: ${accessCode} | URL: ${testUrl}`);
    return { devMode: true };
  }

  await mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `You're invited to take the ${assessmentTitle} — Rancom Technologies`,
    text: `Hello ${displayName},\n\nYou have been invited to take the online assessment: ${assessmentTitle}.\n\nTest URL: ${testUrl}\nAccess Code: ${accessCode}\nDuration: ${duration} minutes\nExpiry: ${expiryStr}\n\nRancom Technologies Pvt Ltd`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f6f9fc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;">
  <tr><td align="center" style="padding:40px 10px;background:#f6f9fc;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.08);border:1px solid #e2e8f0;">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e40af 100%);padding:36px 32px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;">Rancom Technologies</h1>
        <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Online Assessment Invitation</p>
      </td></tr>

      <!-- Congrats banner -->
      <tr><td style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);padding:20px 32px;border-bottom:1px solid #a7f3d0;">
        <p style="margin:0;color:#065f46;font-size:15px;font-weight:700;">🎉 Congratulations, ${displayName}!</p>
        <p style="margin:6px 0 0;color:#047857;font-size:13px;">You have been shortlisted for the next round of selection.</p>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:36px 32px;">
        <p style="color:#1e293b;font-size:15px;margin:0 0 8px;font-weight:600;">Your Assessment Details</p>
        <p style="color:#475569;font-size:14px;line-height:22px;margin:0 0 28px;">
          Please complete the online assessment below at your earliest convenience. Read the instructions carefully before starting.
        </p>

        <!-- Test Name -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
          <tr><td style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:16px 20px;">
            <p style="margin:0;font-size:12px;color:#0369a1;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Assessment</p>
            <p style="margin:4px 0 0;font-size:17px;font-weight:800;color:#0f172a;">${assessmentTitle}</p>
          </td></tr>
        </table>

        <!-- Access Code -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
          <tr><td style="background:#fef3c7;border:2px dashed #f59e0b;border-radius:12px;padding:20px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#92400e;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Your Access Code</p>
            <p style="margin:8px 0 0;font-family:'Courier New',monospace;font-size:36px;font-weight:900;color:#d97706;letter-spacing:12px;">${accessCode}</p>
            <p style="margin:8px 0 0;font-size:11px;color:#b45309;">Keep this code safe. Do not share it.</p>
          </td></tr>
        </table>

        <!-- Details grid -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
          <tr>
            <td width="50%" style="padding-right:8px;">
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
                <p style="margin:0;font-size:11px;color:#94a3b8;font-weight:600;">⏱ DURATION</p>
                <p style="margin:4px 0 0;font-size:15px;font-weight:800;color:#0f172a;">${duration} minutes</p>
              </div>
            </td>
            <td width="50%" style="padding-left:8px;">
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
                <p style="margin:0;font-size:11px;color:#94a3b8;font-weight:600;">📅 EXPIRES</p>
                <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#0f172a;">${expiryStr}</p>
              </div>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
          <tr><td align="center">
            <a href="${testUrl}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#0ea5e9,#0369a1);color:#ffffff;font-size:15px;font-weight:800;text-decoration:none;border-radius:12px;box-shadow:0 4px 15px rgba(14,165,233,0.4);">
              🚀 Start My Assessment
            </a>
          </td></tr>
        </table>

        <!-- Instructions -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;">
          <tr><td style="background:#fef9f0;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:800;color:#c2410c;text-transform:uppercase;">⚠️ Important Instructions</p>
            <ul style="margin:0;padding-left:18px;color:#7c2d12;font-size:13px;line-height:22px;">
              <li>Use the test URL above and enter your email + access code</li>
              <li>Do not switch tabs or open other windows during the test</li>
              <li>Right-click and copy-paste are disabled</li>
              <li>Ensure a stable internet connection before starting</li>
              <li>Complete the test in one sitting — you cannot pause</li>
            </ul>
          </td></tr>
        </table>

        <p style="color:#64748b;font-size:13px;line-height:20px;margin:0;">
          If you have any questions, reply to this email or contact us at <a href="mailto:${process.env.SMTP_USER}" style="color:#0ea5e9;">${process.env.SMTP_USER}</a>.
        </p>
      </td></tr>

      <!-- Footer -->
      <tr><td align="center" style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;">
        <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 Rancom Technologies Pvt Ltd · Group of Appletree Infotech<br>This is an automated email. Please do not reply directly.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
  });

  return { devMode: false };
}
