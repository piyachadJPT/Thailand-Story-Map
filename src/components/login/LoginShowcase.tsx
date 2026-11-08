import { createElement } from "react";
import CityMapPattern from "@/components/story/CityMapPattern";
import {
  categoryColor,
  categoryIcon,
  storyCategories,
} from "@/config/categories";
import { siteConfig } from "@/config/site";

/** Where each category pin sits on the illustration (percent of the panel). */
const pinSpots = [
  "top-[22%] left-[18%]",
  "top-[38%] left-[62%]",
  "top-[58%] left-[30%]",
  "top-[18%] left-[74%]",
  "top-[70%] left-[70%]",
];

/** Decorative night map with category pins; the login page's left side. */
export default function LoginShowcase() {
  return (
    <div
      aria-hidden="true"
      className="rounded-panel border-border bg-card text-foreground relative isolate flex min-h-80 flex-col justify-end overflow-hidden border p-6 sm:min-h-72 lg:min-h-full lg:p-10"
    >
      <CityMapPattern className="absolute inset-0 -z-10 size-full opacity-25" />

      {/* Pins stay in the top part so they never cover the text. */}
      <div className="absolute inset-x-0 top-0 -z-10 h-1/2">
        {storyCategories.map((category, index) => (
          <span
            key={category.slug}
            style={
              {
                "--pin-color": categoryColor(category.slug),
              } as React.CSSProperties
            }
            className={`absolute ${pinSpots[index]} bg-card grid size-11 place-items-center rounded-full border-2 border-(--pin-color) text-(--pin-color) after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-x-6 after:border-t-8 after:border-x-transparent after:border-t-(--pin-color)`}
          >
            {createElement(categoryIcon(category.slug), {
              className: "size-5",
            })}
          </span>
        ))}
      </div>

      <div className="relative max-w-md">
        <p className="text-chad inline-flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden="true" className="lai-prajamyam w-7" />
          {siteConfig.name}
        </p>
        <p className="font-heading text-foreground mt-3 text-2xl font-bold sm:text-3xl">
          {siteConfig.tagline}
        </p>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          {siteConfig.description}
        </p>
      </div>
    </div>
  );
}
