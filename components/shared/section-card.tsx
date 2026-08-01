import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function SectionCard({ title, children, className, actions }: SectionCardProps) {
  return (
    <Card className={className}>
      {(title || actions) && (
        <CardHeader className="flex-row items-center justify-between">
          {title && <CardTitle>{title}</CardTitle>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
