"use client";

import { useState } from "react";
import { Bell, X, Check, AlertTriangle, Info, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: "success" | "warning" | "info" | "error";
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: "1", title: "DeployAgent flagged", description: "DeployAgent attempted production deploy without approval", type: "warning", time: "2 min ago", read: false },
  { id: "2", title: "SecurityMonitor verified", description: "Credential 'SOC 2 Type II' was verified successfully", type: "success", time: "15 min ago", read: false },
  { id: "3", title: "PaymentProcessor denied", description: "High-risk transfer action denied by trust engine", type: "error", time: "1 hour ago", read: false },
  { id: "4", title: "Reputation update", description: "CodeReviewBot trust score increased to 87", type: "info", time: "3 hours ago", read: true },
  { id: "5", title: "Policy violation", description: "DataPipeline violated data retention policy", type: "warning", time: "5 hours ago", read: true },
];

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <Check className="h-4 w-4 text-emerald-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error": return <Shield className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative text-muted-foreground" onClick={() => setOpen(!open)}>
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {unread}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <h4 className="text-sm font-semibold">Notifications</h4>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={cn("flex gap-3 border-b px-4 py-3 last:border-0", !n.read && "bg-muted/30")}>
                    <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                    </div>
                    <button onClick={() => dismiss(n.id)} className="shrink-0 text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
