"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/ui/form-input";
import { FormTextarea } from "@/components/ui/form-textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateEvent } from "@/lib/hooks/use-community";
import {
  CommunityEventType,
  type CreateCommunityEventInput,
} from "@/types/api/community";

interface CreateEventDialogProps {
  communityId: string;
}

function toLocalInputValue(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CreateEventDialog({ communityId }: CreateEventDialogProps) {
  const createEvent = useCreateEvent(communityId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateCommunityEventInput>(() => ({
    title: "",
    description: "",
    eventType: CommunityEventType.IN_PERSON,
    location: "",
    meetLink: "",
    startsAt: toLocalInputValue(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ),
    maxAttendees: undefined,
  }));

  function submit() {
    const title = form.title.trim();
    if (!title || !form.startsAt) return;
    const payload: CreateCommunityEventInput = {
      ...form,
      title,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
      location: form.location?.trim() || undefined,
      meetLink: form.meetLink?.trim() || undefined,
      maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
    };
    createEvent.mutate(payload, {
      onSuccess: () => {
        toast.success("Event created");
        setOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create event");
      },
    });
  }

  const needsLocation =
    form.eventType === CommunityEventType.IN_PERSON ||
    form.eventType === CommunityEventType.HYBRID;
  const needsLink =
    form.eventType === CommunityEventType.ONLINE ||
    form.eventType === CommunityEventType.HYBRID;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <CalendarPlus className="size-4" /> New event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create an event</DialogTitle>
          <DialogDescription>
            Host a meetup, workshop, or online gathering for your community.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          <FormInput
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Monthly community hangout"
          />
          <FormTextarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What will attendees expect?"
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Event type</label>
            <Select
              value={form.eventType}
              onValueChange={(value: CommunityEventType) =>
                setForm({ ...form, eventType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CommunityEventType.IN_PERSON}>In person</SelectItem>
                <SelectItem value={CommunityEventType.ONLINE}>Online</SelectItem>
                <SelectItem value={CommunityEventType.HYBRID}>Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {needsLocation && (
            <FormInput
              label="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Lagos Innovation Hub"
            />
          )}
          {needsLink && (
            <FormInput
              label="Meeting link"
              value={form.meetLink}
              onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
              placeholder="https://meet.google.com/…"
            />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Starts at"
              required
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            />
            <FormInput
              label="Ends at"
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
            />
          </div>
          <FormInput
            label="Max attendees"
            type="number"
            min={1}
            value={form.maxAttendees}
            onChange={(e) =>
              setForm({
                ...form,
                maxAttendees: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="Optional"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createEvent.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={!form.title.trim() || !form.startsAt || createEvent.isPending}
            >
              {createEvent.isPending ? "Creating…" : "Create event"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
