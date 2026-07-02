"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Command, FileText, Bot, Key, Award, BarChart3, Scale, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const commands = [
  { label: "Go to Dashboard", href: "/", icon: Shield },
  { label: "Go to Agents", href: "/agents", icon: Bot },
  { label: "Go to Permissions", href: "/permissions", icon: Key },
  { label: "Go to Reputation", href: "/reputation", icon: Award },
  { label: "Go to Credentials", href: "/credentials", icon: FileText },
  { label: "Go to Trust Engine", href: "/trust-decision", icon: Scale },
  { label: "Go to Audit Center", href: "/audit", icon: FileText },
  { label: "Go to Analytics", href: "/analytics", icon: BarChart3 },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = query
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback((href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  }, [router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[15%] max-w-lg overflow-hidden p-0">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {filtered.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.href}
                onClick={() => handleSelect(cmd.href)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{cmd.label}</span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted-foreground text-center">No results found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
