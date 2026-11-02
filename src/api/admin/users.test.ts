import { test } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/api/db/prisma";
import { callArg, databaseMock, mockTransactions, restoreDatabaseMocksAfterEach } from "@/api/testing/prismaMock";
import { moderateUser } from "./users";

restoreDatabaseMocksAfterEach();

const admin = { id: "admin-1" };
const target = { id: "user-1", role: "USER", status: "ACTIVE" };

function banMocks(stories: { id: string }[] = []) {
  mockTransactions();
  databaseMock(prisma.user, "findUnique", async () => target);
  const user = databaseMock(prisma.user, "updateMany", async () => ({ count: 1 }));
  const sessions = databaseMock(prisma.session, "deleteMany", async () => ({ count: 2 }));
  const findStories = databaseMock(prisma.story, "findMany", async () => stories);
  const hide = databaseMock(prisma.story, "updateMany", async () => ({ count: stories.length }));
  const storyLogs = databaseMock(prisma.auditLog, "createMany", async () => ({ count: stories.length }));
  const audit = databaseMock(prisma.auditLog, "create", async () => ({}));
  return { user, sessions, findStories, hide, storyLogs, audit };
}

test("ban without hiding stories sets bannedAt/banReason and signs the user out", async () => {
  const mocks = banMocks();
  const result = await moderateUser("user-1", { action: "BAN", reason: "สแปม", hideStories: false }, admin);
  assert.equal(result.status, "BANNED");
  const args = callArg<{ where: unknown; data: { status: string; bannedAt: Date; banReason: string } }>(mocks.user);
  assert.deepEqual(args.where, { id: "user-1", status: "ACTIVE" });
  assert.equal(args.data.banReason, "สแปม");
  assert.ok(args.data.bannedAt instanceof Date);
  assert.deepEqual(callArg(mocks.sessions), { where: { userId: "user-1" } });
  assert.equal(mocks.hide.mock.callCount(), 0);
  assert.equal(callArg<{ data: { action: string } }>(mocks.audit).data.action, "USER_BAN");
});

test("ban with hiding stories takes down every published story with audit logs", async () => {
  const mocks = banMocks([{ id: "s1" }, { id: "s2" }]);
  const result = await moderateUser("user-1", { action: "BAN", reason: "เนื้อหาเท็จซ้ำ ๆ", hideStories: true }, admin);
  assert.equal(result.hiddenStories, 2);
  const hide = callArg<{ where: unknown; data: { status: string; rejectReason: string } }>(mocks.hide);
  assert.deepEqual(hide.where, { id: { in: ["s1", "s2"] }, status: "APPROVED" });
  assert.equal(hide.data.status, "REJECTED");
  assert.equal(hide.data.rejectReason, "เนื้อหาเท็จซ้ำ ๆ");
  const logs = callArg<{ data: { action: string }[] }>(mocks.storyLogs).data;
  assert.deepEqual(logs.map((log) => log.action), ["STORY_HIDE", "STORY_HIDE"]);
});

test("unban clears bannedAt and banReason", async () => {
  mockTransactions();
  databaseMock(prisma.user, "findUnique", async () => ({ ...target, status: "BANNED" }));
  const user = databaseMock(prisma.user, "updateMany", async () => ({ count: 1 }));
  const audit = databaseMock(prisma.auditLog, "create", async () => ({}));
  await moderateUser("user-1", { action: "UNBAN" }, admin);
  const args = callArg<{ where: unknown; data: unknown }>(user);
  assert.deepEqual(args.where, { id: "user-1", status: "BANNED" });
  assert.deepEqual(args.data, { status: "ACTIVE", bannedAt: null, banReason: null });
  assert.equal(callArg<{ data: { action: string } }>(audit).data.action, "USER_UNBAN");
});

test("admins and yourself cannot be banned (403)", async () => {
  databaseMock(prisma.user, "findUnique", async () => ({ ...target, role: "ADMIN" }));
  await assert.rejects(moderateUser("user-1", { action: "BAN", reason: "สแปม", hideStories: false }, admin), {
    status: 403,
  });
  databaseMock(prisma.user, "findUnique", async () => ({ ...target, id: "admin-1" }));
  await assert.rejects(moderateUser("admin-1", { action: "BAN", reason: "สแปม", hideStories: false }, admin), {
    status: 403,
  });
});

test("banning an already banned user is a 409", async () => {
  mockTransactions();
  databaseMock(prisma.user, "findUnique", async () => target);
  databaseMock(prisma.user, "updateMany", async () => ({ count: 0 }));
  await assert.rejects(moderateUser("user-1", { action: "BAN", reason: "สแปม", hideStories: false }, admin), {
    status: 409,
  });
});
