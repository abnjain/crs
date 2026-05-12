/**
 * ============================================================
 * Mail Service
 * Uses nodemailer to send emails (SMTP)
 * ============================================================
 */

import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let transporter: nodemailer.Transporter | null = null;

export interface MailProbeResult {
  configured: boolean;
  ok: boolean | null;
  detail: string;
  latencyMs: number | null;
}

/** Probe SMTP connection at startup and log result */
export async function probeMail(): Promise<MailProbeResult> {
  const host = config.smtpHost;
  if (!host) {
    logger.info('Mail: SMTP not configured (missing SMTP_HOST)');
    return { configured: false, ok: null, detail: 'Not configured', latencyMs: null };
  }

  const port = config.smtpPort;
  const user = config.smtpUser;
  const pass = config.smtpPass;
  const from = config.smtpFrom;

  try {
    const probeTransport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass } : undefined,
    });

    const t0 = Date.now();
    await Promise.race([
      probeTransport.verify(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('SMTP verify timeout')), 5000)),
    ]);

    // Also create and cache the real transporter
    transporter = probeTransport;

    logger.info(`Mail: SMTP connected ${host}:${port} (from: ${from})`);
    return {
      configured: true,
      ok: true,
      detail: `${host}:${port}`,
      latencyMs: Date.now() - t0,
    };
  } catch (err) {
    logger.error('Mail: SMTP connection failed', String(err));
    return {
      configured: true,
      ok: false,
      detail: String(err),
      latencyMs: null,
    };
  }
}

async function getTransporter(): Promise<nodemailer.Transporter | null> {
  if (transporter) return transporter;

  const host = config.smtpHost;
  if (!host) {
    logger.warn('Mail: SMTP not configured (missing SMTP_HOST)');
    return null;
  }

  const port = config.smtpPort;
  const user = config.smtpUser;
  const pass = config.smtpPass;
  const from = config.smtpFrom;

  try {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port.toString() === '465',
      auth: user ? { user, pass } : undefined,
    });

    // Verify connection on startup
    await transporter.verify();
    logger.info(`Mail: SMTP configured ${host}:${port} (from: ${from})`);
    return transporter;
  } catch (err) {
    logger.error('Mail: Failed to create transporter', String(err));
    return null;
  }
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email. Returns null if SMTP not configured.
 */
export async function sendMail(options: SendMailOptions): Promise<boolean> {
  const transport = await getTransporter();
  if (!transport) return false;

  const from = config.smtpFrom;
  // const appName = config.appName;

  try {
    await transport.sendMail({
      from: `${from}`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    logger.info(`Mail: Sent to ${options.to} · ${options.subject}`);
    return true;
  } catch (err) {
    logger.error('Mail: Failed to send', String(err));
    return false;
  }
}

/**
 * Send email change verification code
 */
export async function sendEmailVerificationCode(
  email: string,
  code: string,
  userName: string
): Promise<boolean> {
  const appName = config.appName;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 520px; margin: 0 auto; padding: 20px; }
    .code { display: inline-block; padding: 12px 18px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 22px; letter-spacing: 6px; font-weight: 600; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Confirm your email address</h2>
    <p>Hi ${userName},</p>
    <p>You requested to change your email address to <strong>${email}</strong>.</p>
    <p>Enter this verification code in ${appName}:</p>
    <p style="margin: 18px 0;">
      <span class="code">${code}</span>
    </p>
    <p>This code expires in 10 minutes.</p>
    <div class="footer">
      <p>If you didn't request this change, please ignore this email or contact support.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `Confirm your email address

Hi ${userName},

You requested to change your email address to ${email}.

Your verification code is: ${code}
This code expires in 10 minutes.

If you didn't request this change, please ignore this email or contact support.`.trim();

  return sendMail({ to: email, subject: 'Your email verification code', html, text });
}