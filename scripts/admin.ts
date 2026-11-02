/**
 * Backoffice admin accounts.
 *   npm run admin:create | admin:password | admin:disable | admin:list
 * Passwords are only ever typed at a hidden prompt — never taken from
 * arguments or env, and never printed.
 */
import { createInterface } from "node:readline/promises";
import { PrismaClient } from "@prisma/client";
import { hashPassword, passwordPolicyError } from "../src/api/admin/password";

const prisma = new PrismaClient();
const USERNAME_PATTERN = /^[a-z0-9_.]{3,32}$/;

async function ask(question: string) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

/** Reads a line without echoing it. Requires an interactive terminal. */
function askHidden(question: string) {
  const stdin = process.stdin;
  if (!stdin.isTTY) throw new Error("ต้องรันในเทอร์มินัลแบบโต้ตอบ (TTY) เพื่อพิมพ์รหัสผ่าน");
  process.stdout.write(question);
  return new Promise<string>((resolve, reject) => {
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const finish = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off("data", onData);
      process.stdout.write("\n");
    };
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") {
          finish();
          resolve(value);
          return;
        }
        if (char === "\u0003") {
          finish();
          reject(new Error("ยกเลิก"));
          return;
        }
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else if (char >= " ") value += char;
      }
    };
    stdin.on("data", onData);
  });
}

async function askUsername() {
  const username = (await ask("ชื่อผู้ใช้ (a–z, 0–9, _ .  3–32 ตัว): ")).toLowerCase();
  if (!USERNAME_PATTERN.test(username)) throw new Error("ชื่อผู้ใช้ไม่ถูกต้อง: ใช้ได้เฉพาะ a–z, 0–9, _ และ . ยาว 3–32 ตัว");
  return username;
}

async function askNewPassword(username: string) {
  const password = await askHidden("รหัสผ่านใหม่ (อย่างน้อย 12 ตัว): ");
  const policy = passwordPolicyError(password, username);
  if (policy) throw new Error(policy);
  const confirm = await askHidden("พิมพ์รหัสผ่านอีกครั้ง: ");
  if (confirm !== password) throw new Error("รหัสผ่านทั้งสองครั้งไม่ตรงกัน");
  return password;
}

async function create() {
  const username = await askUsername();
  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email: `${username}@admin.local` }] },
    select: { id: true },
  });
  if (existing) throw new Error(`มีชื่อผู้ใช้ "${username}" อยู่แล้ว ใช้ npm run admin:password เพื่อตั้งรหัสใหม่`);
  const passwordHash = await hashPassword(await askNewPassword(username));
  await prisma.user.create({
    data: {
      username,
      email: `${username}@admin.local`,
      name: username,
      role: "ADMIN",
      status: "ACTIVE",
      passwordHash,
    },
    select: { id: true },
  });
  console.log(`สร้างบัญชีแอดมิน "${username}" แล้ว`);
}

async function findAdmin(username: string) {
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) throw new Error(`ไม่พบชื่อผู้ใช้ "${username}" — ดูรายชื่อด้วย npm run admin:list`);
  return user;
}

async function password() {
  const username = await askUsername();
  const user = await findAdmin(username);
  const passwordHash = await hashPassword(await askNewPassword(username));
  const [, sessions] = await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash }, select: { id: true } }),
    prisma.adminSession.deleteMany({ where: { userId: user.id } }),
  ]);
  console.log(`ตั้งรหัสผ่านใหม่ให้ "${username}" แล้ว และออกจากระบบ ${sessions.count} อุปกรณ์`);
}

async function disable() {
  const username = await askUsername();
  const user = await findAdmin(username);
  const answer = await ask(`ยืนยันปิดบัญชี "${username}"? พิมพ์ชื่อผู้ใช้อีกครั้งเพื่อยืนยัน: `);
  if (answer.toLowerCase() !== username) throw new Error("ยกเลิก");
  // Keep the row: audit logs reference it.
  const [, sessions] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { status: "BANNED", bannedAt: new Date(), banReason: "ปิดบัญชีแอดมินด้วย admin:disable" },
      select: { id: true },
    }),
    prisma.adminSession.deleteMany({ where: { userId: user.id } }),
  ]);
  console.log(`ปิดบัญชี "${username}" แล้ว และออกจากระบบ ${sessions.count} อุปกรณ์`);
}

async function list() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", username: { not: null } },
    orderBy: { createdAt: "asc" },
    select: {
      username: true,
      status: true,
      createdAt: true,
      adminSessions: { select: { lastSeenAt: true }, orderBy: { lastSeenAt: "desc" }, take: 1 },
      auditLogs: {
        where: { action: "ADMIN_LOGIN" },
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!admins.length) {
    console.log("ยังไม่มีบัญชีแอดมิน — รัน npm run admin:create");
    return;
  }
  const format = (date?: Date) =>
    date
      ? date.toLocaleString("th-TH", { timeZone: "Asia/Bangkok", dateStyle: "medium", timeStyle: "short" })
      : "—";
  console.table(
    admins.map((admin) => ({
      username: admin.username,
      สถานะ: admin.status,
      สร้างเมื่อ: format(admin.createdAt),
      ล็อกอินล่าสุด: format(admin.auditLogs[0]?.createdAt),
    }))
  );
}

const commands: Record<string, () => Promise<void>> = { create, password, disable, list };

async function main() {
  const command = commands[process.argv[2] ?? ""];
  if (!command) throw new Error("ใช้: tsx scripts/admin.ts <create|password|disable|list>");
  await command();
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
