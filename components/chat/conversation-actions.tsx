"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Flag, Ban, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCreateReport, useBlockUser, REPORT_REASONS } from "@/lib/hooks/use-safety";

export function ConversationActions({ reportedId }: { reportedId: string }) {
  const createReport = useCreateReport();
  const blockUser = useBlockUser();

  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const [blockOpen, setBlockOpen] = useState(false);

  const submitReport = () => {
    if (!reason) return;
    createReport.mutate(
      {
        reportedId,
        reason: reason as never,
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Report submitted", {
            description: "Our team will review this report.",
          });
          setReportOpen(false);
          setReason("");
          setDescription("");
        },
        onError: (err) =>
          toast.error(err.message || "Failed to submit report"),
      }
    );
  };

  const confirmBlock = () => {
    blockUser.mutate(
      { blockedId: reportedId },
      {
        onSuccess: () => {
          toast.success("User blocked", {
            description: "They can no longer message you.",
          });
          setBlockOpen(false);
        },
        onError: (err) => toast.error(err.message || "Failed to block user"),
      }
    );
  };

  return (
    <>
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label="Report user"
          onClick={() => setReportOpen(true)}
        >
          <Flag className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label="Block user"
          onClick={() => setBlockOpen(true)}
        >
          <Ban className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report this user</DialogTitle>
            <DialogDescription>
              Tell us what happened. Your report is confidential.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <FormSelect
              label="Reason"
              value={reason}
              onValueChange={setReason}
              options={REPORT_REASONS}
              placeholder="Select a reason"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Details <span className="text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share more context to help our team review this report."
                rows={4}
                maxLength={2000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitReport}
              disabled={!reason || createReport.isPending}
            >
              {createReport.isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Flag className="h-4 w-4" />
              )}
              Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={blockOpen} onOpenChange={setBlockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block this user?</AlertDialogTitle>
            <AlertDialogDescription>
              They won&apos;t be able to message you anymore. You can unblock
              them later from your settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setBlockOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBlock}
              disabled={blockUser.isPending}
            >
              {blockUser.isPending && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}
              Block
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
