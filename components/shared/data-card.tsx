import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataCardProps {
  children: ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
}

export function DataCard({ children, href, className, onClick }: DataCardProps) {
  const classes = cn(
    "flex items-center justify-between rounded-lg border border-border/15 p-4 transition-colors hover:border-border/30",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
    );
  }

  return (
    <div className={classes} onClick={onClick} role={onClick ? "button" : undefined}>
      {children}
    </div>
  );
}
