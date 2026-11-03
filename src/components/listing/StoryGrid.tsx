import StoryCard from "@/components/story/StoryCard";
import type { StoryListItem } from "@/models/types/story";

export default function StoryGrid({ stories, label }: { stories: StoryListItem[]; label: string }) {
  return (
    <ul aria-label={label} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => (
        <li key={story.id}>
          <StoryCard story={story} />
        </li>
      ))}
    </ul>
  );
}
