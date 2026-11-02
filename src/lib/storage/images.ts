export const COVER_BUCKET = "story-covers";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function detectImageType(bytes: Uint8Array): string | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  )
    return "image/jpeg";
  if (
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every(
      (value, index) => bytes[index] === value
    )
  )
    return "image/png";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  )
    return "image/webp";
  return null;
}

export function ownedCoverPath(
  url: string,
  baseUrl: string,
  authorId: string
): string | null {
  const prefix = `${baseUrl.replace(/\/$/, "")}/storage/v1/object/public/${COVER_BUCKET}/${encodeURIComponent(authorId)}/`;
  if (!baseUrl || !url.startsWith(prefix)) return null;
  const filename = url.slice(prefix.length);
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(filename)) return null;
  return `${authorId}/${filename}`;
}
