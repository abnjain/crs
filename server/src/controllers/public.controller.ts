/**
 * ============================================================
 * Public (unauthenticated) endpoints — landing page
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { Alumni } from '../models/Alumni.js';
import { User } from '../models/User.js';

export async function getLandingStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [registeredAlumni, facultyMembers] = await Promise.all([
      Alumni.countDocuments().exec(),
      User.countDocuments({
        $or: [{ role: 'faculty' }, { roles: 'faculty' }],
      }).exec(),
    ]);

    const libraryVolumes = Number.isFinite(config.landingLibraryVolumes) ? config.landingLibraryVolumes : 8200;
    const founding = Number.isFinite(config.landingFoundingYear) ? config.landingFoundingYear : 1987;
    const yearsExcellence = Math.max(1, new Date().getFullYear() - founding);

    res.json({
      success: true,
      stats: {
        registeredAlumni,
        facultyMembers,
        libraryVolumes,
        yearsExcellence,
      },
    });
  } catch (err) {
    next(err);
  }
}
