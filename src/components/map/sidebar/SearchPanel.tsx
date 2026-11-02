"use client";

import type { Ref } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CategoryFilter from "./CategoryFilter";
import ResultList from "./ResultList";
import SearchInput from "./SearchInput";
import SearchTabs from "./SearchTabs";
import type { StorySearch } from "./useStorySearch";

type SearchPanelProps = {
  search: StorySearch;
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
};

/** Tabs, search field, category filter and results — shared by both layouts. */
export default function SearchPanel({ search, inputRef, className }: SearchPanelProps) {
  return (
    <SearchTabs
      value={search.mode}
      onValueChange={search.setMode}
      className={cn("flex-1", className)}
    >
      <SearchInput
        ref={inputRef}
        mode={search.mode}
        value={search.query}
        onChange={search.setQuery}
        onSubmit={search.submit}
      />
      {search.mode !== "places" ? (
        <CategoryFilter value={search.categorySlug} onToggle={search.toggleCategory} />
      ) : null}
      {search.query || search.categorySlug ? (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit text-muted-foreground hover:text-foreground"
          onClick={search.clear}
        >
          <X aria-hidden="true" />
          ล้างการค้นหา
        </Button>
      ) : null}
      <ResultList search={search} />
    </SearchTabs>
  );
}
