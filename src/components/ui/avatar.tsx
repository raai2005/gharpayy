import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const colorMap: Record<string, string> = {
  A: "bg-blue-500",
  B: "bg-green-500",
  C: "bg-yellow-500",
  D: "bg-purple-500",
  E: "bg-pink-500",
  F: "bg-indigo-500",
  G: "bg-teal-500",
  H: "bg-orange-500",
  I: "bg-cyan-500",
  J: "bg-rose-500",
  K: "bg-emerald-500",
  L: "bg-violet-500",
  M: "bg-amber-500",
  N: "bg-lime-500",
  O: "bg-fuchsia-500",
  P: "bg-sky-500",
  Q: "bg-red-500",
  R: "bg-blue-600",
  S: "bg-green-600",
  T: "bg-yellow-600",
  U: "bg-purple-600",
  V: "bg-pink-600",
  W: "bg-indigo-600",
  X: "bg-teal-600",
  Y: "bg-orange-600",
  Z: "bg-cyan-600",
};

export function Avatar({ name, className, size = "md" }: AvatarProps) {
  const initials = getInitials(name);
  const firstLetter = name[0]?.toUpperCase() || "A";
  const bgColor = colorMap[firstLetter] || "bg-gray-500";

  const sizes = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0",
        bgColor,
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
