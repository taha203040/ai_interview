/**
 * Environment access helpers with clear configuration errors.
 *
 * These are server-only helpers. They never return secret values to the
 * browser; client code reads `NEXT_PUBLIC_*` values directly.
 */

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

/** Returns the trimmed value of an environment variable, or undefined. */
export function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

/** Returns true when the environment variable is set to a non-empty value. */
export function hasEnv(name: string): boolean {
  return getEnv(name) !== undefined;
}

/**
 * Returns the value of a required environment variable, throwing a clear
 * ConfigError (rather than an opaque SDK failure) when it is missing.
 */
export function getRequiredEnv(name: string, hint?: string): string {
  const value = getEnv(name);
  if (value === undefined) {
    const hintText = hint ? ` ${hint}` : "";
    throw new ConfigError(
      `Missing required environment variable "${name}".${hintText} Add it to .env.local (see .env.example).`
    );
  }
  return value;
}
