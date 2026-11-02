import { api } from "@/lib/axios";
import type { ApiResponse } from "@/models/types/api";
import type { CreateReportInput } from "@/models/schemas";

export type CreatedReport = { id: string; status: string; createdAt: string };

export const reportsClient = {
  /** body: { storyId, reasonType, details } */
  create(payload: CreateReportInput) {
    return api.post<ApiResponse<CreatedReport>>("/api/reports", payload);
  },
};
