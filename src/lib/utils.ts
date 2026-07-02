import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatPercentage(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function getTrustColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

export function getTrustBgColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

export function getTrustLabel(score: number): string {
  if (score >= 80) return "Trusted";
  if (score >= 60) return "Moderate";
  if (score >= 40) return "Low";
  return "Untrusted";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active": return "bg-emerald-500";
    case "inactive": return "bg-gray-500";
    case "suspended": return "bg-red-500";
    case "pending": return "bg-yellow-500";
    case "verified": return "bg-emerald-500";
    case "expired": return "bg-red-500";
    case "revoked": return "bg-gray-500";
    default: return "bg-gray-500";
  }
}

export function getDecisionColor(result: string): string {
  switch (result) {
    case "ALLOW": return "text-emerald-500";
    case "DENY": return "text-red-500";
    case "REQUIRE_HUMAN_APPROVAL": return "text-yellow-500";
    default: return "text-gray-500";
  }
}

export function getRiskColor(level: string): string {
  switch (level) {
    case "low": return "text-emerald-500";
    case "medium": return "text-yellow-500";
    case "high": return "text-orange-500";
    case "critical": return "text-red-500";
    default: return "text-gray-500";
  }
}

export function generateId(): string {
  return crypto.randomUUID();
}
