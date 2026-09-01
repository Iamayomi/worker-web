"use client";

import { LoaderCircle } from "lucide-react";
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

interface NoteDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 title: string;
 description: string;
 confirmLabel: string;
 confirmVariant?: "default" | "destructive";
 note: string;
 onNoteChange: (note: string) => void;
 busy: boolean;
 onConfirm: () => void;
}

export function NoteDialog({
 open,
 onOpenChange,
 title,
 description,
 confirmLabel,
 confirmVariant = "default",
 note,
 onNoteChange,
 busy,
 onConfirm,
}: NoteDialogProps) {
 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>{title}</DialogTitle>
 <DialogDescription>{description}</DialogDescription>
 </DialogHeader>
 <FormTextarea
 label="Note (optional)"
 value={note}
 onChange={(e) => onNoteChange(e.target.value)}
 placeholder="Add a note for the other party"
 rows={3}
 />
 <DialogFooter>
 <Button variant="outline" onClick={() => onOpenChange(false)}>
 Cancel
 </Button>
 <Button
 variant={confirmVariant}
 disabled={busy}
 onClick={onConfirm}
 >
 {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
 {confirmLabel}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 );
}
