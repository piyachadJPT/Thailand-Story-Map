"use client";

import { useState } from "react";
import { Check, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportDialog from "./ReportDialog";

/** "รายงานเรื่องนี้" at the end of a story; becomes "รายงานแล้ว" once sent. */
export default function ReportStoryButton({ storyId, title }: { storyId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [reported, setReported] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <p className="text-sm text-muted-foreground">พบข้อมูลผิด หรือเนื้อหาไม่เหมาะสม?</p>
      <Button
        variant="outline"
        size="sm"
        disabled={reported}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        {reported ? <Check aria-hidden="true" className="text-success" /> : <Flag aria-hidden="true" />}
        {reported ? "รายงานแล้ว" : "รายงานเรื่องนี้"}
      </Button>
      <ReportDialog
        open={open}
        onOpenChange={setOpen}
        storyId={storyId}
        title={title}
        onReported={() => setReported(true)}
      />
    </div>
  );
}
