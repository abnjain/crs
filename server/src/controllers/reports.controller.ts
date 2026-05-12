/**
 * ============================================================
 * Reports Controller - Aggregates from User, Alumni, Event
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import type { Types } from 'mongoose';
import { User, getPrimaryRole, type UserRole } from '../models/User.js';
import { Alumni } from '../models/Alumni.js';
import { Event } from '../models/Event.js';
import { AuditLog } from '../models/AuditLog.js';

type ReviewQueueItem =
  | {
      kind: 'unverified_alumni';
      alumniId: string;
      userId: string;
      name: string;
      email: string;
      department: string;
      createdAt: string;
    }
  | {
      kind: 'new_user';
      userId: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
    };

type LeanPopulatedUser = {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  role?: UserRole;
  roles?: UserRole[];
};

type LeanAlumniRow = {
  _id: Types.ObjectId;
  user: Types.ObjectId | LeanPopulatedUser | null;
  department?: string;
  createdAt?: Date;
};

type LeanUserRow = {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  role?: UserRole;
  roles?: UserRole[];
  createdAt?: Date;
};

/**
 * Super-admin widget: pending registrations first (newest sign-ups at top), then unverified alumni (oldest profile first).
 * Dedupes by user id. Max `limit` rows; every row is approval-eligible.
 */
async function buildReviewQueue(limit: number): Promise<ReviewQueueItem[]> {
  const cap = Math.min(Math.max(limit, 1), 50);

  const pendingUsers = await User.find({ isVerified: false })
    .sort({ createdAt: -1 })
    .limit(cap)
    .select('name email role roles createdAt')
    .lean()
    .exec();

  const items: ReviewQueueItem[] = [];
  const seenUserIds = new Set<string>();

  for (const raw of pendingUsers) {
    const u = raw as LeanUserRow;
    if (items.length >= cap) break;
    const uid = String(u._id);
    seenUserIds.add(uid);
    const roles = (u.roles?.length ? u.roles : [u.role]) as UserRole[];
    const cu = u.createdAt;
    const created = cu instanceof Date ? cu.toISOString() : String(cu ?? '');
    items.push({
      kind: 'new_user',
      userId: uid,
      name: typeof u.name === 'string' ? u.name : 'Unknown',
      email: typeof u.email === 'string' ? u.email : '',
      role: getPrimaryRole(roles),
      createdAt: created,
    });
  }

  const remaining = cap - items.length;
  if (remaining <= 0) return items;

  const alumniCandidates = await Alumni.find({ isVerified: false })
    .sort({ createdAt: 1 })
    .limit(Math.max(remaining * 6, 32))
    .populate<{ user: LeanPopulatedUser | null }>('user', 'name email role roles')
    .lean()
    .exec();

  for (const raw of alumniCandidates) {
    const a = raw as LeanAlumniRow;
    if (items.length >= cap) break;
    const pop = a.user && typeof a.user === 'object' && '_id' in a.user ? (a.user as LeanPopulatedUser) : null;
    const uid = pop?._id ? String(pop._id) : String(a.user);
    if (seenUserIds.has(uid)) continue;
    seenUserIds.add(uid);
    const ca = a.createdAt;
    const created = ca instanceof Date ? ca.toISOString() : String(ca ?? '');
    items.push({
      kind: 'unverified_alumni',
      alumniId: String(a._id),
      userId: uid,
      name: pop?.name?.trim() || 'Unknown',
      email: pop?.email?.trim() || '',
      department: typeof a.department === 'string' ? a.department : '',
      createdAt: created,
    });
  }

  return items;
}

/** UTC midnight for calendar date */
function utcDayStart(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

/** Last N calendar days (UTC), oldest → newest, with user signup counts per day */
async function userRegistrationsLastDays(days: number): Promise<{ isoDate: string; label: string; count: number }[]> {
  const now = new Date();
  const todayUtc = utcDayStart(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const startUtc = new Date(todayUtc);
  startUtc.setUTCDate(startUtc.getUTCDate() - (days - 1));

  const tomorrowUtc = new Date(todayUtc);
  tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1);

  const agg = await User.aggregate<{ _id: string; count: number }>([
    {
      $match: {
        createdAt: { $gte: startUtc, $lt: tomorrowUtc },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
        count: { $sum: 1 },
      },
    },
  ]);

  const bucket = new Map<string, number>();
  for (const row of agg) bucket.set(row._id, row.count);

  const series: { isoDate: string; label: string; count: number }[] = [];
  for (let i = 0; i < days; i++) {
    const dt = new Date(startUtc);
    dt.setUTCDate(dt.getUTCDate() + i);
    const y = dt.getUTCFullYear();
    const m = dt.getUTCMonth();
    const d = dt.getUTCDate();
    const isoDate = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const label = new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: 'UTC' }).format(dt);
    series.push({ isoDate, label, count: bucket.get(isoDate) ?? 0 });
  }
  return series;
}

export async function getSummaryReport(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const now = new Date();
    const startOfUtcMonth = utcDayStart(now.getUTCFullYear(), now.getUTCMonth(), 1);
    const startOfPrevUtcMonth = new Date(startOfUtcMonth);
    startOfPrevUtcMonth.setUTCMonth(startOfPrevUtcMonth.getUTCMonth() - 1);

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const [
      userCount,
      alumniCount,
      eventCount,
      usersByRole,
      alumniByDept,
      alumniByYear,
      verifiedBreakdown,
      eventsByType,
      eventsByStatus,
      usersRegisteredLast7Days,
      usersCreatedThisMonth,
      usersCreatedPrevMonth,
      alumniCreatedThisMonth,
      alumniCreatedPrevMonth,
      eventsCreatedThisWeek,
      auditLogsLast24h,
      auditLogsPrev24h,
    ] = await Promise.all([
      User.countDocuments(),
      Alumni.countDocuments(),
      Event.countDocuments(),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Alumni.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Alumni.aggregate([
        { $group: { _id: '$graduationYear', count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
      ]),
      Alumni.aggregate([{ $group: { _id: '$isVerified', count: { $sum: 1 } } }]),
      Event.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Event.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      userRegistrationsLastDays(7),
      User.countDocuments({ createdAt: { $gte: startOfUtcMonth } }),
      User.countDocuments({
        createdAt: { $gte: startOfPrevUtcMonth, $lt: startOfUtcMonth },
      }),
      Alumni.countDocuments({ createdAt: { $gte: startOfUtcMonth } }),
      Alumni.countDocuments({
        createdAt: { $gte: startOfPrevUtcMonth, $lt: startOfUtcMonth },
      }),
      Event.countDocuments({ createdAt: { $gte: weekAgo } }),
      AuditLog.countDocuments({ createdAt: { $gte: dayAgo } }),
      AuditLog.countDocuments({ createdAt: { $gte: twoDaysAgo, $lt: dayAgo } }),
    ]);

    const alumniVerified =
      verifiedBreakdown.find((r) => r._id === true)?.count ?? 0;
    const alumniUnverified =
      verifiedBreakdown.find((r) => r._id === false)?.count ?? 0;

    const auditDeltaPct =
      auditLogsPrev24h > 0
        ? Math.round(((auditLogsLast24h - auditLogsPrev24h) / auditLogsPrev24h) * 100)
        : auditLogsLast24h > 0
          ? 100
          : 0;

    const reviewQueue = await buildReviewQueue(6);

    res.json({
      success: true,
      totals: {
        users: userCount,
        alumni: alumniCount,
        events: eventCount,
      },
      dashboard: {
        usersRegisteredLast7Days,
        reviewQueue,
        kpis: {
          usersCreatedThisMonth,
          usersCreatedPrevMonth,
          alumniProfilesCreatedThisMonth: alumniCreatedThisMonth,
          alumniProfilesCreatedPrevMonth: alumniCreatedPrevMonth,
          eventsCreatedRollingWeek: eventsCreatedThisWeek,
          auditEntriesLast24h: auditLogsLast24h,
          auditEntriesPrev24h: auditLogsPrev24h,
          auditEntriesDeltaPercent: auditDeltaPct,
        },
      },
      usersByRole: usersByRole.map((r) => ({ role: String(r._id ?? 'unknown'), count: r.count })),
      alumniByDepartment: alumniByDept.map((r) => ({
        department: String(r._id ?? '—'),
        count: r.count,
      })),
      alumniByGraduationYear: alumniByYear.map((r) => ({
        year: r._id != null ? String(r._id) : '—',
        count: r.count,
      })),
      alumniVerification: [
        { label: 'Verified', count: alumniVerified },
        { label: 'Unverified', count: alumniUnverified },
      ],
      eventsByType: eventsByType.map((r) => ({ type: String(r._id ?? 'other'), count: r.count })),
      eventsByStatus: eventsByStatus.map((r) => ({
        status: String(r._id ?? 'unknown'),
        count: r.count,
      })),
    });
  } catch (err) {
    next(err);
  }
}
