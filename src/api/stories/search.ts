import type { Prisma } from "@prisma/client";

/** Every word must match somewhere in the story or its related metadata. */
export function storySearchConditions(
  query?: string
): Prisma.StoryWhereInput[] {
  const terms = [...new Set(query?.trim().split(/\s+/).filter(Boolean) ?? [])];
  return terms.map((term) => {
    const contains = { contains: term, mode: "insensitive" as const };
    return {
      OR: [
        { title: contains },
        { summary: contains },
        { content: contains },
        { province: { name: contains } },
        { category: { name: contains } },
        {
          tags: {
            some: { tag: { OR: [{ name: contains }, { slug: contains }] } },
          },
        },
        { author: { name: contains } },
      ],
    };
  });
}
