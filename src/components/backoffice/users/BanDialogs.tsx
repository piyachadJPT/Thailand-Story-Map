"use client";

import { useState } from "react";
import ReasonDialog, { BAN_REASON_PRESETS } from "../ReasonDialog";
import { useModerateUser } from "../moderation";

type Target = { id: string; name: string; email: string; publishedStories: number };

export function BanDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Target;
}) {
  const moderate = useModerateUser();
  const [hideStories, setHideStories] = useState(false);
  return (
    <ReasonDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setHideStories(false);
      }}
      title="ระงับผู้ใช้นี้?"
      target={
        <span className="block">
          {user.name}
          <span className="block text-xs font-normal text-muted-foreground">{user.email}</span>
        </span>
      }
      description="ผู้ใช้จะออกจากระบบทันที และเขียน แก้ หรือรายงานเรื่องไม่ได้จนกว่าจะยกเลิกการระงับ"
      presets={BAN_REASON_PRESETS}
      confirmLabel="ระงับผู้ใช้"
      extra={
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 text-sm has-checked:border-destructive/40 has-checked:bg-destructive/5">
          <input
            type="checkbox"
            checked={hideStories}
            onChange={(event) => setHideStories(event.target.checked)}
            disabled={user.publishedStories === 0}
            className="mt-1 size-4 accent-(--destructive)"
          />
          <span>
            ซ่อนเรื่องที่เผยแพร่ทั้งหมดของผู้ใช้นี้ด้วย ({user.publishedStories.toLocaleString("th-TH")} เรื่อง)
            <span className="block text-xs text-muted-foreground">ถ้าไม่เลือก เรื่องที่เผยแพร่อยู่จะยังแสดงตามปกติ</span>
          </span>
        </label>
      }
      onConfirm={(reason) => moderate.mutateAsync({ id: user.id, action: "BAN", reason, hideStories })}
    />
  );
}

export function UnbanDialog({
  open,
  onOpenChange,
  user,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Pick<Target, "id" | "name" | "email">;
  onDone?: () => void;
}) {
  const moderate = useModerateUser();
  return (
    <ReasonDialog
      open={open}
      onOpenChange={onOpenChange}
      title="ยกเลิกการระงับ?"
      target={user.name}
      description="ผู้ใช้จะกลับมาเข้าสู่ระบบได้ เรื่องที่ถูกซ่อนไปจะไม่ถูกกู้คืนอัตโนมัติ"
      optional
      presets={[]}
      reasonLabel="หมายเหตุ"
      tone="primary"
      confirmLabel="ยกเลิกการระงับ"
      onConfirm={async (reason) => {
        await moderate.mutateAsync({ id: user.id, action: "UNBAN", reason: reason || undefined });
        onDone?.();
      }}
    />
  );
}
