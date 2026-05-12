/**
 * ============================================================
 * Auth Controller - MVC
 * Handles login, register, logout (session), getMe
 * ============================================================
 */

import { Request, Response, NextFunction, type CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { User, type IUser, getPrimaryRole } from '../models/User.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { recordAuditEvent } from '../services/audit.service.js';
import { sendEmailVerificationCode } from '../services/mail.service.js';
import { issueCsrfToken, clearCsrfToken } from '../middleware/csrf.js';
import type {
  UpdateMeBody,
  DeleteMeBody,
  RequestEmailVerificationBody,
  VerifyEmailBody,
} from '../validators/auth.validator.js';

/** Serialize user for API response - returns role + roles for client */
function toAuthUser(user: IUser) {
  const roles = user.getEffectiveRoles();
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: getPrimaryRole(roles),
    roles,
    isVerified: user.isVerified !== false,
    isActive: user.isActive !== false,
    messagingBanned: user.messagingBanned ?? false,
    messagingOptIn: user.messagingOptIn ?? true,
  };
}

function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    domain: config.cookieDomain,
    path: '/',
    maxAge: config.authCookieMaxAgeMs,
  };
}

function setAuthCookie(res: Response, token: string): void {
  res.cookie(config.authCookieName, token, authCookieOptions());
}

function clearAuthCookie(res: Response): void {
  res.cookie(config.authCookieName, '', {
    ...authCookieOptions(),
    maxAge: 0,
  });
}

const signToken = (id: string): string => {
  if (!config.jwtSignKey) {
    throw new AppError('JWT signing key not configured', 500);
  }
  return jwt.sign(
    { id },
    config.jwtSignKey,
    {
      expiresIn: config.jwtExpiresIn,
      algorithm: config.jwtAlgorithm as jwt.Algorithm,
    } as jwt.SignOptions
  );
};

const EMAIL_OTP_LENGTH = 6;
const EMAIL_OTP_EXPIRES_MS = 10 * 60 * 1000;

function generateEmailOtp(): string {
  return crypto.randomInt(0, 10 ** EMAIL_OTP_LENGTH).toString().padStart(EMAIL_OTP_LENGTH, '0');
}

function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password, role } = req.body;
    const dbName = mongoose.connection.db?.databaseName ?? 'unknown';
    logger.debug(`Register attempt: email=${email}, role=${role}, db=${dbName}`);

    const existing = await User.findOne({ email });
    if (existing) {
      logger.warn(`Registration failed - email already exists: ${email} (in db: ${dbName})`);
      recordAuditEvent({
        category: 'auth',
        action: 'auth.register_failed',
        actorEmail: email,
        statusCode: 400,
        req,
        details: { reason: 'email_exists', email },
      });
      throw new AppError('User with this email already exists', 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'alumni',
      isVerified: false,
      isActive: true,
    });
    const effectiveRoles = user.getEffectiveRoles();

    recordAuditEvent({
      category: 'auth',
      action: 'auth.register_success',
      actor: user._id,
      actorEmail: user.email,
      targetModel: 'User',
      targetId: user._id,
      statusCode: 201,
      req,
      details: {
        name: user.name,
        email: user.email,
        roles: effectiveRoles,
        pendingApproval: true,
      },
    });

    logger.info(`User registered (pending approval): ${user.email} (${user.role})`);
    res.status(201).json({
      success: true,
      pendingApproval: true,
      message: 'Your account is pending administrator approval.',
      user: toAuthUser(user),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Login user
 * POST /api/v1/auth/login
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;
    const dbName = mongoose.connection.db?.databaseName ?? 'unknown';
    logger.debug(`Login attempt: email=${email}, db=${dbName}`);

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      logger.warn(`Login failed - invalid credentials for: ${email}`);
      recordAuditEvent({
        category: 'auth',
        action: 'auth.login_failed',
        actorEmail: email,
        statusCode: 401,
        req,
        details: { reason: 'invalid_credentials', email },
      });
      throw new AppError('Invalid email or password', 401);
    }

    if (user.isVerified === false) {
      recordAuditEvent({
        category: 'auth',
        action: 'auth.login_blocked',
        actor: user._id,
        actorEmail: user.email,
        statusCode: 403,
        req,
        details: { reason: 'pending_verification', email: user.email },
      });
      throw new AppError('Your account is pending administrator approval.', 403);
    }

    if (!user.isActive) {
      recordAuditEvent({
        category: 'auth',
        action: 'auth.login_blocked',
        actor: user._id,
        actorEmail: user.email,
        statusCode: 401,
        req,
        details: { reason: 'account_deactivated', email: user.email },
      });
      throw new AppError('Account is deactivated', 401);
    }

    const token = signToken(user._id.toString());
    const effectiveRoles = user.getEffectiveRoles();

    recordAuditEvent({
      category: 'auth',
      action: 'auth.login_success',
      actor: user._id,
      actorEmail: user.email,
      statusCode: 200,
      req,
      details: { email: user.email, roles: effectiveRoles },
    });
    logger.info(`User logged in: ${user.email} (${user.role})`);

    setAuthCookie(res, token);
    const csrfToken = issueCsrfToken(res);

    res.json({
      success: true,
      user: toAuthUser(user),
      csrfToken,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Issue CSRF token cookie
 * GET /api/v1/auth/csrf
 */
export async function getCsrf(
  _req: Request,
  res: Response
): Promise<void> {
  const csrfToken = issueCsrfToken(res);
  res.json({ success: true, csrfToken });
}

/**
 * Logout user - clears auth and CSRF cookies
 * POST /api/v1/auth/logout
 */
export async function logout(
  _req: Request,
  res: Response
): Promise<void> {
  clearAuthCookie(res);
  clearCsrfToken(res);
  res.json({ success: true });
}

/**
 * Get current user (protected)
 * GET /api/v1/auth/me
 */
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.debug(`getMe: userId=${req.user!._id}`);
    const user = await User.findById(req.user!._id).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    res.json({ success: true, user: toAuthUser(user), pendingEmail: user.pendingEmail ?? undefined });
  } catch (err) {
    next(err);
  }
}

/**
 * Update current user profile
 * PATCH /api/v1/auth/me
 */
export async function updateMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as UpdateMeBody;
    const user = await User.findById(req.user!._id).select('+pendingEmail +pendingEmailToken +pendingEmailExpires');
    if (!user) throw new AppError('User not found', 404);

    let emailPending = Boolean(user.pendingEmail);

    if (body.email) {
      const nextEmail = body.email.toLowerCase().trim();

      if (nextEmail === user.email) {
        if (user.pendingEmail) {
          user.pendingEmail = undefined;
          user.pendingEmailToken = undefined;
          user.pendingEmailExpires = undefined;
          emailPending = false;
        }
      } else if (nextEmail !== user.pendingEmail) {
        const existing = await User.findOne({ email: nextEmail }).exec();
        if (existing && existing._id.toString() !== user._id.toString()) {
          throw new AppError('Email already in use', 400);
        }

        user.pendingEmail = nextEmail;
        user.pendingEmailToken = undefined;
        user.pendingEmailExpires = undefined;
        emailPending = true;

        recordAuditEvent({
          category: 'user',
          action: 'user.email_change_requested',
          req,
          statusCode: 200,
          targetModel: 'User',
          targetId: user._id,
          details: { pendingEmail: nextEmail },
        });
      }
    }

    if (body.name) user.name = body.name;
    if (typeof body.isActive === 'boolean') {
      user.isActive = body.isActive;
    }

    await user.save();

    recordAuditEvent({
      category: 'user',
      action: 'user.self_updated',
      req,
      statusCode: 200,
      targetModel: 'User',
      targetId: user._id,
      details: { changes: body, emailPending },
    });

    res.json({
      success: true,
      user: toAuthUser(user),
      emailPending,
      pendingEmail: user.pendingEmail ?? undefined,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Request account deletion (scheduled)
 * DELETE /api/v1/auth/me
 */
export async function deleteMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as DeleteMeBody;
    const user = await User.findById(req.user!._id).select('+password');
    if (!user) throw new AppError('User not found', 404);

    const roles = user.getEffectiveRoles();
    if (roles.includes('superadmin')) {
      throw new AppError('Superadmin accounts cannot be deleted', 403);
    }

    if (!(await user.correctPassword(body.password, user.password))) {
      throw new AppError('Invalid password', 401);
    }

    if (user.deletionScheduledFor) {
      throw new AppError('Account deletion already scheduled', 400);
    }

    const now = new Date();
    const schedule = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const canChooseDocs = roles.includes('faculty') || roles.includes('hod');
    const deleteDocuments = canChooseDocs ? Boolean(body.deleteDocuments) : true;

    user.deletionRequestedAt = now;
    user.deletionScheduledFor = schedule;
    user.deletionDeleteDocuments = deleteDocuments;
    user.isActive = false;
    await user.save();

    recordAuditEvent({
      category: 'user',
      action: 'user.self_delete_requested',
      req,
      statusCode: 200,
      targetModel: 'User',
      targetId: user._id,
      details: { scheduledFor: schedule.toISOString(), deleteDocuments },
    });

    res.json({ success: true, scheduledFor: schedule.toISOString(), deleteDocuments });
  } catch (err) {
    next(err);
  }
}

/**
 * Send email verification code (OTP)
 * POST /api/v1/auth/verify-email/request
 */
export async function requestEmailVerification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as RequestEmailVerificationBody;
    const user = await User.findById(req.user!._id).select('+pendingEmail +pendingEmailToken +pendingEmailExpires');
    if (!user) throw new AppError('User not found', 404);

    const nextEmail = body.email.toLowerCase().trim();
    if (nextEmail === user.email) {
      throw new AppError('Email is already your current email', 400);
    }

    const existing = await User.findOne({ email: nextEmail }).exec();
    if (existing && existing._id.toString() !== user._id.toString()) {
      throw new AppError('Email already in use', 400);
    }

    const code = generateEmailOtp();
    user.pendingEmail = nextEmail;
    user.pendingEmailToken = hashOtp(code);
    user.pendingEmailExpires = new Date(Date.now() + EMAIL_OTP_EXPIRES_MS);
    await user.save();

    const sent = await sendEmailVerificationCode(nextEmail, code, user.name);
    if (!sent) {
      throw new AppError('Failed to send verification code. Please try again later.', 503);
    }

    recordAuditEvent({
      category: 'user',
      action: 'user.email_verification_sent',
      req,
      statusCode: 200,
      targetModel: 'User',
      targetId: user._id,
      details: { pendingEmail: nextEmail },
    });

    res.json({
      success: true,
      pendingEmail: user.pendingEmail,
      expiresAt: user.pendingEmailExpires?.toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify email change via OTP
 * POST /api/v1/auth/verify-email
 */
export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as VerifyEmailBody;
    const user = await User.findById(req.user!._id).select('+pendingEmail +pendingEmailToken +pendingEmailExpires');
    if (!user) throw new AppError('User not found', 404);

    if (!user.pendingEmail || !user.pendingEmailToken || !user.pendingEmailExpires) {
      throw new AppError('No email verification pending', 400);
    }

    if (user.pendingEmailExpires.getTime() < Date.now()) {
      throw new AppError('Verification code expired', 400);
    }

    const hashed = hashOtp(body.code);
    if (hashed !== user.pendingEmailToken) {
      throw new AppError('Invalid verification code', 400);
    }

    const oldEmail = user.email;
    user.email = user.pendingEmail!;
    user.pendingEmail = undefined;
    user.pendingEmailToken = undefined;
    user.pendingEmailExpires = undefined;
    await user.save();

    recordAuditEvent({
      category: 'user',
      action: 'user.email_verified',
      req,
      statusCode: 200,
      targetModel: 'User',
      targetId: user._id,
      details: { oldEmail, newEmail: user.email },
    });

    logger.info('Email verified', String(user._id));

    res.json({ success: true, user: toAuthUser(user) });
  } catch (err) {
    next(err);
  }
}
