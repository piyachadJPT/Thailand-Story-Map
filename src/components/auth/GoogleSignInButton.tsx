"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.86c2.26-2.08 3.58-5.15 3.58-8.64Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.86-3c-1.07.72-2.45 1.15-4.09 1.15-3.14 0-5.8-2.12-6.75-4.97H1.26v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.25 14.27A7.2 7.2 0 0 1 4.87 12c0-.79.14-1.55.38-2.27V6.64H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.36l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.14 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.64l3.99 3.09C6.2 6.88 8.86 4.75 12 4.75Z"
      />
    </svg>
  );
}

export default function GoogleSignInButton({
  callbackUrl = "/",
  className,
}: {
  callbackUrl?: string;
  className?: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        void signIn("google", { callbackUrl }).catch(() => setPending(false));
      }}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-all hover:scale-[1.02] hover:bg-foreground/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70",
        className,
      )}
    >
      <GoogleMark />
      {pending ? "กำลังไปที่ Google…" : "เข้าสู่ระบบด้วย Google"}
    </button>
  );
}
