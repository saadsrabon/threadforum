import { cn } from "@/lib/utils";

type AvatarProps = {
  initials: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
};

export function Avatar({ initials, className, size = "md" }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-zinc-200 font-semibold text-zinc-600",
        sizes[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}
