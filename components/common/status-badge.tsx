import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = status.replace("-", " ");

  return (
    <Badge
      variant={status === "active" || status === "shipped" ? "default" : "muted"}
      className="rounded-full gap-2"
    >
      <span className="h-1.5 w-1.5 bg-current" />
      {label}
    </Badge>
  );
}
