/**
 * ============================================================
 * Mail Service
 * Resend HTTP API (production / Render) or SMTP (local dev)
 * ============================================================
 */

import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export type MailBackend = 'resend' | 'smtp' | 'none';

let transporter: nodemailer.Transporter | null = null;
let probeCache: { result: MailProbeResult; at: number } | null = null;
let lastLoggedProbeKey: string | null = null;

export interface MailProbeResult {
  configured: boolean;
  ok: boolean | null;
  detail: string;
  latencyMs: number | null;
  backend?: MailBackend;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function isRenderRuntime(): boolean {
  return process.env.RENDER === 'true';
}

/** Pick mail backend: Resend on Render/production; SMTP for local when configured. */
export function resolveMailBackend(): MailBackend {
  const mode = config.mailProvider;

  if (mode === 'resend') {
    return config.resendApiKey ? 'resend' : 'none';
  }
  if (mode === 'smtp') {
    return config.smtpHost ? 'smtp' : 'none';
  }

  // auto
  if (config.resendApiKey) return 'resend';
  if (isRenderRuntime() && config.smtpHost) {
    return 'none';
  }
  return config.smtpHost ? 'smtp' : 'none';
}

function logProbeOnce(result: MailProbeResult): void {
  const key = `${result.backend ?? 'none'}:${result.ok}:${result.detail}`;
  if (key === lastLoggedProbeKey) return;
  lastLoggedProbeKey = key;

  if (!result.configured) {
    logger.info(`Mail: ${result.detail}`);
    return;
  }
  if (result.ok) {
    logger.info(`Mail: connected (${result.backend}) ${result.detail}`);
    return;
  }
  logger.error(`Mail: connection failed (${result.backend}) ${result.detail}`);
}

function mailFromAddress(): string {
  return config.mailFrom || config.smtpFrom || `noreply@${config.appName.toLowerCase()}.local`;
}

async function readResendError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string; name?: string };
    return (data.message || data.name || '').trim();
  } catch {
    return (await res.text().catch(() => '')).trim().slice(0, 200);
  }
}

async function probeResend(): Promise<MailProbeResult> {
  if (!config.resendApiKey) {
    return {
      configured: false,
      ok: null,
      detail: 'Resend not configured (missing RESEND_API_KEY)',
      latencyMs: null,
      backend: 'none',
    };
  }

  if (!/^re_[A-Za-z0-9_]+$/.test(config.resendApiKey)) {
    return {
      configured: true,
      ok: false,
      detail:
        'RESEND_API_KEY format invalid (expected re_... with no quotes or spaces). Re-paste the key in Render env.',
      latencyMs: null,
      backend: 'resend',
    };
  }

  const t0 = Date.now();
  try {
    // Send-only keys return 403 on GET /domains. POST with empty body: 422 = auth OK, 401 = bad key.
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(config.smtpVerifyTimeoutMs),
    });

    if (res.status === 422) {
      return {
        configured: true,
        ok: true,
        detail: `resend.com send access (from: ${mailFromAddress()})`,
        latencyMs: Date.now() - t0,
        backend: 'resend',
      };
    }

    if (res.ok) {
      return {
        configured: true,
        ok: true,
        detail: `resend.com (from: ${mailFromAddress()})`,
        latencyMs: Date.now() - t0,
        backend: 'resend',
      };
    }

    const errMsg = await readResendError(res);
    if (res.status === 401) {
      return {
        configured: true,
        ok: false,
        detail: `Resend API key invalid${errMsg ? `: ${errMsg}` : ''}`,
        latencyMs: Date.now() - t0,
        backend: 'resend',
      };
    }

    return {
      configured: true,
      ok: false,
      detail: `Resend API error ${res.status}${errMsg ? `: ${errMsg}` : ''}`,
      latencyMs: Date.now() - t0,
      backend: 'resend',
    };
  } catch (err) {
    return {
      configured: true,
      ok: false,
      detail: String(err),
      latencyMs: null,
      backend: 'resend',
    };
  }
}

function smtpTransportOptions() {
  const port = config.smtpPort;
  return {
    host: config.smtpHost,
    port,
    secure: port === 465,
    requireTLS: config.smtpRequireTls,
    pool: config.smtpPool,
    maxConnections: config.smtpMaxConnections,
    maxMessages: config.smtpMaxMessages,
    connectionTimeout: config.smtpConnectionTimeoutMs,
    greetingTimeout: config.smtpGreetingTimeoutMs,
    socketTimeout: config.smtpSocketTimeoutMs,
    auth: config.smtpUser ? { user: config.smtpUser, pass: config.smtpPass } : undefined,
    family: 4,
  };
}

async function probeSmtp(): Promise<MailProbeResult> {
  const host = config.smtpHost;
  if (!host) {
    return {
      configured: false,
      ok: null,
      detail: 'SMTP not configured (missing SMTP_HOST)',
      latencyMs: null,
      backend: 'none',
    };
  }

  if (isRenderRuntime()) {
    return {
      configured: true,
      ok: false,
      detail:
        'SMTP blocked on Render (ports 25/465/587). Set RESEND_API_KEY and MAIL_PROVIDER=resend, remove SMTP_* vars.',
      latencyMs: null,
      backend: 'none',
    };
  }

  const from = config.smtpFrom;
  const port = config.smtpPort;

  try {
    const probeTransport = nodemailer.createTransport(smtpTransportOptions());
    const t0 = Date.now();
    await Promise.race([
      probeTransport.verify(),
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error('SMTP verify timeout')), config.smtpVerifyTimeoutMs)
      ),
    ]);

    transporter = probeTransport;

    return {
      configured: true,
      ok: true,
      detail: `${host}:${port} (from: ${from})`,
      latencyMs: Date.now() - t0,
      backend: 'smtp',
    };
  } catch (err) {
    return {
      configured: true,
      ok: false,
      detail: String(err),
      latencyMs: null,
      backend: 'smtp',
    };
  }
}

async function probeMailUncached(): Promise<MailProbeResult> {
  const backend = resolveMailBackend();

  if (backend === 'none') {
    if (isRenderRuntime() && config.smtpHost && !config.resendApiKey) {
      return {
        configured: true,
        ok: false,
        detail:
          'SMTP blocked on Render. Add RESEND_API_KEY (https://resend.com) and MAIL_PROVIDER=resend.',
        latencyMs: null,
        backend: 'none',
      };
    }
    return {
      configured: false,
      ok: null,
      detail: 'Mail not configured (set RESEND_API_KEY or SMTP_HOST)',
      latencyMs: null,
      backend: 'none',
    };
  }

  if (backend === 'resend') return probeResend();
  return probeSmtp();
}

/** Probe mail connectivity; cached to avoid health-check log spam. */
export async function probeMail(): Promise<MailProbeResult> {
  const now = Date.now();
  if (probeCache && now - probeCache.at < config.smtpProbeCacheMs) {
    return probeCache.result;
  }

  const result = await probeMailUncached();
  probeCache = { result, at: now };
  logProbeOnce(result);
  return result;
}

async function getSmtpTransporter(): Promise<nodemailer.Transporter | null> {
  if (transporter) return transporter;
  if (!config.smtpHost || isRenderRuntime()) return null;

  try {
    transporter = nodemailer.createTransport(smtpTransportOptions());
    await Promise.race([
      transporter.verify(),
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error('SMTP verify timeout')), config.smtpVerifyTimeoutMs)
      ),
    ]);
    logger.info(`Mail: SMTP ready ${config.smtpHost}:${config.smtpPort}`);
    return transporter;
  } catch (err) {
    logger.error('Mail: Failed to create SMTP transporter', String(err));
    return null;
  }
}

async function sendViaResend(options: SendMailOptions): Promise<boolean> {
  if (!config.resendApiKey) {
    logger.warn('Mail: RESEND_API_KEY not configured');
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: mailFromAddress(),
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
      signal: AbortSignal.timeout(config.smtpSocketTimeoutMs),
    });

    if (!res.ok) {
      const errMsg = await readResendError(res);
      logger.error(
        `Mail: Resend send failed ${res.status}${errMsg ? `: ${errMsg}` : ''}`
      );
      return false;
    }

    logger.info(`Mail: Sent via Resend to ${options.to} · ${options.subject}`);
    return true;
  } catch (err) {
    logger.error('Mail: Resend send error', String(err));
    return false;
  }
}

async function sendViaSmtp(options: SendMailOptions): Promise<boolean> {
  const transport = await getSmtpTransporter();
  if (!transport) return false;

  try {
    await transport.sendMail({
      from: mailFromAddress(),
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    logger.info(`Mail: Sent via SMTP to ${options.to} · ${options.subject}`);
    return true;
  } catch (err) {
    logger.error('Mail: SMTP send failed', String(err));
    return false;
  }
}

/** Send an email using the configured backend. */
export async function sendMail(options: SendMailOptions): Promise<boolean> {
  const backend = resolveMailBackend();
  if (backend === 'resend') return sendViaResend(options);
  if (backend === 'smtp') return sendViaSmtp(options);
  logger.warn('Mail: not configured — email not sent');
  return false;
}

/** Send email change verification code */
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
