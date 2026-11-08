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

  // Gold on the nav bar in both themes.
  const classes = cn(
    buttonVariants({ size: "sm" }),
    "bg-gold text-gold-foreground hover:bg-gold/90 focus-visible:ring-offset-nav",
    className
  );
  const content = (
    <>
      <Feather aria-hidden="true" />
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
