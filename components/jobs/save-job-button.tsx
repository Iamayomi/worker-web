"use client";

import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useSavedJobIds,
  useSaveJob,
  useUnsaveJob,
} from "@/lib/hooks/use-jobs";
import { AccountType, UserRole } from "@/types/api/auth";
import { cn } from "@/lib/utils";

interface SaveJobButtonProps {
  jobId: string;
  className?: string;
  withLabel?: boolean;
}

export function SaveJobButton({ jobId, className, withLabel = false }: SaveJobButtonProps) {
  const { user } = useAuth();
  const myRoles = (user?.roles ?? []) as UserRole[];
  const isAdmin =
    myRoles.includes(UserRole.SUPER_ADMIN) || myRoles.includes(UserRole.ADMIN);
  const isTalent = user?.accountType === AccountType.TALENT && !isAdmin;

  const { data, isLoading } = useSavedJobIds(isTalent);
  const saveJob = useSaveJob();
  const unsaveJob = useUnsaveJob();

  if (!isTalent) return null;

  const saved = data?.ids?.includes(jobId) ?? false;
  const pending = saveJob.isPending || unsaveJob.isPending;

  const toggle = () => {
    if (saved) {
      unsaveJob.mutate(jobId, {
        onSuccess: () => toast.success("Removed from saved jobs"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to unsave job"),
      });
    } else {
      saveJob.mutate(jobId, {
        onSuccess: () => toast.success("Job saved"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to save job"),
      });
    }
  };

  if (withLabel) {
    return (
      <Button
        variant="outline"
        size="default"
        onClick={toggle}
        disabled={pending || isLoading}
        className={cn("w-full", className)}
      >
        <Bookmark className={cn(saved && "fill-current text-primary")} />
        {saved ? "Saved" : "Save job"}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      disabled={pending || isLoading}
      className={cn(
        "text-muted-foreground hover:text-primary",
        saved && "text-primary",
        className
      )}
      aria-label={saved ? "Remove from saved jobs" : "Save job"}
    >
      <Bookmark className={cn(saved && "fill-current")} />
    </Button>
  );
}
