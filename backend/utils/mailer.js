'use strict';

const nodemailer = require('nodemailer');
const dns = require('dns');

// Force DNS lookups to prefer IPv4 — prevents hangs on dual-stack hosts.
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// ---------------------------------------------------------------------------
// SMTP config helpers
// ---------------------------------------------------------------------------

function getSmtpConfig() {
  const host = String(process.env.SMTP_HOST || '').trim();
  const user = String(process.env.SMTP_USER || '').trim();
  // Strip spaces from Gmail App Passwords (e.g. "yfdi eyxh hngp wfnw" → "yfdieyxhhngpwfnw")
  const pass = String(process.env.SMTP_PASS || '').replace(/\s/g, '');
  const fromName = String(process.env.SMTP_FROM_NAME || 'Rancom Technologies').trim();
  const rawFrom = String(process.env.SMTP_FROM || '').trim();
  const rawReplyTo = String(process.env.SMTP_REPLY_TO || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;
  const rejectUnauthorized = process.env.SMTP_TLS_REJECT_UNAUTHORIZED
    ? process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'
    : process.env.NODE_ENV === 'production';

  const smtpFromAddress = extractEmailAddress(rawFrom);
  const isGmailSmtp =
    /(^|\.)gmail\.com$/i.test(host) || /(^|\.)googlemail\.com$/i.test(host);
  const useAuthenticatedFrom =
    isGmailSmtp && smtpFromAddress && smtpFromAddress !== user.toLowerCase();

  const from = useAuthenticatedFrom
    ? formatEmailAddress(fromName, user)
    : rawFrom || formatEmailAddress(fromName, user);

  const replyTo = rawReplyTo || (useAuthenticatedFrom ? rawFrom : '');

  return {
    host, user, pass, from, replyTo,
    port, secure, rejectUnauthorized,
    configured: Boolean(host && user && pass)
  };
}

function extractEmailAddress(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const bracketMatch = raw.match(/<([^>]+)>/);
  const address = bracketMatch ? bracketMatch[1] : raw;
  return address.replace(/^mailto:/i, '').trim().toLowerCase();
}

function formatEmailAddress(name, address) {
  const cleanAddress = String(address || '').trim();
  const cleanName = String(name || '').replace(/"/g, '').trim();
  return cleanName ? `"${cleanName}" <${cleanAddress}>` : cleanAddress;
}

function maskEmail(email) {
  const value = String(email || '').trim();
  const [local, domain] = value.split('@');
  if (!local || !domain) return value ? 'configured' : null;
  const visible = local.length <= 2 ? local[0] : `${local[0]}${local.slice(-1)}`;
  return `${visible}***@${domain}`;
}

function summarizeMailInfo(info = {}) {
  return {
    messageId: info.messageId,
    accepted:  Array.isArray(info.accepted)  ? info.accepted  : [],
    rejected:  Array.isArray(info.rejected)  ? info.rejected  : [],
    pending:   Array.isArray(info.pending)   ? info.pending   : [],
    response:  info.response
  };
}

function getFromAddress()    { return getSmtpConfig().from; }
function getReplyToAddress() { return getSmtpConfig().replyTo || undefined; }
function isMailerConfigured() {
  return getBrevoConfig().configured || getSmtpConfig().configured;
}

function getMailerPublicConfig() {
  const cfg = getSmtpConfig();
  const brevo = getBrevoConfig();
  return {
    configured: brevo.configured || cfg.configured,
    provider:   brevo.configured ? 'brevo' : (cfg.configured ? 'smtp' : null),
    brevo: {
      configured: brevo.configured,
      senderEmail: maskEmail(brevo.senderEmail),
      senderName:  brevo.senderName || null
    },
    smtp: {
      configured: cfg.configured,
      host:       cfg.host || null,
      port:       cfg.port,
      secure:     cfg.secure,
      user:       maskEmail(cfg.user),
      from:       cfg.from || null,
      replyTo:    cfg.replyTo || null
    },
    host:       cfg.host || null,
    port:       cfg.port,
    secure:     cfg.secure,
    user:       maskEmail(cfg.user),
    from:       cfg.from || null,
    replyTo:    cfg.replyTo || null
  };
}

function getMailerErrorMessage(err) {
  const code         = err?.code || '';
  const responseCode = Number(err?.responseCode || 0);
  const msg          = err?.message || '';

  // Brevo REST API key missing or wrong
  if (msg.includes('xkeysib') || msg.includes('BREVO_API_KEY')) {
    return msg;
  }

  if (code === 'EAUTH' || responseCode === 535 || responseCode === 534) {
    return 'SMTP login failed. Set SMTP_USER to your Gmail address and SMTP_PASS to a Gmail App Password.';
  }
  if (code === 'ETIMEDOUT' || code === 'ESOCKET' || code === 'ECONNECTION' || msg.includes('408') || msg.includes('greeting')) {
    return 'SMTP is blocked on Render. Fix: Set BREVO_API_KEY (xkeysib-...) in Render Environment Variables → app.brevo.com → Settings → API Keys.';
  }
  if (responseCode === 550 || responseCode === 551 || responseCode === 553) {
    return 'SMTP rejected the sender or recipient. Ensure the sender address is verified.';
  }
  return msg || 'Email service failed to send the message.';
}

function handleMissingMailer(logMessage) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(logMessage);
    return { devMode: true };
  }
  throw new Error('Email service is not configured. Set BREVO_API_KEY (xkeysib-...) and BREVO_SENDER_EMAIL, or set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
}

// ---------------------------------------------------------------------------
// Nodemailer transporter
// ---------------------------------------------------------------------------

function getTransporter() {
  const { host, user, pass, port, secure } = getSmtpConfig();
  if (!host || !user || !pass) return null;

  // On Render, port 587 is blocked. Use 465 (SSL) or switch to Brevo REST API.
  const effectivePort   = Number(process.env.SMTP_PORT_OVERRIDE || port);
  const effectiveSecure = effectivePort === 465 ? true : secure;

  return nodemailer.createTransport({
    host,
    port:   effectivePort,
    secure: effectiveSecure,
    auth: { user, pass },
    family: 4,
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10000),
    greetingTimeout:   Number(process.env.SMTP_GREETING_TIMEOUT_MS   || 10000),
    socketTimeout:     Number(process.env.SMTP_SOCKET_TIMEOUT_MS     || 20000),
    tls: { rejectUnauthorized: false }
  });
}

async function verifyMailer() {
  const mailer = getTransporter();
  if (!mailer) return handleMissingMailer('Email service is not configured.');
  await mailer.verify();
  return { ok: true, config: getMailerPublicConfig() };
}

// ---------------------------------------------------------------------------
// Core send helper — Brevo REST API first (HTTPS, works on Render),
// SMTP fallback only for local dev
// ---------------------------------------------------------------------------

async function sendEmail({ to, subject, html, text }) {
  // Direct SMTP — Gmail port 465 (SSL) works on Render
  const mailer = getTransporter();
  if (!mailer) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`);
      return { devMode: true };
    }
    throw new Error('Email service not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS.');
  }
  const cfg  = getSmtpConfig();
  const info = await mailer.sendMail({
    from:    cfg.from,
    replyTo: cfg.replyTo || undefined,
    to, subject, html,
    text: text || ''
  });
  console.log(`[SMTP] ✅ Email sent to ${to} — ${info.messageId}`);
  return { devMode: false, delivery: summarizeMailInfo(info) };
}

// ---------------------------------------------------------------------------
// sendOtpEmail — cyan gradient header, monospace OTP display
// ---------------------------------------------------------------------------

async function sendOtpEmail({ to, otp, name }) {
  const displayName = name ? ` ${name}` : '';
  const minutes = Number(process.env.OTP_TTL_MINUTES || 10);

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f6f9fc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;">
<tr><td align="center" style="padding:40px 10px;background:#f6f9fc;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.04);border:1px solid #e2e8f0;">
    <tr><td align="center" style="background:linear-gradient(135deg,#0e7490 0%,#0891b2 100%);padding:32px 20px;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Rancom Technologies</h1>
      <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;">Secure Email Verification</p>
    </td></tr>
    <tr><td style="padding:40px 32px;background:#fff;">
      <p style="color:#1e293b;font-size:16px;font-weight:600;margin:0 0 16px;">Hello${displayName},</p>
      <p style="color:#475569;font-size:14px;line-height:22px;margin:0 0 24px;">Your Rancom Technologies verification code is:</p>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
        <tr><td align="center" style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:8px;padding:20px 10px;">
          <span style="font-family:'Courier New',monospace;font-size:32px;font-weight:700;letter-spacing:8px;color:#0891b2;">${otp}</span>
        </td></tr>
      </table>
      <p style="color:#475569;font-size:13px;margin:24px 0 0;">&#9203; Valid for <strong>${minutes} minutes</strong>.</p>
      <p style="color:#64748b;font-size:12px;margin:16px 0 0;border-top:1px solid #f1f5f9;padding-top:16px;">&#128737; If you did not request this code, ignore this email.</p>
    </td></tr>
    <tr><td align="center" style="padding:24px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">&#169; 2026 Rancom Technologies. Automated email — do not reply.</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;

  try {
    return await sendEmail({
      to,
      subject: `${otp} is your Rancom Technologies verification code`,
      html,
      text: `Hello${displayName},\n\nYour verification code is ${otp}. It expires in ${minutes} minutes.\n\nRancom Technologies`
    });
  } catch (err) {
    throw new Error(getMailerErrorMessage(err));
  }
}

// ---------------------------------------------------------------------------
// sendInterviewEmail — purple congrats banner, details card, preparation tips
// ---------------------------------------------------------------------------

async function sendInterviewEmail({
  to, name, position,
  interviewDate, interviewTime,
  mode, location, meetLink,
  interviewers, notes
}) {
  const displayName = name || 'Candidate';
  const dateStr = interviewDate
    ? new Date(interviewDate).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    : interviewDate;
  const modeLabel = { online: 'Online (Video Call)', offline: 'In-Person', phone: 'Phone Interview' }[mode] || mode;
  const hrEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || '';

  const locationRow = location
    ? `<tr><td style="padding:14px 20px;${meetLink ? 'border-bottom:1px solid #e2e8f0;' : ''}">
        <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">&#128205; Location / Phone</p>
        <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#0f172a;">${location}</p>
      </td></tr>`
    : '';

  const meetLinkRow = meetLink
    ? `<tr><td style="padding:14px 20px;">
        <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">&#128279; Meeting Link</p>
        <a href="${meetLink}" style="display:inline-block;margin-top:6px;padding:8px 18px;background:linear-gradient(135deg,#0ea5e9,#0369a1);color:white;font-size:13px;font-weight:700;text-decoration:none;border-radius:8px;">Join Meeting</a>
      </td></tr>`
    : '';

  const interviewersBlock = interviewers
    ? `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;">
        <tr><td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 20px;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#166534;text-transform:uppercase;">&#128100; Interviewer(s)</p>
          <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#14532d;">${interviewers}</p>
        </td></tr>
      </table>`
    : '';

  const notesBlock = notes
    ? `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;">
        <tr><td style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 20px;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#c2410c;text-transform:uppercase;">&#128221; Notes</p>
          <p style="margin:6px 0 0;font-size:13px;color:#7c2d12;line-height:20px;">${notes}</p>
        </td></tr>
      </table>`
    : '';

  const locationBorderStyle = (location || meetLink) ? 'border-bottom:1px solid #e2e8f0;' : '';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f6f9fc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;">
<tr><td align="center" style="padding:40px 12px;background:#f6f9fc;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.1);border:1px solid #e2e8f0;">
    <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e40af 60%,#0ea5e9 100%);padding:36px 32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">Rancom Technologies</h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Human Resources &#183; Recruitment</p>
    </td></tr>
    <tr><td style="background:linear-gradient(135deg,#fdf4ff,#fae8ff);padding:18px 32px;border-bottom:1px solid #e9d5ff;">
      <p style="margin:0;font-size:15px;font-weight:800;color:#6b21a8;">&#127881; Congratulations, ${displayName}!</p>
      <p style="margin:6px 0 0;font-size:13px;color:#7c3aed;">You have been shortlisted for an interview at Rancom Technologies Pvt Ltd.</p>
    </td></tr>
    <tr><td style="padding:32px 32px 28px;">
      <p style="color:#1e293b;font-size:14px;line-height:22px;margin:0 0 24px;">We are pleased to invite you for the <strong>${position}</strong> interview:</p>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="background:#f8fafc;padding:14px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;">&#128203; Position</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#0f172a;">${position}</p>
        </td></tr>
        <tr><td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">&#128197; Date &amp; Time</p>
          <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#0f172a;">${dateStr} at ${interviewTime}</p>
        </td></tr>
        <tr><td style="padding:14px 20px;${locationBorderStyle}">
          <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">&#128187; Mode</p>
          <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#0f172a;">${modeLabel}</p>
        </td></tr>
        ${locationRow}
        ${meetLinkRow}
      </table>
      ${interviewersBlock}
      ${notesBlock}
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;">
        <tr><td style="background:#f1f5f9;border-radius:10px;padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:800;color:#475569;text-transform:uppercase;">&#128161; Preparation Tips</p>
          <ul style="margin:0;padding-left:18px;color:#475569;font-size:13px;line-height:22px;">
            <li>Research Rancom Technologies before the interview</li>
            <li>Review your resume and be ready to discuss your projects</li>
            <li>${mode === 'online' ? 'Test your camera and mic 10 minutes before the call' : 'Arrive 10 minutes early at the venue'}</li>
            <li>Prepare questions to ask the interviewer</li>
          </ul>
        </td></tr>
      </table>
      <p style="color:#64748b;font-size:13px;line-height:20px;margin:0;">To confirm or reschedule, contact HR at <a href="mailto:${hrEmail}" style="color:#0ea5e9;font-weight:600;">${hrEmail}</a>.</p>
    </td></tr>
    <tr><td align="center" style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">&#169; 2026 Rancom Technologies Pvt Ltd &#183; Group of Appletree Infotech</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;

  const textParts = [
    `Hello ${displayName},`,
    ``,
    `Interview for ${position}`,
    `Date: ${dateStr}`,
    `Time: ${interviewTime}`,
    `Mode: ${modeLabel}`,
    location    ? `Location: ${location}`       : null,
    meetLink    ? `Meeting Link: ${meetLink}`    : null,
    interviewers ? `Interviewer(s): ${interviewers}` : null,
    notes       ? `Notes: ${notes}`             : null,
    ``,
    `HR Team — Rancom Technologies Pvt Ltd`
  ].filter(line => line !== null).join('\n');

  try {
    return await sendEmail({
      to,
      subject: `Interview Invitation — ${position} | Rancom Technologies`,
      html,
      text: textParts
    });
  } catch (err) {
    throw new Error(getMailerErrorMessage(err));
  }
}

// ---------------------------------------------------------------------------
// sendTestInviteEmail — green congrats banner, access code card, CTA button
// ---------------------------------------------------------------------------

async function sendTestInviteEmail({
  to, name, assessmentTitle,
  accessCode, testUrl,
  duration, expiresAt
}) {
  const displayName = name || 'Candidate';
  const expiryStr = expiresAt
    ? new Date(expiresAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })
    : 'No expiry';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f6f9fc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;">
<tr><td align="center" style="padding:40px 10px;background:#f6f9fc;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.08);border:1px solid #e2e8f0;">
    <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e40af 100%);padding:36px 32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">Rancom Technologies</h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Online Assessment Invitation</p>
    </td></tr>
    <tr><td style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);padding:20px 32px;border-bottom:1px solid #a7f3d0;">
      <p style="margin:0;color:#065f46;font-size:15px;font-weight:700;">&#127881; Congratulations, ${displayName}!</p>
      <p style="margin:6px 0 0;color:#047857;font-size:13px;">You have been shortlisted for the next round of selection.</p>
    </td></tr>
    <tr><td style="padding:36px 32px;">
      <p style="color:#1e293b;font-size:15px;margin:0 0 8px;font-weight:600;">Your Assessment Details</p>
      <p style="color:#475569;font-size:14px;line-height:22px;margin:0 0 28px;">Please complete the online assessment below at your earliest convenience. Read all instructions carefully before starting.</p>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
        <tr><td style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:16px 20px;">
          <p style="margin:0;font-size:12px;color:#0369a1;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Assessment</p>
          <p style="margin:4px 0 0;font-size:17px;font-weight:800;color:#0f172a;">${assessmentTitle}</p>
        </td></tr>
      </table>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
        <tr><td style="background:#fef3c7;border:2px dashed #f59e0b;border-radius:12px;padding:20px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#92400e;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Your Access Code</p>
          <p style="margin:8px 0 0;font-family:'Courier New',monospace;font-size:36px;font-weight:900;color:#d97706;letter-spacing:12px;">${accessCode}</p>
          <p style="margin:8px 0 0;font-size:11px;color:#b45309;">Keep this code safe. Do not share it.</p>
        </td></tr>
      </table>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
        <tr>
          <td width="50%" style="padding-right:8px;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
              <p style="margin:0;font-size:11px;color:#94a3b8;font-weight:600;">&#9201; DURATION</p>
              <p style="margin:4px 0 0;font-size:15px;font-weight:800;color:#0f172a;">${duration} minutes</p>
            </div>
          </td>
          <td width="50%" style="padding-left:8px;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
              <p style="margin:0;font-size:11px;color:#94a3b8;font-weight:600;">&#128197; EXPIRES</p>
              <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#0f172a;">${expiryStr}</p>
            </div>
          </td>
        </tr>
      </table>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
        <tr><td align="center">
          <a href="${testUrl}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#0ea5e9,#0369a1);color:#fff;font-size:15px;font-weight:800;text-decoration:none;border-radius:12px;">&#128640; Start My Assessment</a>
        </td></tr>
      </table>
    </td></tr>
    <tr><td align="center" style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">&#169; 2026 Rancom Technologies Pvt Ltd &#183; Group of Appletree Infotech</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;

  try {
    return await sendEmail({
      to,
      subject: `You're invited to take the ${assessmentTitle} — Rancom Technologies`,
      html,
      text: `Hello ${displayName},\n\nAssessment: ${assessmentTitle}\nURL: ${testUrl}\nAccess Code: ${accessCode}\nDuration: ${duration} min\nExpiry: ${expiryStr}\n\nRancom Technologies Pvt Ltd`
    });
  } catch (err) {
    throw new Error(getMailerErrorMessage(err));
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  // Core send
  sendEmail,
  // Email functions
  sendOtpEmail,
  sendInterviewEmail,
  sendTestInviteEmail,
  // SMTP helpers
  getSmtpConfig,
  getTransporter,
  verifyMailer,
  isMailerConfigured,
  getMailerPublicConfig,
  getMailerErrorMessage,
  handleMissingMailer,
  summarizeMailInfo,
  // Address helpers
  maskEmail,
  getFromAddress,
  getReplyToAddress,
  formatEmailAddress,
  extractEmailAddress
};
