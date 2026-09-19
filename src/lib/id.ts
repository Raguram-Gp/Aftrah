/** Canonical entity id: UUID v4. Never invent human-readable slugs. */
export const newId = (): string => crypto.randomUUID();
