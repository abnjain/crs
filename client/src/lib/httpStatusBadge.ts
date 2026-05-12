/**
 * Theme badge class for HTTP status codes (100–599).
 */
export function httpStatusBadgeClass(code: number | string): string {
  const n = typeof code === 'string' ? Number.parseInt(code, 10) : code;
  if (!Number.isFinite(n) || n < 100 || n > 599) return 'badge-neutral';

  if (n >= 500) return 'badge-error';
  if (n >= 400) return 'badge-accent';
  if (n >= 300) return 'badge-warning';
  if (n >= 200) return 'badge-success';
  return 'badge-primary';
}
