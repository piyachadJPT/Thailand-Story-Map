import CityMapPattern from "./CityMapPattern";

/** Decorative street map; independent of map services and story coordinates. */
export default function StoryMapBackground() {
  return (
    <div
      aria-hidden="true"
      inert
      className="text-foreground pointer-events-none absolute inset-x-0 top-0 z-0 h-[42rem] overflow-hidden"
    >
      {/* Faint street lines behind the header only; scrolls with the page and fades out before the story text. */}
      <CityMapPattern className="absolute inset-0 size-full opacity-15 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
    </div>
  );
}
