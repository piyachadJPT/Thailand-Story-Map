import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/api/db/prisma";
import { callArg, databaseMock, restoreDatabaseMocksAfterEach } from "@/api/testing/prismaMock";
import { LOGIN_ERROR_MESSAGE, loginAdmin } from "./account";
import { DUMMY_HASH, hashPassword, verifyPassword } from "./password";

restoreDatabaseMocksAfterEach();

const meta = { ip: "203.0.113.5", userAgent: "test" };
let storedHash = "";

async function adminUser(overrides: Record<string, unknown> = {}) {
  storedHash ||= await hashPassword("a very long secret");
  return { id: "admin-1", passwordHash: storedHash, role: "ADMIN", status: "ACTIVE", ...overrides };
}

function sessionMocks() {
  databaseMock(prisma.adminSession, "deleteMany", async () => ({ count: 0 }));
  databaseMock(prisma.adminSession, "create", async () => ({ id: "session-1" }));
  return databaseMock(prisma.auditLog, "create", async () => ({}));
}

test("correct credentials create a session and an ADMIN_LOGIN audit entry", async () => {
  const user = await adminUser();
  databaseMock(prisma.user, "findUnique", async () => user);
  const audit = sessionMocks();
  const session = await loginAdmin({ username: "root", password: "a very long secret" }, meta);
  assert.ok(session.token.length > 20);
  const data = callArg<{ data: Record<string, string> }>(audit).data;
  assert.equal(data.action, "ADMIN_LOGIN");
  assert.match(data.note, /203\.0\.113\.5/);
});

const failures: [string, () => Promise<unknown>][] = [
  ["wrong password", async () => adminUser()],
  ["unknown username", async () => null],
  ["not an admin", async () => adminUser({ role: "USER" })],
  ["banned admin", async () => adminUser({ status: "BANNED" })],
  ["no password set", async () => adminUser({ passwordHash: null })],
];

for (const [name, lookup] of failures) {
  test(`login fails with the same message: ${name}`, async () => {
    const user = await lookup();
    databaseMock(prisma.user, "findUnique", async () => user);
    const created = sessionMocks();
    const password = name === "wrong password" ? "not the secret!!" : "a very long secret";
    await assert.rejects(loginAdmin({ username: "root", password }, meta), (error: Error & { status?: number }) => {
      assert.equal(error.message, LOGIN_ERROR_MESSAGE);
      assert.equal(error.status, 401);
      return true;
    });
    assert.equal(created.mock.callCount(), 0);
  });
}

test("an unknown username still runs a full password verification (dummy hash)", async () => {
  databaseMock(prisma.user, "findUnique", async () => null);
  sessionMocks();
  const verify = mock.fn(verifyPassword);
  await assert.rejects(loginAdmin({ username: "ghost", password: "whatever-long" }, meta, verify));
  assert.equal(verify.mock.callCount(), 1);
  assert.equal(verify.mock.calls[0].arguments[1], DUMMY_HASH);
});
