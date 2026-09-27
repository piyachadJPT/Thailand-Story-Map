import { z } from "zod";

export const createReportSchema = z.object({
  storyId: z.string().uuid(),
  reason: z.string().min(10).max(1000),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
