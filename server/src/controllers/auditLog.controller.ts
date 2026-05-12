/**
 * ============================================================
 * AuditLog Controller
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog.js';
import type { AuditLogQuery } from '../validators/auditLog.validator.js';

function asQuery(req: Request): AuditLogQuery {
  return req.query as unknown as AuditLogQuery;
}

export async function getAuditLogs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const q = asQuery(req);
    const filter: Record<string, unknown> = {};
    if (q.category) filter.category = q.category;
    if (q.action) filter.action = { $regex: q.action, $options: 'i' };

    if (q.startDate || q.endDate) {
      const range: Record<string, Date> = {};
      if (q.startDate) {
        const d = new Date(q.startDate);
        if (!Number.isNaN(d.getTime())) range.$gte = d;
      }
      if (q.endDate) {
        const d = new Date(q.endDate);
        if (!Number.isNaN(d.getTime())) range.$lte = d;
      }
      if (Object.keys(range).length) filter.createdAt = range;
    }

    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort('-createdAt').skip(skip).limit(limit).populate('actor', 'name email'),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      logs,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const agg = await AuditLog.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({
      success: true,
      byCategory: agg.map((row) => ({ category: row._id, count: row.count })),
    });
  } catch (err) {
    next(err);
  }
}
