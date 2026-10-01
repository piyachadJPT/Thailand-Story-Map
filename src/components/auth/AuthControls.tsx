"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
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

function UserAvatar({
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
        className={cn("h-8 w-8 rounded-full object-cover ring-1 ring-foreground/10", className)}
      />
    );
  }
  return (
    <span
        className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/15",
        className,
      )}
    >
      {initial}
    </span>
  );
}

export default function AuthControls({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const href = loginHref(pathname === "/login" ? "/" : pathname);

  if (status === "loading") {
    return (
      <span
        className={cn(
          "animate-pulse rounded-full bg-foreground/10",
          variant === "desktop" ? "h-8 w-24" : "mt-1 h-10 w-full",
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
          className="mt-1 flex w-full items-center justify-center rounded-xl bg-foreground px-3 py-2.5 text-sm font-semibold text-background shadow-sm"
        >
          เข้าสู่ระบบ
        </Link>
      );
    }
    return (
      <Link
        href={href}
        className="hidden items-center rounded-full bg-foreground px-3.5 py-1.5 text-sm font-semibold text-background shadow-sm transition-all hover:scale-[1.03] hover:bg-foreground/90 active:scale-[0.98] md:inline-flex"
      >
        เข้าสู่ระบบ
      </Link>
    );
  }

  const { name, email, image } = session.user;

  if (variant === "mobile") {
    return (
      <div className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2">
        <UserAvatar name={name} image={image} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{name || "ผู้ใช้"}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
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
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hidden h-8 w-8 items-center justify-center rounded-full outline-none md:inline-flex"
        aria-label="บัญชีผู้ใช้"
      >
        <UserAvatar name={name} image={image} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 rounded-2xl p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <span className="block truncate text-sm font-semibold text-foreground">
              {name || "ผู้ใช้"}
            </span>
            <span className="block truncate text-xs text-muted-foreground">{email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void signOut({ callbackUrl: "/" })}>
          <LogOut />
          ออกจากระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
