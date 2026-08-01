import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface VerifiedBadgeProps {
  verified?: boolean;
  className?: string;
}

export function VerifiedBadge({
  verified = true,
  className,
}: VerifiedBadgeProps) {
  if (!verified) return null;
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 border-primary/20 bg-primary/5 px-2 py-0.5 text-primary",
        className
      )}
    >
      <BadgeCheck className="h-3.5 w-3.5" />
      Verified
    </Badge>
  );
}
