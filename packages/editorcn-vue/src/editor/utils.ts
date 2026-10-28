/**
 * Joins class names. The components ship their own CSS, so there is no
 * Tailwind merge to resolve — a falsy-aware join is all that is needed.
 */
export const cn = (...inputs: unknown[]) => inputs.filter(Boolean).join(" ");
