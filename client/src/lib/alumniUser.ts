import type { UserRecord } from '../services/user.service';
import type { AlumniRecord } from '../services/alumni.service';
import { normalizeMongoId } from './mongoId';

/** Build a full UserRecord from the populated `user` on an alumni document (no extra GET /users call). */
export function userRecordFromAlumniPopulation(alumni: AlumniRecord): UserRecord {
  const u = alumni.user;
  const uid =
    normalizeMongoId(u._id) ||
    normalizeMongoId((u as { id?: string }).id);

  return {
    id: uid,
    _id: uid,
    name: u.name,
    email: u.email,
    role: u.role,
    roles: u.roles?.length ? u.roles : [u.role],
    isActive: u.isActive,
    createdAt: u.createdAt ?? alumni.createdAt,
    updatedAt: u.updatedAt ?? alumni.updatedAt,
  };
}
