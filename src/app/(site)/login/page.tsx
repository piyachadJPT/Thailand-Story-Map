import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, isGoogleAuthConfigured } from "@/auth";
import PageContainer from "@/components/layout/PageContainer";
import LoginCard from "@/components/login/LoginCard";
import { loginErrorMessage, safeCallbackUrl } from "@/components/login/loginError";
import LoginShowcase from "@/components/login/LoginShowcase";
import { privatePageRobots } from "@/lib/seo/metadata";

export const metadata = { title: "เข้าสู่ระบบ", robots: privatePageRobots };

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

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";

  return (
    <PageContainer width="wide" className="grid flex-1 gap-4 lg:grid-cols-[1.15fr_1fr] lg:gap-6">
      <LoginShowcase />
      <LoginCard
        callbackUrl={callbackUrl}
        errorMessage={loginErrorMessage(params.error, isGoogleAuthConfigured)}
        googleConfigured={isGoogleAuthConfigured}
        googleCallback={`${proto}://${host}/api/auth/callback/google`}
      />
    </PageContainer>
  );
}
