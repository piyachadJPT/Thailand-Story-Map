import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma ไม่โหลด .env อัตโนมัติเมื่อมี prisma.config.ts
// (บน production/CI env ถูกตั้งไว้แล้ว จึงข้ามได้ถ้าไม่มีไฟล์)
try {
  process.loadEnvFile();
} catch {
  // no .env file
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
});
