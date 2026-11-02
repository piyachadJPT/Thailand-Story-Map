import { afterEach, mock } from "node:test";
import { prisma } from "@/api/db/prisma";

/**
 * Replaces Prisma delegate methods in tests; nothing reaches a real database.
 * Call `restoreDatabaseMocksAfterEach()` once per test file to restore originals after each test.
 */
const restore: (() => void)[] = [];

export function databaseMock<T extends object>(
  delegate: T,
  key: keyof T,
  implementation: (...args: never[]) => unknown
) {
  const original = delegate[key];
  const replacement = mock.fn(implementation as (...args: unknown[]) => unknown);
  Reflect.set(delegate, key, replacement);
  restore.push(() => Reflect.set(delegate, key, original));
  return replacement;
}

/** Interactive transactions run against the same mocked client. */
export function mockTransactions() {
  return databaseMock(prisma, "$transaction", ((arg: unknown) =>
    typeof arg === "function"
      ? (arg as (tx: typeof prisma) => unknown)(prisma)
      : Promise.all(arg as Promise<unknown>[])) as never);
}

export function restoreDatabaseMocksAfterEach() {
  afterEach(() => {
    mock.restoreAll();
    restore
      .splice(0)
      .reverse()
      .forEach((undo) => undo());
  });
}

/** First argument of the n-th call to a mocked function. */
export function callArg<T = Record<string, unknown>>(fn: ReturnType<typeof mock.fn>, index = 0) {
  return fn.mock.calls[index]?.arguments[0] as T;
}
