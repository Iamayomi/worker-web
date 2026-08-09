"use client";

import { useState } from "react";
import { LoaderCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FormTextarea } from "@/components/ui/form-textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  busy: boolean;
  onSubmit: (rating: number, feedback?: string) => void;
}

export function FeedbackDialog({
  open,
  onOpenChange,
  busy,
  onSubmit,
}: FeedbackDialogProps) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  const close = () => {
    onOpenChange(false);
    setFeedback("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) setFeedback("");
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit feedback</DialogTitle>
          <DialogDescription>
            Rate the candidate and leave feedback after the interview.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
            >
              <Star
                className={cn(
                  "h-6 w-6",
                  value <= rating && "fill-amber-400 text-amber-400"
                )}
              />
            </button>
          ))}
        </div>
        <FormTextarea
          label="Feedback (optional)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="How did the interview go?"
          rows={4}
        />
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            disabled={busy}
            onClick={() => onSubmit(rating, feedback.trim() || undefined)}
          >
            {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Submit feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
