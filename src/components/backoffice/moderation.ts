"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { adminFetch, adminKeys } from "./api";

export type StoryAction = "APPROVE" | "REJECT" | "HIDE" | "RESTORE";

const storyToast: Record<StoryAction, string> = {
  APPROVE: "อนุมัติเรื่องแล้ว",
  REJECT: "ปฏิเสธเรื่องแล้ว",
  HIDE: "ซ่อนเรื่องแล้ว",
  RESTORE: "กู้คืนเรื่องแล้ว",
};

/** Waits for the server (no optimistic update: it may answer 409). */
export function useModerateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: StoryAction; reason?: string }) =>
      adminFetch<{ id: string; status: string }>(`/api/admin/stories/${id}`, {
        method: "PATCH",
        body: reason ? { action, reason } : { action },
      }),
    onSuccess: (_data, variables) => {
      toast.success(storyToast[variables.action]);
      void queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: () => void queryClient.invalidateQueries({ queryKey: adminKeys.all }),
  });
}

export function useResolveReports() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storyId, action, note }: { storyId: string; action: "DISMISS" | "HIDE_STORY"; note?: string }) =>
      adminFetch<{ resolved: number; storyHidden: boolean }>(`/api/admin/reports/story/${storyId}`, {
        method: "PATCH",
        body: { action, ...(note ? { note } : {}) },
      }),
    onSuccess: (data, variables) => {
      toast.success(
        variables.action === "DISMISS"
          ? `ปิด ${data.resolved} รายงานว่าไม่มีมูลแล้ว`
          : data.storyHidden
            ? `ซ่อนเรื่องและปิด ${data.resolved} รายงานแล้ว`
            : `ปิด ${data.resolved} รายงานแล้ว (เรื่องไม่ได้เผยแพร่อยู่)`
      );
      void queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useModerateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; action: "BAN" | "UNBAN"; reason?: string; hideStories?: boolean }) =>
      adminFetch<{ status: string; hiddenStories: number }>(`/api/admin/users/${input.id}`, {
        method: "PATCH",
        body:
          input.action === "BAN"
            ? { action: "BAN", reason: input.reason, hideStories: Boolean(input.hideStories) }
            : { action: "UNBAN", ...(input.reason ? { reason: input.reason } : {}) },
      }),
    onSuccess: (data, variables) => {
      toast.success(
        variables.action === "BAN"
          ? data.hiddenStories
            ? `ระงับผู้ใช้และซ่อน ${data.hiddenStories} เรื่องแล้ว`
            : "ระงับผู้ใช้แล้ว"
          : "ยกเลิกการระงับแล้ว"
      );
      void queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
