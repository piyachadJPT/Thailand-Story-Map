import { test } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/api/db/prisma";
import { callArg, databaseMock, restoreDatabaseMocksAfterEach } from "@/api/testing/prismaMock";
import {
  ADMIN_SESSION_IDLE_MS,
  createAdminSession,
  hashSessionToken,
  resolveAdminSession,
} from "./session";

restoreDatabaseMocksAfterEach();

const now = new Date("2026-06-01T05:00:00Z");
const admin = {
  id: "admin-1",
  name: "root",
  email: "root@admin.local",
  username: "root",
  image: null,
  role: "ADMIN",
  status: "ACTIVE",
};

function storedSession(overrides: Record<string, unknown> = {}, user = admin) {
  return {
    id: "session-1",
    createdAt: new Date(now.getTime() - 60_000),
    expiresAt: new Date(now.getTime() + 60 * 60_000),
    lastSeenAt: new Date(now.getTime() - 60_000),
    user,
    ...overrides,
  };
}

test("creating a session stores only the token hash and clears expired sessions", async () => {
  const removed = databaseMock(prisma.adminSession, "deleteMany", async () => ({ count: 2 }));
  const created = databaseMock(prisma.adminSession, "create", async () => ({ id: "session-1" }));
  const result = await createAdminSession("admin-1", { ip: "1.2.3.4", userAgent: "UA" }, now);
  const data = callArg<{ data: Record<string, unknown> }>(created).data;
  assert.equal(data.tokenHash, hashSessionToken(result.token));
  assert.notEqual(data.tokenHash, result.token);
  assert.ok(!JSON.stringify(data).includes(result.token));
  assert.equal(result.expiresAt.getTime(), now.getTime() + 8 * 60 * 60 * 1000);
  assert.equal(callArg<{ where: { userId: string } }>(removed).where.userId, "admin-1");
});

test("a valid token resolves to the admin", async () => {
  const lookup = databaseMock(prisma.adminSession, "findUnique", async () => storedSession());
  const context = await resolveAdminSession("raw-token", now);
  assert.equal(context?.user.id, "admin-1");
  assert.equal(
    callArg<{ where: { tokenHash: string } }>(lookup).where.tokenHash,
    hashSessionToken("raw-token")
  );
});

test("an unknown or missing token resolves to null", async () => {
  databaseMock(prisma.adminSession, "findUnique", async () => null);
  assert.equal(await resolveAdminSession("wrong", now), null);
  assert.equal(await resolveAdminSession(undefined, now), null);
});

for (const [name, session] of [
  ["absolute expiry", storedSession({ expiresAt: new Date(now.getTime() - 1) })],
  ["idle timeout", storedSession({ lastSeenAt: new Date(now.getTime() - ADMIN_SESSION_IDLE_MS - 1) })],
  ["non-admin user", storedSession({}, { ...admin, role: "USER" })],
  ["banned admin", storedSession({}, { ...admin, status: "BANNED" })],
] as const) {
  test(`${name} returns null and deletes the session`, async () => {
    databaseMock(prisma.adminSession, "findUnique", async () => session);
    const removed = databaseMock(prisma.adminSession, "deleteMany", async () => ({ count: 1 }));
    assert.equal(await resolveAdminSession("raw-token", now), null);
    assert.deepEqual(callArg(removed), { where: { id: "session-1" } });
  });
}

test("lastSeenAt is refreshed at most every 5 minutes", async () => {
  databaseMock(prisma.adminSession, "findUnique", async () => storedSession());
  const touched = databaseMock(prisma.adminSession, "updateMany", async () => ({ count: 1 }));
  await resolveAdminSession("raw-token", now);
  assert.equal(touched.mock.callCount(), 0);

  databaseMock(prisma.adminSession, "findUnique", async () =>
    storedSession({ lastSeenAt: new Date(now.getTime() - 6 * 60_000) })
  );
  await resolveAdminSession("raw-token", now);
  assert.equal(touched.mock.callCount(), 1);
});
