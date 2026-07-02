"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface ToastContextType {
  addToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-right-full",
            toast.type === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            toast.type === "error" && "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
            toast.type === "warning" && "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
            toast.type === "info" && "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
          )}>
            {toast.type === "success" && <CheckCircle className="h-4 w-4 shrink-0" />}
            {toast.type === "error" && <XCircle className="h-4 w-4 shrink-0" />}
            {toast.type === "warning" && <AlertTriangle className="h-4 w-4 shrink-0" />}
            {toast.type === "info" && <Info className="h-4 w-4 shrink-0" />}
            <p className="text-sm">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Re-export for use in pages
export { toast };
const toast = {
  success: (msg: string) => {},
  error: (msg: string) => {},
  warning: (msg: string) => {},
  info: (msg: string) => {},
};
