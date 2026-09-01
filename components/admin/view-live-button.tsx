"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ViewLiveButton({
 href,
 published,
 label = "View live",
}: {
 href: string;
 published: boolean;
 label?: string;
}) {
 if (published) {
 return (
 <Button variant="outline" size="sm" asChild title={`Opens ${href}`}>
 <a href={href} target="_blank" rel="noreferrer">
 <ExternalLink className="h-4 w-4" />
 {label}
 </a>
 </Button>
 );
 }
 return (
 <Button
 variant="outline"
 size="sm"
 disabled
 title="Publish to make this live and preview it"
 >
 <ExternalLink className="h-4 w-4" />
 {label}
 </Button>
 );
}
