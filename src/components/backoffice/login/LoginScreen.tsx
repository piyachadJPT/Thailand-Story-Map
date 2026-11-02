import Image from "next/image";
import CityMapPattern from "@/components/story/CityMapPattern";
import ThemeToggle from "@/components/share/global/ThemeToggle";
import LoginForm from "./LoginForm";

export default function LoginScreen({ showSetupHint }: { showSetupHint: boolean }) {
  return (
    <div className="relative isolate grid min-h-dvh place-items-center overflow-hidden px-4 py-12">
      <CityMapPattern className="absolute inset-0 -z-10 size-full text-foreground opacity-50" />
      <div aria-hidden="true" className="absolute -top-40 -right-40 -z-10 size-[28rem] rounded-full bg-gold/15 blur-3xl" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-background/40 via-background/70 to-background" />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <main className="w-full max-w-[400px]">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="grid size-14 place-items-center overflow-hidden rounded-full bg-card shadow-soft ring-1 ring-gold/50">
            <Image src="/logo.png" alt="" width={44} height={44} className="size-11 object-contain" priority />
          </span>
          <div>
            <p className="font-heading text-lg font-semibold">Thailand Story Map</p>
            <p className="text-sm text-gold-ink">Backoffice</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lift sm:p-8">
          <h1 className="font-heading text-xl font-semibold">เข้าสู่ระบบผู้ดูแล</h1>
          <p className="mt-1 text-sm text-muted-foreground">ใช้ชื่อผู้ใช้และรหัสผ่านของบัญชีแอดมิน</p>
          {showSetupHint ? (
            <p className="mt-4 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
              ยังไม่มีบัญชีแอดมิน รัน <code className="rounded bg-foreground/8 px-1.5 py-0.5 font-mono text-xs">npm run admin:create</code>
            </p>
          ) : null}
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
