"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
            <p className="text-muted-foreground text-sm max-w-[500px]">
                An unexpected error occurred. We have been notified and are looking into it.
            </p>
            <div className="mt-4 flex gap-4">
                <button
                    onClick={() => reset()}
                    className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                >
                    Try again
                </button>
                <a
                    href="/"
                    className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-100"
                >
                    Go Home
                </a>
            </div>
        </div>
    );
}
