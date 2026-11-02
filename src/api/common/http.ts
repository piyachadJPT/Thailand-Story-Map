import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiErrorBody, ApiResponse, PaginatedResponse, PaginationMeta } from "@/models/types/api";
import { ApiError, TooManyRequestsError } from "./errors";

export function jsonOk<T>(data: T, init?: { message?: string; status?: number }) {
  const body: ApiResponse<T> = {
    success: true,
    data,
    ...(init?.message ? { message: init.message } : {}),
  };
  return NextResponse.json(body, { status: init?.status ?? 200 });
}

export function jsonPaginated<T>(data: T[], meta: PaginationMeta, status = 200) {
  const body: PaginatedResponse<T> = { success: true, data, meta };
  return NextResponse.json(body, { status });
}

export function jsonError(message: string, status = 400, code?: string) {
  const body: ApiErrorBody = { success: false, message, ...(code ? { code } : {}) };
  return NextResponse.json(body, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof TooManyRequestsError) {
    const response = jsonError(error.message, error.status, error.code);
    response.headers.set("Retry-After", String(error.retryAfter));
    return response;
  }
  if (error instanceof ApiError) {
    return jsonError(error.message, error.status, error.code);
  }
  if (error instanceof ZodError) {
    const message = error.issues.map((i) => i.message).join("; ") || "Validation failed";
    return jsonError(message, 422, "VALIDATION_ERROR");
  }
  console.error(error);
  return jsonError("Internal server error", 500, "INTERNAL_ERROR");
}
