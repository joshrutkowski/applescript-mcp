/**
 * Helpers for inserting tool arguments into generated AppleScript.
 *
 * Every caller-supplied value that is placed in script text must go through
 * one of these. A raw value inside "..." can close the literal and inject
 * AppleScript, which can run shell commands via `do shell script`.
 */

/**
 * Escape a value for use inside an AppleScript double-quoted string literal.
 * Backslash is escaped first, then double quote, so the value can never
 * terminate the literal.
 */
export function escapeAppleScriptString(value: unknown): string {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

/**
 * Coerce a value to an integer in [min, max]. Returns `fallback` when the
 * value is missing or not a finite number. Use for any number placed in
 * script text, since tool arguments are not schema-validated at runtime.
 */
export function toBoundedInt(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  if (value === undefined || value === null || value === "") return fallback;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

/** Escape a value for use inside a single-quoted SQL string literal. */
export function escapeSqlString(value: unknown): string {
  return String(value ?? "").replace(/'/g, "''");
}
