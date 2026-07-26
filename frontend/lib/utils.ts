import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getRiskColor(category: string): string {
  switch (category) {
    case "SAFE": return "#10b981";
    case "MODERATE": return "#f59e0b";
    case "HIGH": return "#ef4444";
    case "CRITICAL": return "#dc2626";
    default: return "#06b6d4";
  }
}

export function getRiskBgClass(category: string): string {
  switch (category) {
    case "SAFE": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "MODERATE": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "HIGH": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "CRITICAL": return "bg-red-600/10 text-red-500 border-red-600/20";
    default: return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "low": return "#10b981";
    case "medium": return "#f59e0b";
    case "high": return "#ef4444";
    case "critical": return "#dc2626";
    default: return "#06b6d4";
  }
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}
