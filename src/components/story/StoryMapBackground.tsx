import CityMapPattern from "./CityMapPattern";

/** Decorative street map; independent of map services and story coordinates. */
export default function StoryMapBackground() {
  return (
    <div
      aria-hidden="true"
      inert
      className="bg-background text-foreground pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <CityMapPattern className="absolute -inset-3 size-[calc(100%+1.5rem)] opacity-25 blur-[1.5px]" />
      {/* Night veil: fades the city out toward the reading area, with a low gold glow. */}
      <div className="from-background/20 to-background/85 absolute inset-0 bg-linear-to-b via-transparent via-35%" />
      <div className="bg-gold/10 absolute -top-40 right-[-10%] size-[36rem] rounded-full blur-3xl" />
    </div>
  );
}
