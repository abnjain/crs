/**
 * ============================================================
 * SiteConfig Controller
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import { SiteConfig } from '../models/SiteConfig.js';
import { logger } from '../utils/logger.js';
import { recordAuditEvent } from '../services/audit.service.js';

export async function getConfig(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const config = await SiteConfig.getConfig();
    res.json({ success: true, config });
  } catch (err) {
    next(err);
  }
}

export async function updateConfig(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doc = await SiteConfig.getConfig();
    Object.assign(doc, req.body);
    await doc.save();
    logger.info('Site config updated');
    recordAuditEvent({
      category: 'system',
      action: 'system.config_updated',
      req,
      statusCode: 200,
      targetModel: 'SiteConfig',
      targetId: doc._id,
      details: { changes: req.body },
    });
    res.json({ success: true, config: doc });
  } catch (err) {
    next(err);
  }
}
