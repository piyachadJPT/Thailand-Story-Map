export function getMapboxToken(): string | undefined {
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.MAPBOX_ACCESS_TOKEN;
}

export function assertMapboxToken(): string {
  const token = getMapboxToken();
  if (!token) {
    throw new Error("Set NEXT_PUBLIC_MAPBOX_TOKEN in .env (Mapbox → Access tokens)");
  }
  return token;
}
