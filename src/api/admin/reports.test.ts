import { test } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/api/db/prisma";
import { callArg, databaseMock, mockTransactions, restoreDatabaseMocksAfterEach } from "@/api/testing/prismaMock";
import { createReport, DUPLICATE_REPORT_MESSAGE } from "@/api/reports/service";
import { createReportSchema } from "@/models/schemas";
import { resolveStoryReports } from "./reports";

restoreDatabaseMocksAfterEach();

const storyId = "22222222-2222-4222-8222-222222222222";
const input = createReportSchema.parse({
  storyId,
  reasonType: "FALSE_INFO",
  details: "ข้อมูลในเรื่องนี้ไม่ตรงกับข่าว",
});

test("reporting a published story stores type and details", async () => {
  databaseMock(prisma.story, "findFirst", async () => ({ id: storyId }));
  databaseMock(prisma.report, "findFirst", async () => null);
  const created = databaseMock(prisma.report, "create", async () => ({ id: "r1", status: "OPEN" }));
  await createReport(input, "user-1");
  const data = callArg<{ data: Record<string, unknown> }>(created).data;
  assert.deepEqual(data, { storyId, reasonType: "FALSE_INFO", reason: input.details, reporterId: "user-1" });
});

test("anonymous reports are allowed and skip the duplicate check", async () => {
  databaseMock(prisma.story, "findFirst", async () => ({ id: storyId }));
  const duplicate = databaseMock(prisma.report, "findFirst", async () => ({ id: "old" }));
  const created = databaseMock(prisma.report, "create", async () => ({ id: "r1" }));
  await createReport(input);
  assert.equal(duplicate.mock.callCount(), 0);
  assert.equal(callArg<{ data: { reporterId: null } }>(created).data.reporterId, null);
});

test("a story that is not APPROVED cannot be reported (404)", async () => {
  const lookup = databaseMock(prisma.story, "findFirst", async () => null);
  await assert.rejects(createReport(input, "user-1"), { status: 404 });
  assert.deepEqual(callArg<{ where: unknown }>(lookup).where, { id: storyId, status: "APPROVED" });
});

test("a second open report from the same user is a 409", async () => {
  databaseMock(prisma.story, "findFirst", async () => ({ id: storyId }));
  databaseMock(prisma.report, "findFirst", async () => ({ id: "existing" }));
  const created = databaseMock(prisma.report, "create", async () => ({}));
  await assert.rejects(createReport(input, "user-1"), { status: 409, message: DUPLICATE_REPORT_MESSAGE });
  assert.equal(created.mock.callCount(), 0);
});

test("OTHER needs at least 20 characters of detail", () => {
  const short = createReportSchema.safeParse({ storyId, reasonType: "OTHER", details: "สั้นเกินไปนะครับ" });
  assert.equal(short.success, false);
});

test("DISMISS closes every open report of the story", async () => {
  mockTransactions();
  databaseMock(prisma.story, "findUnique", async () => ({ id: storyId, status: "APPROVED" }));
  const storyUpdate = databaseMock(prisma.story, "updateMany", async () => ({ count: 1 }));
  const reports = databaseMock(prisma.report, "updateMany", async () => ({ count: 3 }));
  const audit = databaseMock(prisma.auditLog, "create", async () => ({}));
  const result = await resolveStoryReports(storyId, { action: "DISMISS" }, "admin-1");
  assert.equal(result.resolved, 3);
  assert.equal(storyUpdate.mock.callCount(), 0);
  const args = callArg<{ where: unknown; data: Record<string, unknown> }>(reports);
  assert.deepEqual(args.where, { storyId, status: "OPEN" });
  assert.equal(args.data.status, "RESOLVED");
  assert.equal(args.data.resolution, "DISMISSED");
  assert.equal(args.data.resolvedById, "admin-1");
  assert.equal(callArg<{ data: { action: string } }>(audit).data.action, "REPORT_DISMISS");
});

test("HIDE_STORY hides an approved story and closes every open report", async () => {
  mockTransactions();
  databaseMock(prisma.story, "findUnique", async () => ({ id: storyId, status: "REJECTED" }));
  const storyUpdate = databaseMock(prisma.story, "updateMany", async () => ({ count: 1 }));
  const reports = databaseMock(prisma.report, "updateMany", async () => ({ count: 2 }));
  const audit = databaseMock(prisma.auditLog, "create", async () => ({}));
  const result = await resolveStoryReports(storyId, { action: "HIDE_STORY", note: "ข้อมูลเท็จ" }, "admin-1");
  assert.equal(result.storyHidden, true);
  assert.deepEqual(callArg<{ where: unknown }>(storyUpdate).where, { id: storyId, status: "APPROVED" });
  assert.equal(callArg<{ data: { resolution: string } }>(reports).data.resolution, "STORY_HIDDEN");
  const actions = audit.mock.calls.map((call) => (call.arguments[0] as { data: { action: string } }).data.action);
  assert.deepEqual(actions, ["STORY_HIDE", "REPORT_HIDE_STORY"]);
});

test("HIDE_STORY on a story that is no longer APPROVED only closes the reports", async () => {
  mockTransactions();
  databaseMock(prisma.story, "findUnique", async () => ({ id: storyId, status: "REJECTED" }));
  databaseMock(prisma.story, "updateMany", async () => ({ count: 0 }));
  databaseMock(prisma.report, "updateMany", async () => ({ count: 1 }));
  const audit = databaseMock(prisma.auditLog, "create", async () => ({}));
  const result = await resolveStoryReports(storyId, { action: "HIDE_STORY", note: "ซ้ำ" }, "admin-1");
  assert.equal(result.storyHidden, false);
  assert.equal(audit.mock.callCount(), 1);
});
