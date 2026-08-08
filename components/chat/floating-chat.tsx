"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  LoaderCircle,
  Maximize2,
  MessageCircle,
  MessagesSquare,
  Search,
  Send,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useChatUnreadCount,
  useConversations,
  useCreateConversation,
  usePeopleSearch,
} from "@/lib/hooks/use-chat";
import { useChatPresence, useSeedPresence } from "@/lib/hooks/use-presence";
import { useNotificationRealtime } from "@/lib/hooks/use-notifications";
import { usePresenceStore } from "@/store/presenceStore";
import { MessageThread } from "@/components/chat/message-thread";
import { UnreadDot } from "@/components/shared/unread-dot";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import type { ChatConversationSummary, SearchPeopleItem } from "@/lib/types/chat";

function initials(name?: string, email?: string): string {
  const source = name || email || "?";
  return source
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function PresenceDot({ userId }: { userId: string }) {
  const online = usePresenceStore((s) => !!s.onlineUserIds[userId]);
  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background ${
        online ? "bg-emerald-500" : "bg-muted-foreground/40"
      }`}
    />
  );
}

function ConversationRow({
  item,
  onSelect,
}: {
  item: ChatConversationSummary;
  onSelect: (id: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-secondary/60"
      >
        <span className="relative shrink-0">
          <Avatar className="size-10">
            {item.participant.avatarUrl ? (
              <AvatarImage
                src={item.participant.avatarUrl}
                alt={item.participant.name || "Avatar"}
              />
            ) : null}
            <AvatarFallback>
              {initials(item.participant.name, item.participant.email)}
            </AvatarFallback>
          </Avatar>
          <PresenceDot userId={item.participant.userId} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold">
              {item.participant.name || item.participant.email}
            </span>
            {item.lastMessage?.createdAt && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatTime(item.lastMessage.createdAt)}
              </span>
            )}
          </span>
          <span className="mt-0.5 flex items-center justify-between gap-2">
            <span className="truncate text-xs text-muted-foreground">
              {item.lastMessage?.body ||
                (item.jobTitle ? `Re: ${item.jobTitle}` : "No messages yet")}
            </span>
            {item.unreadCount > 0 && (
              <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {item.unreadCount}
              </span>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}

function NewMessageSearch({
  onStarted,
  isAdmin,
}: {
  onStarted: (id: string) => void;
  isAdmin: boolean;
}) {
  const createConversation = useCreateConversation();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isFetching } = usePeopleSearch(debounced);

  const startChat = async (person: SearchPeopleItem) => {
    if (startingId) return;
    setStartingId(person.userId);
    try {
      const result = await createConversation.mutateAsync({
        participantIds: [person.userId],
      });
      if (result?.id) {
        onStarted(result.id);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start chat");
      setStartingId(null);
    }
  };

  return (
    <div className="border-b p-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={
            isAdmin ? "Search name, company or email..." : "Search by name or company..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          autoFocus
        />
      </div>
      {debounced.trim().length >= 2 && (
        <div className="mt-2 max-h-44 overflow-y-auto">
          {isFetching ? (
            <p className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Searching...
            </p>
          ) : (data?.items.length ?? 0) === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">No people found.</p>
          ) : (
            <ul className="space-y-1">
              {(data?.items ?? []).map((person) => (
                <li key={person.userId}>
                  <button
                    type="button"
                    onClick={() => void startChat(person)}
                    disabled={startingId === person.userId}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-secondary/60 disabled:opacity-60"
                  >
                    <span className="relative shrink-0">
                      <Avatar className="size-8">
                        {person.avatarUrl && (
                          <AvatarImage src={person.avatarUrl} alt={person.name} />
                        )}
                        <AvatarFallback className="text-xs">
                          {initials(person.name)}
                        </AvatarFallback>
                      </Avatar>
                      <PresenceDot userId={person.userId} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {person.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {person.email ??
                          (person.accountType === "client" ? "Company" : "Talent")}
                      </span>
                    </span>
                    {startingId === person.userId ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

const FAB_SIZE = 56;
const FAB_MARGIN = 16;

function getDefaultFabPosition(): { x: number; y: number } {
  return {
    x: Math.max(0, window.innerWidth - FAB_SIZE - FAB_MARGIN),
    y: Math.max(0, window.innerHeight - FAB_SIZE - FAB_MARGIN),
  };
}

function clampPosition(pos: { x: number; y: number }): { x: number; y: number } {
  const maxX = Math.max(0, window.innerWidth - FAB_SIZE - 8);
  const maxY = Math.max(0, window.innerHeight - FAB_SIZE - 8);
  return {
    x: Math.min(Math.max(0, pos.x), maxX),
    y: Math.min(Math.max(0, pos.y), maxY),
  };
}

export function FloatingChat() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const [fabPos, setFabPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragState = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const didDrag = useRef(false);

  const isAdmin = (user?.roles ?? []).some(
    (r) => r === "super_admin" || r === "admin",
  );

  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
    setActiveId(null);
    setNewMessage(false);
  }

  useChatPresence();
  useNotificationRealtime();

  const { data: unreadData } = useChatUnreadCount();
  const { data: conversationsData, isLoading: conversationsLoading } =
    useConversations();
  const items = conversationsData?.items ?? [];
  useSeedPresence(items.map((item) => item.participant));
  const onlineUserIds = usePresenceStore((s) => s.onlineUserIds);

  if (pathname.startsWith("/messages")) return null;
  if (isLoading || !isAuthenticated) return null;

  const unread = unreadData?.total ?? 0;
  const onlineCount = items.filter(
    (i) => !!onlineUserIds[i.participant.userId],
  ).length;

  const close = () => {
    setOpen(false);
    setActiveId(null);
    setNewMessage(false);
  };

  const selectConversation = (id: string) => {
    setActiveId(id);
    setNewMessage(false);
  };

  const handleFabPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const origin = fabPos ?? getDefaultFabPosition();
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: origin.x,
      originY: origin.y,
    };
    didDrag.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleFabPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const state = dragState.current;
    if (!state) return;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      didDrag.current = true;
    }
    if (!didDrag.current) return;
    setDragging(true);
    setOpen(false);
    setFabPos(clampPosition({ x: state.originX + dx, y: state.originY + dy }));
  };

  const handleFabPointerUp = () => {
    dragState.current = null;
    setDragging(false);
  };

  const handleFabClick = () => {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    setOpen((o) => !o);
  };

  const position =
    fabPos ?? (typeof window === "undefined" ? { x: 0, y: 0 } : getDefaultFabPosition());
  const panelStyle: React.CSSProperties | undefined = (() => {
    if (!fabPos) return undefined;
    const panelHeight = Math.min(560, window.innerHeight - 128);
    const panelWidth = Math.min(400, window.innerWidth - 32);
    let top = position.y - panelHeight - 16;
    if (top < 8) top = position.y + FAB_SIZE + 16;
    const left = Math.min(
      Math.max(8, position.x + FAB_SIZE - panelWidth),
      window.innerWidth - panelWidth - 8,
    );
    return { left, top };
  })();

  return (
    <>
      <button
        type="button"
        onClick={handleFabClick}
        onPointerDown={handleFabPointerDown}
        onPointerMove={handleFabPointerMove}
        onPointerUp={handleFabPointerUp}
        onPointerCancel={handleFabPointerUp}
        aria-label={open ? "Close chat" : "Open chat"}
        className={`fixed z-50 flex size-14 touch-none items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={
          fabPos
            ? { left: fabPos.x, top: fabPos.y }
            : { bottom: FAB_MARGIN, right: FAB_MARGIN }
        }
      >
        {open ? (
          <X className="size-6" />
        ) : (
          <MessageCircle className="size-6" />
        )}
        <UnreadDot
          show={!open && unread > 0}
          className="-right-0.5 -top-0.5"
        />
      </button>

      {open && (
        <div
          className="fixed z-50 flex h-[560px] max-h-[calc(100dvh-7.5rem)] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border/15 bg-background shadow-2xl"
          style={
            panelStyle ?? { bottom: FAB_MARGIN + FAB_SIZE + 16, right: FAB_MARGIN }
          }
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            {activeId ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-semibold">Conversation</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold">Messages</p>
                <p className="text-xs text-muted-foreground">
                  {onlineCount > 0
                    ? `${onlineCount} ${onlineCount === 1 ? "person" : "people"} online`
                    : "No one online right now"}
                </p>
              </div>
            )}
            <div className="flex items-center gap-0.5">
              {!activeId && (
                <button
                  type="button"
                  onClick={() => setNewMessage((v) => !v)}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                  title="New message"
                >
                  <MessagesSquare className="h-4 w-4" />
                </button>
              )}
              <Link
                href="/messages"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                title="Open full messages"
              >
                <Maximize2 className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={close}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            {activeId ? (
              <MessageThread conversationId={activeId} />
            ) : (
              <div className="flex h-full flex-col">
                {newMessage && (
                  <NewMessageSearch
                    isAdmin={isAdmin}
                    onStarted={(id) => {
                      selectConversation(id);
                    }}
                  />
                )}
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {conversationsLoading ? (
                    <div className="space-y-2 p-3">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="h-14 animate-pulse rounded-lg bg-muted/50"
                        />
                      ))}
                    </div>
                  ) : items.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                      <MessagesSquare className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No conversations yet. Start one by searching for someone.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-0.5 p-2">
                      {items.map((item) => (
                        <ConversationRow
                          key={item.id}
                          item={item}
                          onSelect={selectConversation}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
