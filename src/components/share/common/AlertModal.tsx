import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    confirmText?: string;
    type?: "success" | "error" | "warning" | "info";
}

export default function AlertModal({
    isOpen,
    onClose,
    title,
    message,
    confirmText = "ตกลง",
    type = "info",
}: AlertModalProps) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-6 h-6" />;
            case "error":
                return <XCircle className="w-6 h-6" />;
            case "warning":
                return <AlertTriangle className="w-6 h-6" />;
            case "info":
            default:
                return <Info className="w-6 h-6" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case "success":
                return {
                    iconBg: "bg-green-100 dark:bg-green-900/30",
                    iconText: "text-green-600 dark:text-green-400",
                    buttonText: "text-white",
                    buttonBg: "bg-green-600 hover:bg-green-700",
                };
            case "error":
                return {
                    iconBg: "bg-red-100 dark:bg-red-900/30",
                    iconText: "text-red-600 dark:text-red-400",
                    buttonText: "text-white",
                    buttonBg: "bg-red-600 hover:bg-red-700",
                };
            case "warning":
                return {
                    iconBg: "bg-orange-100 dark:bg-orange-900/30",
                    iconText: "text-orange-600 dark:text-orange-400",
                    buttonText: "text-white",
                    buttonBg: "bg-orange-600 hover:bg-orange-700",
                };
            case "info":
            default:
                return {
                    iconBg: "bg-blue-100 dark:bg-blue-900/30",
                    iconText: "text-blue-600 dark:text-blue-400",
                    buttonText: "text-white",
                    buttonBg: "bg-blue-600 hover:bg-blue-700",
                };
        }
    };

    const colors = getColors();

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-neutral-700">
                <div className="p-6 text-center">
                    <div
                        className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${colors.iconBg} ${colors.iconText}`}
                    >
                        {getIcon()}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm whitespace-pre-wrap">
                        {message}
                    </p>
                </div>
                <div className="flex border-t border-gray-100 dark:border-neutral-700 p-4">
                    <button
                        onClick={onClose}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition ${colors.buttonBg} ${colors.buttonText}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}