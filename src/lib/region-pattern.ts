/** Class names for the six regional border patterns (see globals.css, `.lai-*`). */
export type RegionLai =
  | "lai-central"
  | "lai-north"
  | "lai-isan"
  | "lai-south"
  | "lai-east"
  | "lai-west";

const patterns: Record<string, RegionLai> = {
  ภาคกลาง: "lai-central",
  ภาคเหนือ: "lai-north",
  ภาคตะวันออกเฉียงเหนือ: "lai-isan",
  ภาคใต้: "lai-south",
  ภาคตะวันออก: "lai-east",
  ภาคตะวันตก: "lai-west",
};

/**
 * Border pattern for a region name as written in thai-provinces.ts.
 * Unknown names fall back to the central pattern (ลายประจำยาม).
 */
export function regionLai(region: string): RegionLai {
  return patterns[region] ?? "lai-central";
}
