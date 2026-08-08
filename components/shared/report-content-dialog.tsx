"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import { useCreateContentReport, type ContentTargetType } from "@/lib/hooks/use-safety";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const REASONS = [
  "Spam",
  "Harassment",
  "Scam or fraud",
  "Inappropriate content",
  "Misleading information",
  "Other",
];

interface ReportContentDialogProps {
  targetType: ContentTargetType;
  targetId: string;
  label?: string;
  variant?: "ghost" | "outline" | "secondary";
  className?: string;
}

export function ReportContentDialog({
  targetType,
  targetId,
  label = "Report",
  variant = "ghost",
  className,
}: ReportContentDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const createReport = useCreateContentReport();

  const reset = () => {
    setReason("");
    setDescription("");
  };

  const submit = () => {
    if (!reason.trim()) {
      toast.error("Please select a reason");
      return;
    }
    createReport.mutate(
      {
        targetType,
        targetId,
        reason: reason.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Report submitted. Our moderation team will review it.");
          reset();
          setOpen(false);
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Failed to submit report"
          ),
      }
    );
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size="sm"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Flag className="h-4 w-4" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={(value) => !value && setOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report this content</DialogTitle>
            <DialogDescription>
              Let us know why this content violates our guidelines. Our
              moderation team will review it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      reason === r
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-description">Additional details (optional)</Label>
              <Textarea
                id="report-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us more about what happened"
                maxLength={2000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createReport.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submit}
              disabled={createReport.isPending}
            >
              {createReport.isPending ? "Submitting..." : "Submit report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
