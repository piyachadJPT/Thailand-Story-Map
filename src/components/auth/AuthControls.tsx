"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { BookOpen, LogOut, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function loginHref(pathname: string) {
  const callbackUrl = pathname.startsWith("/") ? pathname : "/";
  return `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export function UserAvatar({
  name,
  image,
  className,
}: {
  name?: string | null;
  image?: string | null;
  className?: string;
}) {
  const initial = (name?.trim() || "?").slice(0, 1).toUpperCase();
  if (image) {
    return (
      // Google profile photos are third-party URLs; a plain img avoids image optimizer config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        referrerPolicy="no-referrer"
        className={cn(
          "ring-foreground/10 h-8 w-8 rounded-full object-cover ring-1",
          className
        )}
      />
    );
  }
  return (
    <span
      className={cn(
        "bg-primary/15 text-primary ring-primary/15 inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-1",
        className
      )}
    >
      {initial}
    </span>
  );
}

export default function AuthControls({
  variant,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const href = loginHref(pathname === "/login" ? "/" : pathname);

  if (status === "loading") {
    return (
      <span
        className={cn(
          "bg-foreground/10 animate-pulse rounded-full",
          variant === "desktop" ? "h-8 w-24" : "mt-1 h-10 w-full"
        )}
        aria-hidden
      />
    );
  }

  if (!session?.user) {
    if (variant === "mobile") {
      return (
        <Link
          href={href}
          className="bg-foreground text-background mt-1 flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-semibold"
        >
          เข้าสู่ระบบ
        </Link>
      );
    }
    return (
      <Link
        href={href}
        className="bg-foreground text-background hover:bg-foreground/90 hidden items-center rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.98] md:inline-flex"
      >
        เข้าสู่ระบบ
      </Link>
    );
  }

  const { name, email, image } = session.user;

  if (variant === "mobile") {
    return (
      <div>
        <Link
          href="/my-stories"
          onClick={onNavigate}
          className="text-foreground hover:bg-foreground/5 flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          เรื่องราวของฉัน
        </Link>
        <div className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2">
          <UserAvatar name={name} image={image} />
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-semibold">
              {name || "ผู้ใช้"}
            </p>
            <p className="text-muted-foreground truncate text-xs">{email}</p>
          </div>
          <button
            type="button"
            className="icon-well inline-flex h-8 w-8"
            aria-label="ออกจากระบบ"
            onClick={() => void signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hover:ring-primary/10 focus-visible:ring-primary data-popup-open:ring-primary/15 hidden h-9 w-9 items-center justify-center rounded-full transition-shadow outline-none hover:ring-4 focus-visible:ring-2 data-popup-open:ring-4 md:inline-flex"
        aria-label="บัญชีผู้ใช้"
      >
        <UserAvatar name={name} image={image} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="bg-popover ring-border w-72 max-w-[calc(100vw-2rem)] rounded-[1.5rem] p-2 ring-1"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="bg-primary/5 rounded-2xl p-4 font-normal">
            <span className="text-muted-foreground mb-3 block text-[0.7rem] font-medium">
              บัญชีของคุณ
            </span>
            <span className="flex items-center gap-3">
              <UserAvatar
                name={name}
                image={image}
                className="h-12 w-12 shrink-0 text-lg"
              />
              <span className="min-w-0">
                <span className="text-foreground block text-sm leading-relaxed font-semibold break-words">
                  {name || "ผู้ใช้"}
                </span>
                {email && (
                  <span className="text-muted-foreground mt-1 flex items-start gap-1.5 text-xs leading-relaxed">
                    <Mail
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 break-all">{email}</span>
                  </span>
                )}
              </span>
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mx-2 my-2" />
        <DropdownMenuItem
          render={<Link href="/my-stories" />}
          className="hover:bg-primary/5 min-h-11 cursor-pointer gap-3 rounded-xl px-3 py-2.5"
        >
          <span className="bg-primary/10 inline-flex h-8 w-8 items-center justify-center rounded-lg">
            <BookOpen aria-hidden="true" />
          </span>
          <span className="font-medium">เรื่องราวของฉัน</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          className="hover:bg-destructive/10 data-highlighted:bg-destructive/10 min-h-11 cursor-pointer gap-3 rounded-xl px-3 py-2.5 transition-colors"
          onClick={() => void signOut({ callbackUrl: "/" })}
        >
          <span className="bg-destructive/10 inline-flex h-8 w-8 items-center justify-center rounded-lg">
            <LogOut aria-hidden="true" />
          </span>
          <span className="font-medium">ออกจากระบบ</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
