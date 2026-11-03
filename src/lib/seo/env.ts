type IndexEnv = { NODE_ENV?: string; VERCEL_ENV?: string; NEXT_PUBLIC_NOINDEX?: string };

/**
 * True only for the public production site. Vercel previews also run with
 * NODE_ENV=production, so VERCEL_ENV wins when it is set.
 */
export function isIndexable(
  env: IndexEnv = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_NOINDEX: process.env.NEXT_PUBLIC_NOINDEX,
  }
): boolean {
  if (env.NEXT_PUBLIC_NOINDEX === "true") return false;
  if (env.VERCEL_ENV) return env.VERCEL_ENV === "production";
  return env.NODE_ENV === "production";
}
