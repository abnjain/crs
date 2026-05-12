/** Stable string id for Mongo-style values from API / table rows */
export function normalizeMongoId(raw: unknown): string {
  if (raw == null) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object' && raw !== null && '$oid' in raw) {
    const oid = (raw as { $oid: unknown }).$oid;
    if (typeof oid === 'string') return oid;
  }
  try {
    return String(raw);
  } catch {
    return '';
  }
}
