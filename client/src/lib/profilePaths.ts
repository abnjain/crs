/**
 * Central URLs for profile detail views (user accounts / alumni records).
 */
export const PROFILE_BASE = '/dashboard/profile';

export type ProfileKind = 'user' | 'alumni';

export function profileUrl(kind: ProfileKind, entityId: string): string {
  return `${PROFILE_BASE}/${kind}/${encodeURIComponent(entityId)}`;
}

export function userProfileUrl(userId: string): string {
  return profileUrl('user', userId);
}

export function alumniProfileUrl(alumniId: string): string {
  return profileUrl('alumni', alumniId);
}

export function parseProfileKind(value: string | undefined): ProfileKind | null {
  if (value === 'user' || value === 'alumni') return value;
  return null;
}
