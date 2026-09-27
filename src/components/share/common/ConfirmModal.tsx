import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "info" | "warning";
    isLoading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "ยืนยัน",
    cancelText = "ยกเลิก",
    type = "danger",
    isLoading = false,
}: ConfirmModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent scrolling when modal is open
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card text-card-foreground rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 fade-in slide-in-from-bottom-2 duration-200 ring-1 ring-foreground/10">
                <div className="p-8 text-center">
                    <div
                        className={`mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center p-3 ${type === "danger"
                            ? "bg-[#ffe2e0] text-[#ff3b30] dark:bg-[#ff3b30]/15 dark:text-[#ff3b30]"
                            : type === "warning"
                                ? "bg-[#ffe8d6] text-[#e55f00] dark:bg-[#ff6b00]/15 dark:text-[#ff6b00]"
                                : "bg-primary/10 text-primary"
                            }`}
                    >
                        <div
                            className={`w-full h-full rounded-full flex items-center justify-center ${type === "danger"
                                ? "bg-[#ffd0cc] dark:bg-[#ff3b30]/25"
                                : type === "warning"
                                    ? "bg-[#ffd7b8] dark:bg-[#ff6b00]/25"
                                    : "bg-primary/15"
                                }`}
                        >
                            <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-foreground">
                        {title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {message}
                    </p>
                </div>
                <div className="p-8 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground bg-muted rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 ${type === "danger"
                            ? "bg-[#ff3b30] text-white shadow-[#ff3b30]/20"
                            : type === "warning"
                                ? "bg-[#ff6b00] text-white shadow-[#ff6b00]/20"
                                : "bg-primary text-primary-foreground shadow-primary/20"
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                รอซักครู่...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}