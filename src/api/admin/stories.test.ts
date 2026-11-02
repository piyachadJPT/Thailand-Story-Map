import { test } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/api/db/prisma";
import { callArg, databaseMock, mockTransactions, restoreDatabaseMocksAfterEach } from "@/api/testing/prismaMock";
import { moderateStorySchema } from "@/models/schemas/admin";
import { STALE_STATUS_MESSAGE, moderateStory } from "./stories";

restoreDatabaseMocksAfterEach();

const storyId = "11111111-1111-4111-8111-111111111111";

const cases = [
  { action: "APPROVE", from: "PENDING", to: "APPROVED", audit: "STORY_APPROVE" },
  { action: "REJECT", from: "PENDING", to: "REJECTED", audit: "STORY_REJECT", reason: "ไม่มีแหล่งอ้างอิง" },
  { action: "HIDE", from: "APPROVED", to: "REJECTED", audit: "STORY_HIDE", reason: "ละเมิดความเป็นส่วนตัว" },
  { action: "RESTORE", from: "REJECTED", to: "APPROVED", audit: "STORY_RESTORE" },
] as const;

for (const item of cases) {
  test(`${item.action}: ${item.from} → ${item.to} with an audit log`, async () => {
    mockTransactions();
    const update = databaseMock(prisma.story, "updateMany", async () => ({ count: 1 }));
    const audit = databaseMock(prisma.auditLog, "create", async () => ({}));
    const input = moderateStorySchema.parse({ action: item.action, reason: "reason" in item ? item.reason : undefined });
    const result = await moderateStory(storyId, input, "admin-1");
    assert.equal(result.status, item.to);
    const args = callArg<{ where: { id: string; status: string }; data: { status: string; rejectReason: string | null } }>(update);
    assert.deepEqual(args.where, { id: storyId, status: item.from });
    assert.equal(args.data.status, item.to);
    assert.equal(args.data.rejectReason, item.to === "REJECTED" ? item.reason : null);
    const log = callArg<{ data: Record<string, unknown> }>(audit).data;
    assert.equal(log.action, item.audit);
    assert.equal(log.targetType, "STORY");
    assert.equal(log.targetId, storyId);
  });
}

test("a status that no longer matches is a 409 and writes no audit log", async () => {
  mockTransactions();
  databaseMock(prisma.story, "updateMany", async () => ({ count: 0 }));
  databaseMock(prisma.story, "findUnique", async () => ({ id: storyId }));
  const audit = databaseMock(prisma.auditLog, "create", async () => ({}));
  await assert.rejects(moderateStory(storyId, { action: "APPROVE" }, "admin-1"), (error: Error & { status?: number }) => {
    assert.equal(error.status, 409);
    assert.equal(error.message, STALE_STATUS_MESSAGE);
    return true;
  });
  assert.equal(audit.mock.callCount(), 0);
});

test("a missing story is a 404", async () => {
  mockTransactions();
  databaseMock(prisma.story, "updateMany", async () => ({ count: 0 }));
  databaseMock(prisma.story, "findUnique", async () => null);
  await assert.rejects(moderateStory(storyId, { action: "RESTORE" }, "admin-1"), { status: 404 });
});

test("REJECT and HIDE require a reason (validation error, not 403)", () => {
  for (const action of ["REJECT", "HIDE"]) {
    const result = moderateStorySchema.safeParse({ action });
    assert.equal(result.success, false);
  }
  assert.equal(moderateStorySchema.safeParse({ action: "REJECT", reason: "ab" }).success, false);
  assert.equal(moderateStorySchema.safeParse({ action: "APPROVE" }).success, true);
});
