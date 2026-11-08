import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { StoryListItem } from "@/models/types/story";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { thaiOrdinal } from "@/lib/thai-digits";
import StoryRow from "./StoryRow";

type StorySectionProps = {
  index: number;
  icon: LucideIcon;
  title: string;
  description: string;
  stories: StoryListItem[];
  numbered?: boolean;
};

/** A titled row of stories, or a calm empty state when there are none yet. */
export default function StorySection({ index, icon, title, description, stories, numbered }: StorySectionProps) {
  return (
    <section aria-labelledby={`section-${index}`} className="space-y-6">
      <SectionHeading
        titleId={`section-${index}`}
        eyebrow={thaiOrdinal(index)}
        mark="fongman"
        title={title}
        description={description}
      />
      {stories.length > 0 ? (
        <StoryRow stories={stories} label={title} numbered={numbered} />
      ) : (
        <EmptyState
          icon={icon}
          title="จะทยอยอัปเดตจากเรื่องที่เผยแพร่บนแผนที่"
          action={
            <Link href="/" prefetch={false} className={buttonVariants({ variant: "outline", size: "sm" })}>
              กลับไปที่แผนที่
            </Link>
          }
        />
      )}
    </section>
  );
}
