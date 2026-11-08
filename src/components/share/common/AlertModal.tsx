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
                    iconBg: "bg-[#e5fff2] dark:bg-[#00d26a]/15",
                    iconText: "text-[#00a854] dark:text-[#00d26a]",
                    buttonText: "text-[#0a0f1c]",
                    buttonBg: "bg-[#00d26a] hover:bg-[#00b85c]",
                };
            case "error":
                return {
                    iconBg: "bg-[#ffe2e0] dark:bg-[#ff3b30]/15",
                    iconText: "text-[#ff3b30]",
                    buttonText: "text-white",
                    buttonBg: "bg-[#ff3b30] hover:bg-[#e0342a]",
                };
            case "warning":
                return {
                    iconBg: "bg-[#ffe8d6] dark:bg-[#ff6b00]/15",
                    iconText: "text-[#e55f00] dark:text-[#ff6b00]",
                    buttonText: "text-white",
                    buttonBg: "bg-[#ff6b00] hover:bg-[#e55f00]",
                };
            case "info":
            default:
                return {
                    iconBg: "bg-primary/10",
                    iconText: "text-primary",
                    buttonText: "text-primary-foreground",
                    buttonBg: "bg-primary hover:bg-primary/90",
                };
        }
    };

    const colors = getColors();

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card text-card-foreground rounded-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200 border border-border">
                <div className="p-6 text-center">
                    <div
                        className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${colors.iconBg} ${colors.iconText}`}
                    >
                        {getIcon()}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                        {title}
                    </h3>
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                        {message}
                    </p>
                </div>
                <div className="flex border-t border-border p-4">
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