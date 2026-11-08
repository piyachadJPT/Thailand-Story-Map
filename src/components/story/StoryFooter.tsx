import { getMapboxToken } from "@/config/mapbox";
import SourceLink from "./SourceLink";
import StoryLocationMap from "./StoryLocationMap";
import ReportStoryButton from "./report/ReportStoryButton";
import type { StoryView } from "./storyView";

type StoryFooterProps = {
  storyId: string;
  title: string;
  tags: { id: string; name: string }[];
  source: StoryView["source"];
  latitude: number;
  longitude: number;
  provinceName: string;
  categorySlug: string;
  mapHref: string;
};

/** Tags, source and a mini map back to the pin. */
export default function StoryFooter(props: StoryFooterProps) {
  return (
    <footer className="mx-auto max-w-170 space-y-6">
      {props.tags.length > 0 ? (
        <ul aria-label="แท็กเรื่องราว" className="flex flex-wrap gap-2">
          {props.tags.map((tag) => (
            <li
              key={tag.id}
              className="inline-flex h-8 items-center rounded-control border border-border bg-card px-3 text-sm text-foreground"
            >
              <span aria-hidden="true" className="mr-0.5 text-gold-ink">
                #
              </span>
              {tag.name}
            </li>
          ))}
        </ul>
      ) : null}

      {props.source ? <SourceLink {...props.source} /> : null}

      <StoryLocationMap
        token={getMapboxToken()}
        latitude={props.latitude}
        longitude={props.longitude}
        title={props.title}
        provinceName={props.provinceName}
        categorySlug={props.categorySlug}
        href={props.mapHref}
      />

      <ReportStoryButton storyId={props.storyId} title={props.title} />
    </footer>
  );
}
