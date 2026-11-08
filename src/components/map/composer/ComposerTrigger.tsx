import Link from "next/link";
import type { Ref } from "react";
import { Feather } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const classes = cn(
  buttonVariants({ size: "lg" }),
  "absolute bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4rem)] left-1/2 z-40 h-12 -translate-x-1/2 gap-2 px-5 lg:hidden"
);

const content = (
  <>
    <Feather aria-hidden="true" />
    เขียนเรื่องราว
  </>
);

type ComposerTriggerProps = {
  loggedIn: boolean;
  onOpen?: () => void;
  ref?: Ref<HTMLButtonElement>;
};

/** Mobile floating "เขียนเรื่องราว": opens the composer, or goes to login. */
export default function ComposerTrigger({ loggedIn, onOpen, ref }: ComposerTriggerProps) {
  if (!loggedIn) {
    return (
      <Link href="/login?callbackUrl=%2F" className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      ref={ref}
      aria-expanded={false}
      aria-controls="story-composer"
      onClick={onOpen}
      className={classes}
    >
      {content}
    </button>
  );
}
