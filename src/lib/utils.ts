import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PIPELINE_STAGES = [
  { key: "new_lead", label: "New Lead", color: "bg-blue-500" },
  { key: "contacted", label: "Contacted", color: "bg-yellow-500" },
  { key: "requirement_collected", label: "Requirement Collected", color: "bg-orange-500" },
  { key: "property_suggested", label: "Property Suggested", color: "bg-purple-500" },
  { key: "visit_scheduled", label: "Visit Scheduled", color: "bg-indigo-500" },
  { key: "visit_completed", label: "Visit Completed", color: "bg-teal-500" },
  { key: "booked", label: "Booked", color: "bg-green-500" },
  { key: "lost", label: "Lost", color: "bg-red-500" },
] as const;

export const LEAD_SOURCES = [
  { key: "whatsapp", label: "WhatsApp", icon: "MessageCircle" },
  { key: "website", label: "Website", icon: "Globe" },
  { key: "instagram", label: "Instagram", icon: "Instagram" },
  { key: "facebook", label: "Facebook", icon: "Facebook" },
  { key: "phone_call", label: "Phone Call", icon: "Phone" },
  { key: "landing_page", label: "Landing Page", icon: "FileText" },
] as const;

export function getStageLabel(key: string): string {
  return PIPELINE_STAGES.find((s) => s.key === key)?.label ?? key;
}

export function getStageColor(key: string): string {
  return PIPELINE_STAGES.find((s) => s.key === key)?.color ?? "bg-gray-500";
}

export function getSourceLabel(key: string): string {
  return LEAD_SOURCES.find((s) => s.key === key)?.label ?? key;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}

export function formatPhone(phone: string): string {
  return phone.replace(/(\d{2})(\d{5})(\d{5})/, "+$1 $2 $3");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function minutesAgo(date: Date): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 60000);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
