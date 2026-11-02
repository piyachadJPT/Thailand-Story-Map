"use client";

import { useState } from "react";
import { Check, ExternalLink, EyeOff, MoreHorizontal, RotateCcw, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReasonDialog from "../ReasonDialog";
import { useModerateStory } from "../moderation";

type Story = { id: string; title: string; slug: string; status: string; province: { slug: string } };

/** Row "⋯" menu: open the public page, and the transitions allowed from this status. */
export default function StoryActionsMenu({ story }: { story: Story }) {
  const moderate = useModerateStory();
  const [dialog, setDialog] = useState<"REJECT" | "HIDE" | null>(null);
  const publicHref = `/story/${story.province.slug}/${story.slug}`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`การจัดการเรื่อง ${story.title}`}
          className="grid size-9 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/6 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 data-popup-open:bg-foreground/6"
        >
          <MoreHorizontal aria-hidden="true" className="size-[18px]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5">
          {story.status === "APPROVED" ? (
            <DropdownMenuItem
              render={<a href={publicHref} target="_blank" rel="noopener noreferrer" />}
            >
              <ExternalLink aria-hidden="true" />
              เปิดหน้าจริง
            </DropdownMenuItem>
          ) : null}
          {story.status === "PENDING" ? (
            <>
              <DropdownMenuItem
                disabled={moderate.isPending}
                onClick={() => moderate.mutate({ id: story.id, action: "APPROVE" })}
              >
                <Check aria-hidden="true" />
                อนุมัติ
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setDialog("REJECT")}>
                <X aria-hidden="true" />
                ปฏิเสธ…
              </DropdownMenuItem>
            </>
          ) : null}
          {story.status === "APPROVED" ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setDialog("HIDE")}>
                <EyeOff aria-hidden="true" />
                ซ่อนเรื่อง…
              </DropdownMenuItem>
            </>
          ) : null}
          {story.status === "REJECTED" ? (
            <DropdownMenuItem
              disabled={moderate.isPending}
              onClick={() => moderate.mutate({ id: story.id, action: "RESTORE" })}
            >
              <RotateCcw aria-hidden="true" />
              กู้คืน (เผยแพร่อีกครั้ง)
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <ReasonDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        title={dialog === "HIDE" ? "ซ่อนเรื่องนี้จากแผนที่?" : "ปฏิเสธเรื่องนี้?"}
        target={story.title}
        description={
          dialog === "HIDE"
            ? "เรื่องจะหายจากแผนที่และหน้าอ่านทันที ผู้เขียนแก้แล้วส่งใหม่ได้"
            : "ผู้เขียนจะเห็นเหตุผลนี้ และแก้ไขแล้วส่งใหม่ได้"
        }
        confirmLabel={dialog === "HIDE" ? "ซ่อนเรื่อง" : "ปฏิเสธ"}
        onConfirm={(reason) => moderate.mutateAsync({ id: story.id, action: dialog ?? "REJECT", reason })}
      />
    </>
  );
}
