"use client";

import Link from "next/link";
import { Feather } from "lucide-react";
import { useSession } from "next-auth/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const label = "เขียนเรื่องราว";

type WriteStoryButtonProps = {
  isHome: boolean;
  /** Called before the composer opens (e.g. to collapse the nav). */
  onOpen?: () => void;
  className?: string;
};

/**
 * Logged in on the map: opens the composer in place.
 * Logged in elsewhere: goes to the map with the composer open.
 * Logged out: goes to login, then back to the composer.
 */
export default function WriteStoryButton({
  isHome,
  onOpen,
  className,
}: WriteStoryButtonProps) {
  const { data: session, status } = useSession();
  if (status === "loading") return null;

  const classes = cn(
    buttonVariants({ variant: "primary", size: "lg" }),
    "h-14 gap-2.5 pr-6 pl-2 ring-1 ring-gold/40 hover:ring-gold",
    className
  );
  const content = (
    <>
      <span className="grid size-10 place-items-center rounded-full bg-gold text-gold-foreground">
        <Feather aria-hidden="true" className="size-4" />
      </span>
      {label}
    </>
  );

  if (session?.user && isHome) {
    return (
      <button
        type="button"
        className={classes}
        onClick={() => {
          onOpen?.();
          window.dispatchEvent(new Event("story-composer-open"));
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={session?.user ? "/?compose=1" : "/login?callbackUrl=%2F%3Fcompose%3D1"}
      className={classes}
    >
      {content}
    </Link>
  );
}
