import type { StoryListItem } from "@/models/types/story";
import StoryCard from "./StoryCard";

type StoryRowProps = {
  stories: StoryListItem[];
  label: string;
  /** Number the cards (a route to follow in order). */
  numbered?: boolean;
};

/**
 * Horizontal, snap-scrolling row of story cards. The list itself is
 * focusable so keyboard users can scroll it with the arrow keys.
 */
export default function StoryRow({ stories, label, numbered = false }: StoryRowProps) {
  return (
    <ul
      aria-label={label}
      tabIndex={0}
      className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pt-1 pb-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:-mx-6 sm:scroll-px-6 sm:px-6"
    >
      {stories.map((story, index) => (
        <li key={story.id} className="w-72 shrink-0 snap-start sm:w-80">
          <StoryCard story={story} step={numbered ? index + 1 : undefined} />
        </li>
      ))}
    </ul>
  );
}
