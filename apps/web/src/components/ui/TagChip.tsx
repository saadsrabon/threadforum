import Link from "next/link";
import { cn } from "@/lib/utils";

type TagChipProps = {
  label: string;
  color?: string;
  href?: string;
  className?: string;
};

export function TagChip({ label, color, href, className }: TagChipProps) {
  const style = color ? { borderColor: color, color } : undefined;

  const chip = (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        !color && "border-border text-muted",
        className,
      )}
      style={style}
    >
      {label}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80">
        {chip}
      </Link>
    );
  }

  return chip;
}
