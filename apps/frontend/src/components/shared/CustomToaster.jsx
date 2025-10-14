// src/components/shared/CustomToaster.jsx
import { ToastBar, Toaster, toast } from "react-hot-toast";
import { X } from "lucide-react"; // or any icon library (close icon)
import { useEffect, useState } from "react";

// use toast.dismiss(id) to dismiss a specific toast
// use toast.remove(id) to remove a specific toast without animation
// use toast.dismiss() to dismiss all toasts
// use toast.remove() to remove all toasts without animation

function ToastContent({ t, message, type, duration }) {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!t.visible) return;
        const start = Date.now();

        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            setProgress(Math.max(100 - (elapsed / duration) * 100, 0));
        }, 50);

        return () => clearInterval(interval);
    }, [t.visible, duration]);

    const progressColor = type === "error" ? "bg-red-500" : type === "success" ? "bg-green-500" : "bg-blue-500";

    return (
        <div className="flex flex-col w-full">
            <div className="flex items-center gap-2 w-full">
                {/* Icon */}
                {t.icon}
                {/* Message */}
                <div className="flex-1">{message}</div>
                {/* Close button */}
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="ml-2 text-gray-500 hover:text-gray-300"
                >
                    <X size={20} />
                </button>
            </div>
            {/* Progress bar */}
            <div className="h-1 mt-2 bg-gray-300 rounded overflow-hidden">
                <div
                    className={`h-1 ${progressColor} transition-all duration-50`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

export default function CustomToaster() {
    const defaultDuration = 5000; // 5 seconds

    return (
        <Toaster
            position="top-right"
            reverseOrder={true}
            toasterId="default"
            gutter={15}
            containerClassName="flex justify-center items-center"
            toastOptions={{
                duration: defaultDuration,
                className: "rounded-lg shadow-md w-80 p-3 flex items-center",
                style: {
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                    border: "1px solid var(--border)",
                },
                success: {
                    iconTheme: {
                        primary: 'var(--success-color)',
                        secondary: 'var(--light-color)',
                    },
                },
                error: {
                    iconTheme: {
                        primary: 'var(--danger-color)',
                        secondary: 'var(--light-color)',
                    },
                },
                custom: {
                    iconTheme: {
                        primary: 'var(--info-color)',
                        secondary: 'var(--light-color)',
                    },
                    style: {
                        background: 'var(--info-color, #E0F2FE)', // fallback color
                        color: 'var(--text-color, #0369A1)',
                        border: '1px solid var(--border, #7DD3FC)',
                    }
                },
                loading: {
                    duration: 3000,
                    iconTheme: {
                        primary: 'var(--info-color)',
                        secondary: 'var(--light-color)',
                    }
                },
            }}
        >
            {(t) => (
                <ToastBar toast={t}>
                    {({ icon, message }) => (
                        <ToastContent
                            t={{ ...t, icon }}
                            message={message}
                            type={t.type}
                            duration={defaultDuration}
                        />
                    )}
                </ToastBar>
            )}
        </Toaster>
    );
}

