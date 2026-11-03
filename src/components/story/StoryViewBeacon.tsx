"use client";

import { useEffect, useRef } from "react";

/** Story ids already reported during this page session (survives StrictMode remounts). */
const sent = new Set<string>();

/** Reports one read after the page has loaded. Renders nothing. */
export default function StoryViewBeacon({ storyId }: { storyId: string }) {
  const done = useRef(false);

  useEffect(() => {
    if (done.current || sent.has(storyId)) return;
    done.current = true;
    sent.add(storyId);
    const url = `/api/stories/${encodeURIComponent(storyId)}/view`;
    if (typeof navigator.sendBeacon === "function" && navigator.sendBeacon(url)) return;
    void fetch(url, { method: "POST", keepalive: true }).catch(() => undefined);
  }, [storyId]);

  return null;
}
