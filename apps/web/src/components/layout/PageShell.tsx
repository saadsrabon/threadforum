import { cn } from "@/lib/utils";

type ShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageShell({ children, className }: ShellProps) {
  return (
    <div className={cn("flex min-h-full flex-1 flex-col bg-background", className)}>
      {children}
    </div>
  );
}

export function PageContent({ children, className }: ShellProps) {
  return <div className={cn("flex flex-1 flex-col", className)}>{children}</div>;
}
