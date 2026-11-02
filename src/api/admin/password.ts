import { randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from "node:crypto";

const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 256;

/**
 * A valid hash of an unknown random password. Verifying against it when a
 * username does not exist takes the same time as a real check.
 */
export const DUMMY_HASH =
  "scrypt$16384$8$1$78c42568c8bba11d6459dc909c0218b0$46803ceeb196fddf3da8e20df0bf253ee762f51f03a7394679d749bbb7d82036531433bd8e0b785476cf4bbcf78c7178754bd08d4b9d35cb7969bd0e0fb0c568";

function scrypt(password: string, salt: Buffer, keylen: number, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keylen, options, (error, key) =>
      error ? reject(error) : resolve(key)
    );
  });
}

/** Format: scrypt$<N>$<r>$<p>$<salt hex>$<hash hex> */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${key.toString("hex")}`;
}

/** Constant-time check. A malformed stored hash returns false. */
export async function verifyPassword(password: string, stored: string) {
  try {
    const [scheme, n, r, p, saltHex, hashHex] = stored.split("$");
    const params = [Number(n), Number(r), Number(p)];
    if (
      scheme !== "scrypt" ||
      !params.every((value) => Number.isInteger(value) && value > 0) ||
      !/^[0-9a-f]+$/i.test(saltHex ?? "") ||
      !/^[0-9a-f]+$/i.test(hashHex ?? "") ||
      hashHex.length % 2 !== 0 ||
      params[0] > 1 << 20
    ) {
      return false;
    }
    const expected = Buffer.from(hashHex, "hex");
    const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length, {
      N: params[0],
      r: params[1],
      p: params[2],
      maxmem: 256 * params[0] * params[1] * params[2] + 1024 * 1024,
    });
    return expected.length > 0 && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/** Returns a Thai error message, or null when the password is acceptable. */
export function passwordPolicyError(password: string, username?: string | null) {
  if (password.length < PASSWORD_MIN_LENGTH)
    return `รหัสผ่านต้องยาวอย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`;
  if (password.length > PASSWORD_MAX_LENGTH)
    return `รหัสผ่านต้องยาวไม่เกิน ${PASSWORD_MAX_LENGTH} ตัวอักษร`;
  if (username && password.toLowerCase() === username.toLowerCase())
    return "รหัสผ่านต้องไม่ตรงกับชื่อผู้ใช้";
  return null;
}
