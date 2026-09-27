#!/usr/bin/env node
/**
 * Prints Supabase URL + Prisma DATABASE_URL / DIRECT_URL from project ref + DB password.
 * Dashboard → Project Settings → General → Reference ID
 * Dashboard → Database → Connection string (verify region if pooler host fails)
 */
const ref = process.env.SUPABASE_PROJECT_REF?.trim();
const password = process.env.SUPABASE_DB_PASSWORD?.trim();
const region = process.env.SUPABASE_DB_REGION?.trim() || "ap-southeast-1";

if (!ref || !password) {
  console.error(
    "Set SUPABASE_PROJECT_REF and SUPABASE_DB_PASSWORD in .env (or export) then run: npm run supabase:env",
  );
  process.exit(1);
}

const encoded = encodeURIComponent(password);

console.log(`NEXT_PUBLIC_SUPABASE_URL=https://${ref}.supabase.co`);
console.log(
  `DATABASE_URL=postgresql://postgres.${ref}:${encoded}@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`,
);
console.log(
  `DIRECT_URL=postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`,
);
console.error(
  "\nIf connection fails, copy exact strings from Supabase Dashboard → Connect → ORM (Prisma).",
);
