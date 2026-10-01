import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, isGoogleAuthConfigured } from "@/auth";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import MainLayout from "@/components/layout/MainLayout";
import { siteConfig } from "@/config/site";

const errorMessages: Record<string, string> = {
  Configuration: "ยังตั้งค่า Google OAuth ไม่ครบ ตรวจ AUTH_GOOGLE_ID และ AUTH_GOOGLE_SECRET",
  AccessDenied: "เข้าสู่ระบบไม่ได้ บัญชีถูกระงับ หรืออีเมล Google ยังไม่ยืนยัน",
  OAuthAccountNotLinked: "อีเมลนี้ผูกกับวิธีเข้าสู่ระบบอื่นแล้ว",
  Verification: "ลิงก์ยืนยันหมดอายุหรือถูกใช้ไปแล้ว",
};

function safeCallbackUrl(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);
  const session = await auth();

  if (session?.user && session.user.status !== "BANNED" && !params.error) {
    redirect(callbackUrl);
  }

  const errorMessage = params.error
    ? params.error === "Configuration" && isGoogleAuthConfigured
      ? "เข้าสู่ระบบกับ Google แล้ว แต่ยังบันทึกบัญชีลงฐานข้อมูลไม่ได้"
      : (errorMessages[params.error] ?? "เข้าสู่ระบบไม่สำเร็จ ลองอีกครั้ง")
    : null;

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const googleCallback = `${proto}://${host}/api/auth/callback/google`;

  return (
    <MainLayout>
      <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
        <div className="liquid-glass w-full rounded-[1.85rem] p-8 sm:p-9">
          <div className="mb-7 flex flex-col items-center text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl bg-background/80 ring-1 ring-foreground/8">
              <Image
                src="/logo.png"
                alt=""
                width={56}
                height={56}
                priority
                className="h-12 w-12 object-contain"
              />
            </span>
            <p className="mb-2 text-[0.68rem] font-semibold tracking-[0.22em] text-primary uppercase">
              {siteConfig.name}
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
              เข้าสู่ระบบ
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              ใช้บัญชี Google เพื่อเล่าเรื่องบนแผนที่
            </p>
          </div>

          {errorMessage ? (
            <p className="mb-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm leading-relaxed text-destructive">
              {errorMessage}
            </p>
          ) : null}

          {isGoogleAuthConfigured ? (
            <GoogleSignInButton callbackUrl={callbackUrl} className="w-full" />
          ) : (
            <p className="rounded-2xl bg-foreground/5 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              ยังไม่ได้ใส่ Google Client ID ในไฟล์ <code className="font-mono">.env</code>{" "}
              ตั้ง <code className="font-mono">AUTH_GOOGLE_ID</code> และ{" "}
              <code className="font-mono">AUTH_GOOGLE_SECRET</code> แล้วรีสตาร์ทเซิร์ฟเวอร์
              Redirect URI คือ <code className="font-mono">{googleCallback}</code>
            </p>
          )}

          <p className="mt-7 text-center text-sm text-muted-foreground">
            <Link
              href="/"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              กลับหน้าแรก
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
