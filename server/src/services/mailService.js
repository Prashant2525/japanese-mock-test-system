import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter;

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));
}

export function isMailConfigured() {
  return Boolean(env.mailHost && env.mailUser && env.mailAppPassword && env.mailFrom);
}

function getTransporter() {
  if (!isMailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.mailHost,
      port: env.mailPort,
      secure: env.mailSecure,
      auth: { user: env.mailUser, pass: env.mailAppPassword }
    });
  }
  return transporter;
}

export async function verifyMailConnection() {
  const mailTransporter = getTransporter();
  if (!mailTransporter) return false;
  await mailTransporter.verify();
  return true;
}

export async function sendPasswordResetEmail({ to, fullName, resetUrl }) {
  const mailTransporter = getTransporter();
  if (!mailTransporter) return false;
  const safeName = escapeHtml(fullName || 'there');

  await mailTransporter.sendMail({
    from: env.mailFrom,
    to,
    subject: 'Reset your Dream Mock password',
    text: `Hello ${fullName || 'there'},\n\nUse this link to reset your Dream Mock password:\n${resetUrl}\n\nThis link expires in 30 minutes. If you did not request this, you can ignore this email.`,
    html: `<div style="background:#f7f9fc;padding:32px 16px;font-family:Arial,sans-serif;color:#18233c"><div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dfe5ef;border-radius:12px;padding:32px"><p style="color:#1f51a3;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Dream Mock</p><h1 style="font-size:26px;margin:18px 0 12px">Reset your password</h1><p style="font-size:15px;line-height:1.6;color:#6a7487">Hello ${safeName}, we received a request to reset your Dream Mock password.</p><p style="margin:26px 0"><a href="${resetUrl}" style="display:inline-block;background:#1f51a3;color:#ffffff;text-decoration:none;border-radius:8px;padding:13px 18px;font-weight:700">Reset password</a></p><p style="font-size:13px;line-height:1.6;color:#6a7487">This link expires in 30 minutes. If you did not request a reset, you can safely ignore this email.</p></div></div>`
  });
  return true;
}
