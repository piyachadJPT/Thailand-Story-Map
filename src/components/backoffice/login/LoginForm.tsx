"use client";

import { useEffect, useId, useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BACKOFFICE_PATH } from "@/config/backoffice";
import { AdminApiError, adminFetch, errorMessage } from "../api";

const fieldClass = "h-11 rounded-xl px-3.5 text-base sm:text-sm";

export default function LoginForm() {
  const id = useId();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!lockedUntil) return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= lockedUntil) setLockedUntil(null);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lockedUntil]);

  const secondsLeft = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;
  const locked = secondsLeft > 0;

  function trackCapsLock(event: React.KeyboardEvent) {
    setCapsLock(event.getModifierState?.("CapsLock") ?? false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await adminFetch("/api/admin/login", { method: "POST", body: { username, password } });
      window.location.assign(BACKOFFICE_PATH);
    } catch (cause) {
      if (cause instanceof AdminApiError && cause.status === 429 && cause.retryAfter) {
        const until = Date.now() + cause.retryAfter * 1000;
        setNow(Date.now());
        setLockedUntil(until);
        setError(null);
      } else {
        setError(errorMessage(cause));
      }
      setPassword("");
      setPending(false);
    }
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <form onSubmit={submit} noValidate className="mt-6 grid gap-4">
      <div className="grid gap-1.5">
        <label htmlFor={`${id}-username`} className="text-sm font-medium">
          ชื่อผู้ใช้
        </label>
        <Input
          id={`${id}-username`}
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          onKeyUp={trackCapsLock}
          className={fieldClass}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor={`${id}-password`} className="text-sm font-medium">
          รหัสผ่าน
        </label>
        <div className="relative">
          <Input
            id={`${id}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyUp={trackCapsLock}
            onKeyDown={trackCapsLock}
            aria-describedby={capsLock ? `${id}-caps` : undefined}
            className={`${fieldClass} pr-11`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
          </button>
        </div>
        {capsLock ? (
          <p id={`${id}-caps`} className="flex items-center gap-1.5 text-xs text-warning">
            <TriangleAlert aria-hidden="true" className="size-3.5" />
            Caps Lock เปิดอยู่
          </p>
        ) : null}
      </div>

      <Button type="submit" size="md" className="mt-2 w-full rounded-xl" disabled={pending || locked}>
        {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : <LockKeyhole aria-hidden="true" />}
        {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </Button>

      <div aria-live="polite">
        {locked ? (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/8 p-3 text-sm text-destructive">
            พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ในอีก{" "}
            <span className="font-semibold tabular-nums">
              {minutes}:{seconds}
            </span>{" "}
            นาที
          </p>
        ) : error ? (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/8 p-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
