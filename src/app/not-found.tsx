import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Page Not Found</h2>
            <p className="text-muted-foreground text-sm max-w-[500px]">
                The page you are looking for does not exist or has been moved.
            </p>
            <div className="mt-4">
                <Link
                    href="/"
                    className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
