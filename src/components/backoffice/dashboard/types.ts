import type { getOverview, getOverviewMap } from "@/api/admin/overview";
import type { Jsonify } from "@/models/types/admin";

export type Overview = Jsonify<Awaited<ReturnType<typeof getOverview>>>;
export type MapPoint = Jsonify<Awaited<ReturnType<typeof getOverviewMap>>>[number];
