"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time";
import { FormTextarea } from "@/components/ui/form-textarea";
import { FormSelect } from "@/components/ui/form-select";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog";

export const COMMON_TIMEZONES = [
 "America/New_York",
 "America/Chicago",
 "America/Denver",
 "America/Los_Angeles",
 "America/Toronto",
 "Europe/London",
 "Europe/Paris",
 "Europe/Berlin",
 "Africa/Lagos",
 "Africa/Nairobi",
 "Africa/Johannesburg",
 "Asia/Dubai",
 "Asia/Kolkata",
 "Asia/Singapore",
 "Australia/Sydney",
] as const;

interface RescheduleDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 mode: "request" | "confirm";
 busy: boolean;
 onRequest?: (proposedAt: string, note?: string) => void;
 onConfirm?: (scheduledAt: string, timezone?: string, note?: string) => void;
}

export function RescheduleDialog({
 open,
 onOpenChange,
 mode,
 busy,
 onRequest,
 onConfirm,
}: RescheduleDialogProps) {
 const [date, setDate] = useState<Date | undefined>(
 () => new Date(Date.now() + 24 * 60 * 60 * 1000)
 );
 const [timezone, setTimezone] = useState(
 () => Intl.DateTimeFormat().resolvedOptions().timeZone
 );
 const [note, setNote] = useState("");

 const close = () => {
 onOpenChange(false);
 setNote("");
 };

 const submit = () => {
 if (!date) return;
 if (mode === "request") {
 onRequest?.(date.toISOString(), note.trim() || undefined);
 } else if (onConfirm) {
 onConfirm(date.toISOString(), timezone, note.trim() || undefined);
 }
 };

 return (
 <Dialog
 open={open}
 onOpenChange={(open) => {
 onOpenChange(open);
 if (!open) setNote("");
 }}
 >
 <DialogContent>
 <DialogHeader>
 <DialogTitle>
 {mode === "request" ? "Request a new time" : "Confirm reschedule"}
 </DialogTitle>
 <DialogDescription>
 {mode === "request"
 ? "The interview will be held until the other party confirms a new time."
 : "The interview will be moved to the new time."}
 </DialogDescription>
 </DialogHeader>
 <DateTimePicker value={date} onChange={setDate} />
 {mode === "confirm" && (
 <FormSelect
 label="Timezone"
 value={timezone}
 onValueChange={setTimezone}
 options={COMMON_TIMEZONES.map((tz) => ({ value: tz, label: tz }))}
 />
 )}
 <FormTextarea
 label="Note (optional)"
 value={note}
 onChange={(e) => setNote(e.target.value)}
 placeholder="e.g. Could we move this to Thursday?"
 rows={2}
 />
 <DialogFooter>
 <Button variant="outline" onClick={close}>
 Cancel
 </Button>
 <Button disabled={!date || busy} onClick={submit}>
 {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
 {mode === "request" ? "Request reschedule" : "Confirm new time"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 );
}
