"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareJobButtonProps {
  title: string;
  url?: string;
  className?: string;
  withLabel?: boolean;
}

export function ShareJobButton({
  title,
  url,
  className,
  withLabel = false,
}: ShareJobButtonProps) {
  const share = async () => {
    const shareUrl = url ?? window.location.href;
    const data = {
      title,
      text: `${title} on Worker`,
      url: shareUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // user cancelled or share failed - fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Job link copied to clipboard");
    } catch {
      toast.error("Unable to copy the job link");
    }
  };

  if (withLabel) {
    return (
      <Button
        variant="outline"
        size="default"
        onClick={share}
        className={cn("w-full", className)}
      >
        <Share2 className="h-4 w-4" />
        Share job
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={share}
      className={cn("text-muted-foreground hover:text-primary", className)}
      aria-label="Share job"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
}
