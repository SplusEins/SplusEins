/**
 * Check that a value, e.g. parsed JSON, is an object, so its fields can be checked.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
