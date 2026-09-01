"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
 ArrowLeft,
 Inbox,
 LoaderCircle,
 Mail,
 MailCheck,
 Paperclip,
 RefreshCw,
 Search,
} from "lucide-react";
import {
 useGoogleGmailStatus,
 useGmailMessages,
 useGmailMessageDetails,
} from "@/lib/hooks/use-google-gmail";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorAlert } from "@/components/shared/error-alert";
import { cn } from "@/lib/utils";
import type {
 GmailMessageDetails,
 GmailMessageSummary,
} from "@/types/api/google";

const SEARCH_DELAY = 400;
const DEFAULT_MAX_RESULTS = 20;

function formatDate(value: string): string {
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return value;
 return date.toLocaleString(undefined, {
 month: "short",
 day: "numeric",
 hour: "2-digit",
 minute: "2-digit",
 });
}

function formatBytes(bytes: number): string {
 if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
 if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
 return `${bytes} B`;
}

function htmlToText(html: string): string {
 return html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ");
}

function MessageListItem({
 message,
 active,
 onSelect,
}: {
 message: GmailMessageSummary;
 active: boolean;
 onSelect: () => void;
}) {
 return (
 <button
 type="button"
 onClick={onSelect}
 className={cn(
 "w-full border px-3 py-2.5 text-left transition-colors",
 active
 ? "border-primary/40 bg-primary/5"
 : "border-border/70 bg-background hover:bg-muted/50"
 )}
 >
 <div className="flex items-baseline justify-between gap-2">
 <span className="truncate text-sm font-medium">{message.from}</span>
 <span className="shrink-0 text-xs text-muted-foreground">
 {formatDate(message.date)}
 </span>
 </div>
 <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
 {message.subject || "(no subject)"}
 </p>
 <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
 {message.snippet}
 </p>
 {message.hasAttachment && (
 <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
 <Paperclip className="h-3 w-3" />
 Attachment
 </span>
 )}
 </button>
 );
}

function MessageDetail({
 messageId,
 onBack,
}: {
 messageId: string;
 onBack: () => void;
}) {
 const { data, isLoading, isError, error } = useGmailMessageDetails(messageId);
 const message = data?.message;

 return (
 <div className=" border border-border/70 bg-background">
 {isLoading ? (
 <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
 <LoaderCircle className="h-4 w-4 animate-spin" />
 Loading message...
 </div>
 ) : isError ? (
 <div className="p-4">
 <ErrorAlert
 message={
 error instanceof Error ? error.message : "Failed to load message"
 }
 />
 </div>
 ) : message ? (
 <MessageDetailBody message={message} onBack={onBack} />
 ) : null}
 </div>
 );
}

function MessageDetailBody({
 message,
 onBack,
}: {
 message: GmailMessageDetails;
 onBack: () => void;
}) {
 const body = message.body || (message.htmlBody ? htmlToText(message.htmlBody) : "");
 const sanitizedHtml = message.htmlBody && !message.body ? message.htmlBody : undefined;

 return (
 <div className="flex h-full flex-col">
 <div className="flex items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
 <button
 type="button"
 onClick={onBack}
 className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground lg:hidden"
 >
 <ArrowLeft className="h-3.5 w-3.5" />
 Back to list
 </button>
 <span className="text-xs text-muted-foreground">Message</span>
 </div>
 <div className="flex-1 overflow-y-auto p-4">
 <h3 className="text-base font-semibold leading-snug">
 {message.subject || "(no subject)"}
 </h3>
 <p className="mt-1 text-sm text-muted-foreground">{message.from}</p>
 <p className="mt-0.5 text-xs text-muted-foreground">
 {formatDate(message.date)}
 </p>

 <div className="mt-4">
 {sanitizedHtml && message.htmlBody ? (
 <div
 className="gmail-html prose-sm max-w-none text-sm text-foreground"
 dangerouslySetInnerHTML={{ __html: message.htmlBody }}
 />
 ) : body ? (
 <p className="whitespace-pre-wrap text-sm text-foreground/90">{body}</p>
 ) : (
 <p className="text-sm text-muted-foreground">No text content.</p>
 )}
 </div>

 {(message.attachments?.length ?? 0) > 0 && (
 <div className="mt-5">
 <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
 Attachments
 </p>
 <ul className="mt-2 space-y-1.5">
 {message.attachments?.map((attachment, index) => (
 <li
 key={`${attachment.filename}-${index}`}
 className="flex items-center gap-2 border border-border/70 px-3 py-2 text-sm"
 >
 <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
 <span className="truncate">{attachment.filename}</span>
 <span className="ml-auto shrink-0 text-xs text-muted-foreground">
 {formatBytes(attachment.size)}
 </span>
 </li>
 ))}
 </ul>
 </div>
 )}

 {message.from && (
 <div className="mt-5">
 <Button asChild variant="outline" size="sm">
 <a href={`mailto:${message.from}`}>Reply</a>
 </Button>
 </div>
 )}
 </div>
 </div>
 );
}

export function GmailInboxView() {
 usePageTitle("Gmail inbox");
 const [searchInput, setSearchInput] = useState("");
 const [search, setSearch] = useState("");
 const [selectedId, setSelectedId] = useState<string | null>(null);

 useEffect(() => {
 const timer = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DELAY);
 return () => clearTimeout(timer);
 }, [searchInput]);

 const statusQuery = useGoogleGmailStatus();
 const {
 data,
 isLoading,
 isError,
 error,
 refetch,
 isFetching,
 } = useGmailMessages(search, DEFAULT_MAX_RESULTS);

 const messages = useMemo(() => data?.messages ?? [], [data]);

 const connected = statusQuery.data?.connected ?? false;

 return (
 <AnimatedContent className="mx-auto max-w-6xl space-y-6">
 <PageHeader
 title="Gmail inbox"
 description="Recruitment emails synced from your connected Gmail account."
 actions={
 <Button asChild variant="outline" size="sm">
 <Link href="/settings">Manage connection</Link>
 </Button>
 }
 />

 {statusQuery.isLoading ? (
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <LoaderCircle className="h-4 w-4 animate-spin" />
 Checking connection...
 </div>
 ) : !connected ? (
 <div className=" border border-border/15">
 <EmptyState
 icon={MailCheck}
 title="Gmail is not connected"
 description="Connect your Google account to sync recruitment emails into your inbox."
 action={
 <Button asChild>
 <Link href="/settings">
 <MailCheck className="h-4 w-4" />
 Connect Google Gmail
 </Link>
 </Button>
 }
 />
 </div>
 ) : (
 <>
 <div className="flex flex-wrap items-center gap-2">
 <div className="relative min-w-0 flex-1">
 <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
 <Input
 type="search"
 value={searchInput}
 onChange={(e) => setSearchInput(e.target.value)}
 placeholder="Search recruitment emails..."
 className="pl-8"
 />
 </div>
 <Button
 variant="outline"
 size="sm"
 onClick={() => refetch()}
 disabled={isFetching}
 >
 <RefreshCw
 className={cn("h-4 w-4", isFetching && "animate-spin")}
 />
 Refresh
 </Button>
 </div>

 {isError && (
 <ErrorAlert
 message={
 error instanceof Error ? error.message : "Failed to load inbox"
 }
 />
 )}

 {isLoading ? (
 <div className="grid gap-4 lg:grid-cols-2">
 <div className="space-y-2">
 {Array.from({ length: 6 }).map((_, i) => (
 <div
 key={i}
 className="h-24 animate-pulse border border-border/15 bg-muted"
 />
 ))}
 </div>
 </div>
 ) : messages.length === 0 ? (
 <div className="grid gap-4 lg:grid-cols-2">
 <div className=" border border-border/15">
 <EmptyState
 icon={Inbox}
 title={search ? "No matching emails" : "Inbox is empty"}
 description={
 search
 ? "Try a different search term."
 : "Recruitment emails will show up here."
 }
 />
 </div>
 </div>
 ) : (
 <div className="grid items-start gap-4 lg:grid-cols-2">
 <div className="space-y-2">
 {messages.map((message) => (
 <MessageListItem
 key={message.id}
 message={message}
 active={selectedId === message.id}
 onSelect={() => setSelectedId(message.id)}
 />
 ))}
 </div>
 <div
 className={cn(
 "lg:sticky lg:top-0",
 selectedId ? "block" : "hidden lg:block"
 )}
 >
 {selectedId ? (
 <MessageDetail
 messageId={selectedId}
 onBack={() => setSelectedId(null)}
 />
 ) : (
 <div className="flex h-full min-h-48 items-center justify-center border border-dashed border-border/70 text-sm text-muted-foreground">
 <div className="flex flex-col items-center gap-2">
 <Mail className="h-5 w-5" />
 Select an email to read it
 </div>
 </div>
 )}
 </div>
 </div>
 )}
 </>
 )}
 </AnimatedContent>
 );
}