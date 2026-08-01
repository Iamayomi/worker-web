import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  styleMap?: Record<string, string>;
}

export function StatusBadge({ status, styleMap }: StatusBadgeProps) {
  const variantClass = styleMap?.[status];
  return (
    <Badge className={variantClass}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
