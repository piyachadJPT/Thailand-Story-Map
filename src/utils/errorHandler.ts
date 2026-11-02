/** Thai message for HTTP 429, from the Retry-After header (seconds). */
export function rateLimitMessage(retryAfterSeconds?: number | null) {
  const seconds = Number(retryAfterSeconds);
  if (!Number.isFinite(seconds) || seconds <= 0) return "ส่งบ่อยเกินไป กรุณาลองใหม่ภายหลัง";
  if (seconds < 60) return `ส่งบ่อยเกินไป กรุณาลองใหม่ในอีก ${Math.ceil(seconds)} วินาที`;
  return `ส่งบ่อยเกินไป กรุณาลองใหม่ในอีก ${Math.ceil(seconds / 60)} นาที`;
}

export function retryAfterSeconds(headers: Headers | Record<string, unknown> | undefined) {
  const raw = headers instanceof Headers ? headers.get("retry-after") : headers?.["retry-after"];
  const seconds = Number(raw);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

/** Error message for a failed fetch() response with a JSON body. */
export function responseErrorMessage(
  response: Response,
  body: { message?: string } | null | undefined,
  fallback: string
) {
  if (response.status === 429) return rateLimitMessage(retryAfterSeconds(response.headers));
  return body?.message || fallback;
}

type AxiosLikeError = {
  message?: string;
  response?: { status?: number; data?: { message?: string }; headers?: Record<string, unknown> };
};

export const getErrorMessage = (error: unknown): string => {
  const err = error as AxiosLikeError | null | undefined;
  if (err?.response?.status === 429) return rateLimitMessage(retryAfterSeconds(err.response.headers));
  return err?.response?.data?.message || err?.message || "เกิดข้อผิดพลาด";
};
