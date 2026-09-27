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
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 fade-in slide-in-from-bottom-2 duration-200 ring-1 ring-black/5">
                <div className="p-8 text-center">
                    <div
                        className={`mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center p-3 ${type === "danger"
                            ? "bg-red-50 text-red-500 dark:bg-red-900/10 dark:text-red-400"
                            : type === "warning"
                                ? "bg-orange-50 text-orange-500 dark:bg-orange-900/10 dark:text-orange-400"
                                : "bg-blue-50 text-blue-500 dark:bg-blue-900/10 dark:text-blue-400"
                            }`}
                    >
                        <div
                            className={`w-full h-full rounded-full flex items-center justify-center ${type === "danger"
                                ? "bg-red-100 dark:bg-red-900/30"
                                : type === "warning"
                                    ? "bg-orange-100 dark:bg-orange-900/30"
                                    : "bg-blue-100 dark:bg-blue-900/30"
                                }`}
                        >
                            <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                        {title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>
                <div className="p-8 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-neutral-700 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 ${type === "danger"
                            ? "bg-linear-to-r from-red-600 to-red-500 shadow-red-500/30 hover:shadow-red-500/40"
                            : type === "warning"
                                ? "bg-linear-to-r from-orange-500 to-amber-500 shadow-orange-500/30 hover:shadow-orange-500/40"
                                : "bg-linear-to-r from-blue-600 to-blue-500 shadow-blue-500/30 hover:shadow-blue-500/40"
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