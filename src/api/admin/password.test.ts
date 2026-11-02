import { test } from "node:test";
import assert from "node:assert/strict";
import { DUMMY_HASH, hashPassword, passwordPolicyError, verifyPassword } from "./password";

test("hash then verify accepts the right password and rejects others", async () => {
  const hash = await hashPassword("correct horse battery");
  assert.match(hash, /^scrypt\$16384\$8\$1\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  assert.equal(await verifyPassword("correct horse battery", hash), true);
  assert.equal(await verifyPassword("correct horse batterY", hash), false);
});

test("malformed hashes return false instead of throwing", async () => {
  for (const bad of ["", "scrypt$1$2", "bcrypt$16384$8$1$aa$bb", "scrypt$x$8$1$aa$bb", "scrypt$16384$8$1$zz$bb"]) {
    assert.equal(await verifyPassword("anything", bad), false);
  }
});

test("each hash uses a fresh salt", async () => {
  const [a, b] = await Promise.all([hashPassword("same password 123"), hashPassword("same password 123")]);
  assert.notEqual(a.split("$")[4], b.split("$")[4]);
  assert.notEqual(a, b);
});

test("dummy hash is well formed and never matches an empty password", async () => {
  assert.equal(await verifyPassword("", DUMMY_HASH), false);
});

test("policy requires 12+ characters and differs from the username", () => {
  assert.match(passwordPolicyError("short", "admin") ?? "", /12/);
  assert.match(passwordPolicyError("SuperAdmin01", "superadmin01") ?? "", /ชื่อผู้ใช้/);
  assert.equal(passwordPolicyError("a long enough secret", "admin"), null);
});
