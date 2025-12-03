/**
 * Converts undefined to null for Prisma unique constraints
 */
export function toNullable<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

/**
 * Creates a composite key for unique constraints with optional fields
 */
export function createCompositeKey(
  required: Record<string, string>,
  optional: Record<string, string | undefined>
) {
  const result: Record<string, string | null> = { ...required };
  
  for (const [key, value] of Object.entries(optional)) {
    result[key] = value ?? null;
  }
  
  return result;
}