"use client";

import { useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Eye, EyeOff, KeyRound, Laptop, Loader2, LogOut } from "lucide-react";
import type { listAdminSessions } from "@/api/admin/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Jsonify } from "@/models/types/admin";
import { cn } from "@/lib/utils";
import { useAdmin } from "../AdminShell";
import PageHeader, { Panel } from "../PageHeader";
import RelativeTime from "../RelativeTime";
import { ErrorCard } from "../States";
import { adminFetch, adminKeys, errorMessage } from "../api";
import { describeUserAgent, formatDateTime } from "../format";

type Sessions = Jsonify<Awaited<ReturnType<typeof listAdminSessions>>>;

export default function AccountView() {
  const admin = useAdmin();
  return (
    <div className="space-y-6">
      <PageHeader title="บัญชีของฉัน" description={`จัดการรหัสผ่านและอุปกรณ์ที่เข้าสู่ระบบของ ${admin.username ?? admin.name}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <PasswordForm username={admin.username ?? ""} />
        <SessionList />
      </div>
    </div>
  );
}

/** 0–4, from length and character variety. */
export function passwordStrength(password: string, username: string) {
  if (!password) return 0;
  if (password.length < 12 || password.toLowerCase() === username.toLowerCase()) return 1;
  let score = 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 0.5;
  if (/\d/.test(password)) score += 0.5;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(4, Math.floor(score));
}

const strengthLabels = ["", "อ่อน", "พอใช้", "ดี", "แข็งแรง"];
const strengthColors = ["", "bg-destructive", "bg-warning", "bg-gold", "bg-success"];

function PasswordForm({ username }: { username: string }) {
  const id = useId();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const change = useMutation({
    mutationFn: () =>
      adminFetch("/api/admin/password", { method: "POST", body: { currentPassword: current, newPassword: next } }),
    onSuccess: () => {
      toast.success("เปลี่ยนรหัสผ่านแล้ว อุปกรณ์อื่นถูกออกจากระบบ");
      setCurrent("");
      setNext("");
      setConfirm("");
      void queryClient.invalidateQueries({ queryKey: adminKeys.sessions });
    },
    onError: (cause) => setError(errorMessage(cause)),
  });
  const strength = passwordStrength(next, username);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (next.length < 12) return setError("รหัสผ่านใหม่ต้องยาวอย่างน้อย 12 ตัวอักษร");
    if (next.toLowerCase() === username.toLowerCase()) return setError("รหัสผ่านต้องไม่ตรงกับชื่อผู้ใช้");
    if (next !== confirm) return setError("รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน");
    change.mutate();
  }

  const field = "h-11 rounded-xl px-3.5 text-base sm:text-sm";
  return (
    <Panel title="เปลี่ยนรหัสผ่าน" description="เมื่อเปลี่ยนแล้ว อุปกรณ์อื่นทั้งหมดจะออกจากระบบ">
      <form onSubmit={submit} noValidate className="grid gap-4">
        <input type="text" name="username" autoComplete="username" value={username} readOnly hidden />
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-current`} className="text-sm font-medium">รหัสผ่านเดิม</label>
          <Input id={`${id}-current`} type={show ? "text" : "password"} autoComplete="current-password" value={current} onChange={(event) => setCurrent(event.target.value)} className={field} />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-next`} className="text-sm font-medium">รหัสผ่านใหม่</label>
          <Input
            id={`${id}-next`}
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={next}
            onChange={(event) => setNext(event.target.value)}
            aria-describedby={`${id}-strength`}
            className={field}
          />
          <div id={`${id}-strength`} className="space-y-1.5" aria-live="polite">
            <div className="grid grid-cols-4 gap-1" aria-hidden="true">
              {[1, 2, 3, 4].map((level) => (
                <span
                  key={level}
                  className={cn("h-1.5 rounded-full bg-foreground/8 transition-colors duration-200", strength >= level && strengthColors[strength])}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {next ? <>ความแข็งแรง: <span className="font-medium text-foreground">{strengthLabels[strength]}</span> · </> : null}
              อย่างน้อย 12 ตัว ผสมตัวพิมพ์ใหญ่ เล็ก ตัวเลข และสัญลักษณ์
            </p>
          </div>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-confirm`} className="text-sm font-medium">ยืนยันรหัสผ่านใหม่</label>
          <Input id={`${id}-confirm`} type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className={field} />
        </div>
        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={show} onChange={(event) => setShow(event.target.checked)} className="size-4 accent-(--gold)" />
          {show ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
          แสดงรหัสผ่าน
        </label>
        {error ? (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/8 p-3 text-sm text-destructive">{error}</p>
        ) : null}
        <Button type="submit" className="w-fit rounded-xl" disabled={change.isPending}>
          {change.isPending ? <Loader2 aria-hidden="true" className="animate-spin" /> : <KeyRound aria-hidden="true" />}
          เปลี่ยนรหัสผ่าน
        </Button>
      </form>
    </Panel>
  );
}

function SessionList() {
  const queryClient = useQueryClient();
  const sessions = useQuery({
    queryKey: adminKeys.sessions,
    queryFn: ({ signal }) => adminFetch<Sessions>("/api/admin/sessions", { signal }),
  });
  const logoutOthers = useMutation({
    mutationFn: () => adminFetch<{ removed: number }>("/api/admin/logout-all", { method: "POST", body: {} }),
    onSuccess: (data) => {
      toast.success(`ออกจากระบบ ${data.removed} อุปกรณ์แล้ว`);
      void queryClient.invalidateQueries({ queryKey: adminKeys.sessions });
    },
    onError: (cause) => toast.error(errorMessage(cause)),
  });
  const others = sessions.data?.filter((session) => !session.current).length ?? 0;

  return (
    <Panel
      title="อุปกรณ์ที่เข้าสู่ระบบ"
      description="session หมดอายุใน 8 ชั่วโมง หรือเมื่อไม่ได้ใช้งาน 2 ชั่วโมง"
      action={
        <Button
          variant="outline"
          size="sm"
          disabled={!others || logoutOthers.isPending}
          onClick={() => logoutOthers.mutate()}
        >
          {logoutOthers.isPending ? <Loader2 aria-hidden="true" className="animate-spin" /> : <LogOut aria-hidden="true" />}
          ออกจากระบบทุกอุปกรณ์อื่น
        </Button>
      }
    >
      {sessions.isError ? (
        <ErrorCard error={sessions.error} onRetry={() => void sessions.refetch()} />
      ) : sessions.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {sessions.data.map((session) => (
            <li key={session.id} className="flex items-start gap-3 py-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground/5 text-muted-foreground">
                <Laptop aria-hidden="true" className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {describeUserAgent(session.userAgent)}
                  {session.current ? (
                    <span className="rounded-full bg-success/12 px-2 py-0.5 text-[0.7rem] font-medium text-success">อุปกรณ์นี้</span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  IP {session.ip ?? "—"} · เข้าสู่ระบบ {formatDateTime(session.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  ใช้ล่าสุด <RelativeTime value={session.lastSeenAt} />
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
