/**
 * URL query helpers for linking from Reports → full listings with filters applied.
 */

export function parseUsersListingSearch(sp: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  const role = sp.get('role');
  if (role) out.role = role.trim().toLowerCase();

  const department = sp.get('department');
  if (department) out.alumniDepartment = department;

  const gradYear = sp.get('gradYear');
  if (gradYear) out.alumniGraduationYear = gradYear.trim();

  const verified = sp.get('alumniVerified');
  if (verified === 'true' || verified === 'false') out.alumniProfileVerified = verified;

  return out;
}

export function parseEventsListingSearch(sp: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  const type = sp.get('type');
  if (type) out.type = type.trim().toLowerCase();
  const status = sp.get('status');
  if (status) out.status = status.trim().toLowerCase();
  return out;
}

/** Open user list narrowed to alumni (for alum-only report sections). */
export function usersListingAlumniScope(): string {
  const p = new URLSearchParams();
  p.set('role', 'alumni');
  return `?${p.toString()}`;
}

export function usersListingForRole(role: string): string {
  const p = new URLSearchParams();
  p.set('role', role.trim().toLowerCase());
  return `?${p.toString()}`;
}

export function usersListingAlumniVerification(verified: boolean): string {
  const p = new URLSearchParams();
  p.set('role', 'alumni');
  p.set('alumniVerified', verified ? 'true' : 'false');
  return `?${p.toString()}`;
}

export function usersListingAlumniDepartment(department: string): string {
  const p = new URLSearchParams();
  p.set('role', 'alumni');
  p.set('department', department);
  return `?${p.toString()}`;
}

export function usersListingAlumniGradYear(year: string): string {
  const p = new URLSearchParams();
  p.set('role', 'alumni');
  p.set('gradYear', year);
  return `?${p.toString()}`;
}

export function eventsListingForType(eventType: string): string {
  const p = new URLSearchParams();
  p.set('type', eventType.trim().toLowerCase());
  return `?${p.toString()}`;
}

export function eventsListingForStatus(status: string): string {
  const p = new URLSearchParams();
  p.set('status', status.trim().toLowerCase());
  return `?${p.toString()}`;
}
