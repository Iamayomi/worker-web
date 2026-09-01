import type { ReactNode } from "react";
import {
 Card,
 CardAction,
 CardContent,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";

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
 <CardHeader>
 {title && <CardTitle>{title}</CardTitle>}
 {actions && <CardAction>{actions}</CardAction>}
 </CardHeader>
 )}
 <CardContent>{children}</CardContent>
 </Card>
 );
}
