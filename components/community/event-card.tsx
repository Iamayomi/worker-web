"use client";

import { useState } from "react";
import {
  CalendarDays,
  MapPin,
  Video,
  CalendarOff,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useRsvpToEvent,
  useCancelEvent,
} from "@/lib/hooks/use-community";
import {
  CommunityEventStatus,
  CommunityEventType,
  EventRsvpStatus,
  type CommunityEventData,
} from "@/types/api/community";

interface EventCardProps {
  communityId: string;
  event: CommunityEventData;
  currentUserId?: string;
  canManage: boolean;
}

function formatEventDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EventCard({
  communityId,
  event,
  currentUserId,
  canManage,
}: EventCardProps) {
  const [now] = useState(() => Date.now());
  const [response, setResponse] = useState<EventRsvpStatus | undefined>(
    event.myRsvp,
  );
  const rsvp = useRsvpToEvent(event.id);
  const cancel = useCancelEvent(communityId, event.id);

  const isCancelled = event.status === CommunityEventStatus.CANCELLED;
  const isPast = new Date(event.startsAt).getTime() <= now;

  function onRsvp(next: EventRsvpStatus) {
    const prev = response;
    setResponse(next === prev ? undefined : next);
    rsvp.mutate(next, {
      onError: () => setResponse(prev),
    });
  }

  return (
    <Card className="gap-0 overflow-hidden">
      <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10">
          <CalendarDays className="size-4 text-primary" />
          <span className="mt-0.5 text-[10px] font-semibold uppercase text-primary">
            {new Date(event.startsAt).toLocaleDateString(undefined, { month: "short" })}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{event.title}</h3>
          <p className="text-xs text-muted-foreground">
            {formatEventDate(event.startsAt)} at {formatEventTime(event.startsAt)}
            {event.endsAt
              ? ` – ${formatEventTime(event.endsAt)}`
              : ""}
          </p>
        </div>
        {(isCancelled || isPast) && (
          <Badge variant={isCancelled ? "destructive" : "secondary"} className="shrink-0">
            {isCancelled ? "Cancelled" : "Past"}
          </Badge>
        )}
      </div>

      <CardContent className="space-y-3 px-4 py-4">
        {event.description && (
          <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {event.description}
          </p>
        )}

        <div className="space-y-1.5 text-sm text-muted-foreground">
          {event.eventType !== CommunityEventType.ONLINE && event.location && (
            <p className="flex items-center gap-2">
              <MapPin className="size-4" /> {event.location}
            </p>
          )}
          {event.eventType !== CommunityEventType.IN_PERSON && event.meetLink && (
            <p className="flex items-center gap-2">
              <Video className="size-4" /> Online event
            </p>
          )}
          <p className="flex items-center gap-2">
            <Users className="size-4" />
            {event.goingCount} going · {event.interestedCount} interested
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {!isCancelled && currentUserId && !isPast && (
            <>
              <Button
                size="sm"
                variant={response === EventRsvpStatus.GOING ? "default" : "outline"}
                className={cn(response === EventRsvpStatus.GOING && "bg-primary")}
                disabled={rsvp.isPending}
                onClick={() => onRsvp(EventRsvpStatus.GOING)}
              >
                {response === EventRsvpStatus.GOING ? "Going" : "Going"}
              </Button>
              <Button
                size="sm"
                variant={response === EventRsvpStatus.INTERESTED ? "default" : "outline"}
                disabled={rsvp.isPending}
                onClick={() => onRsvp(EventRsvpStatus.INTERESTED)}
              >
                {response === EventRsvpStatus.INTERESTED
                  ? "Interested"
                  : "Interested"}
              </Button>
            </>
          )}
          {canManage && !isCancelled && !isPast && (
            <Button
              size="sm"
              variant="destructive"
              className="ml-auto"
              disabled={cancel.isPending}
              onClick={() => cancel.mutate()}
            >
              <CalendarOff className="size-4" /> Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
