import { api } from "@/lib/axios";
import type { ApiResponse } from "@/models/types/api";
import type { CreateReportInput } from "@/models/schemas";

export const reportsClient = {
  create(payload: CreateReportInput) {
    return api.post<ApiResponse<{ id: string; status: string }>>("/api/reports", payload);
  },
};
