import { prisma } from "@/api/db/prisma";
import { jsonOk, handleRouteError } from "@/api/common/http";
import { isSupabaseConfigured } from "@/config/supabase-env";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = {
      client: isSupabaseConfigured(),
      admin: isSupabaseAdminConfigured(),
    };

    if (!process.env.DATABASE_URL) {
      return jsonOk(
        { db: "not_configured", supabase },
        { message: "DATABASE_URL is missing — run npm run supabase:env after setting SUPABASE_PROJECT_REF" },
      );
    }

    await prisma.$queryRaw`SELECT 1`;
    return jsonOk({ db: "ok", supabase });
  } catch (error) {
    return handleRouteError(error);
  }
}
