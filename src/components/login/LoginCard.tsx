import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { Alert } from "@/components/ui/alert";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GoldDivider } from "@/components/ui/gold-divider";
import { siteConfig } from "@/config/site";

type LoginCardProps = {
  callbackUrl: string;
  errorMessage: string | null;
  googleConfigured: boolean;
  /** Shown in the setup hint when Google OAuth is not configured. */
  googleCallback: string;
};

/** Sign-in card: logo, heading, error alert, Google button (or setup hint). */
export default function LoginCard({ callbackUrl, errorMessage, googleConfigured, googleCallback }: LoginCardProps) {
  return (
    <GlassPanel as="section" surface="solid" gilded padding="lg" className="flex flex-col justify-center sm:p-10">
      <div className="flex flex-col items-center text-center">
        <span className="mb-5 grid size-16 place-items-center overflow-hidden rounded-full bg-background ring-1 ring-gold/50">
          <Image src="/logo.png" alt="" width={56} height={56} priority className="size-12 object-contain" />
        </span>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-chad">
          <span aria-hidden="true" className="lai-prajamyam w-7" />
          {siteConfig.nameTh}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-foreground">เข้าสู่ระบบ</h1>
        <p className="mt-2 text-sm text-muted-foreground">ใช้บัญชี Google เพื่อเล่าเรื่องบนแผนที่</p>
      </div>

      <GoldDivider pattern="lai" strength="subtle" className="my-7" />

      <div className="space-y-4">
        {errorMessage ? <Alert variant="destructive">{errorMessage}</Alert> : null}
        {googleConfigured ? (
          <GoogleSignInButton callbackUrl={callbackUrl} className="h-12 w-full" />
        ) : (
          <Alert variant="info">
            ยังไม่ได้ใส่ Google Client ID ในไฟล์ <code className="font-mono">.env</code> ตั้ง{" "}
            <code className="font-mono">AUTH_GOOGLE_ID</code> และ{" "}
            <code className="font-mono">AUTH_GOOGLE_SECRET</code> แล้วรีสตาร์ทเซิร์ฟเวอร์ Redirect URI คือ{" "}
            <code className="font-mono break-all">{googleCallback}</code>
          </Alert>
        )}
      </div>

      <Link
        href="/"
        className="mx-auto mt-8 inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        กลับหน้าแรก
      </Link>
    </GlassPanel>
  );
}
