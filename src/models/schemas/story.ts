import { z } from "zod";
import { StoryStatus } from "@/models/enums";

export const storyImageInputSchema = z.object({
  url: z.string().url(),
  altText: z.string().max(200).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const createStorySchema = z.object({
  title: z.string().min(3).max(200),
  summary: z.string().min(10).max(500),
  content: z.string().min(50),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  provinceId: z.string().uuid(),
  categoryId: z.string().uuid(),
  sourceUrl: z.string().url().optional(),
  isSensitive: z.boolean().default(false),
  tagIds: z.array(z.string().uuid()).max(20).default([]),
  images: z.array(storyImageInputSchema).max(10).default([]),
  coverUrl: z.string().url().nullable().optional(),
  status: z
    .enum([StoryStatus.DRAFT, StoryStatus.PENDING])
    .default(StoryStatus.PENDING),
});

export type CreateStoryInput = z.infer<typeof createStorySchema>;

export const updateStorySchema = createStorySchema
  .omit({
    status: true,
    tagIds: true,
    images: true,
  })
  .extend({ sourceUrl: z.string().url().nullable() });

export type UpdateStoryInput = z.infer<typeof updateStorySchema>;

export const listStoriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categorySlug: z.string().optional(),
  provinceSlug: z.string().optional(),
  tagSlug: z.string().optional(),
  q: z.string().max(100).optional(),
  sort: z.enum(["popular", "recent"]).default("popular"),
  /** Public map/list defaults to APPROVED only */
  status: z
    .enum([
      StoryStatus.DRAFT,
      StoryStatus.PENDING,
      StoryStatus.APPROVED,
      StoryStatus.REJECTED,
    ])
    .optional(),
});

export type ListStoriesQuery = z.infer<typeof listStoriesQuerySchema>;
