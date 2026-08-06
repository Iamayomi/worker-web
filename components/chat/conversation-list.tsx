"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { MessagesSquare } from "lucide-react";
import type { ChatConversationSummary } from "@/lib/types/chat";

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

export function ConversationList({
	items,
	isLoading,
	error,
	action,
}: {
	items: ChatConversationSummary[];
	isLoading: boolean;
	error: Error | null;
	action?: React.ReactNode;
}) {
	const pathname = usePathname();

	if (isLoading) {
		return (
			<div className="space-y-2">
				{[...Array(5)].map((_, i) => (
					<div
						key={i}
						className="h-16 animate-pulse rounded-lg bg-muted/50"
					/>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<EmptyState
				icon={MessagesSquare}
				title="Could not load conversations"
				description={error.message}
			/>
		);
	}

	if (items.length === 0) {
		return (
			<div>
				{action}
				<EmptyState
					icon={MessagesSquare}
					title="No conversations yet"
					description="Start a new conversation to message another member."
				/>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<h2 className="text-sm font-semibold text-muted-foreground">
					Conversations
				</h2>
				{action}
			</div>
			<ul className="space-y-1">
				{items.map((item) => {
					const active = pathname === `/messages/${item.id}`;
					return (
						<li key={item.id}>
							<Link
								href={`/messages/${item.id}`}
								className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
									active
										? "border-primary/30 bg-primary/5"
										: "border-border/10 hover:bg-secondary/50"
								}`}
							>
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
								<div className="min-w-0 flex-1">
									<div className="flex items-center justify-between gap-2">
										<p className="truncate text-sm font-semibold">
											{item.participant.name || item.participant.email}
										</p>
										{item.lastMessage?.createdAt && (
											<span className="shrink-0 text-xs text-muted-foreground">
												{formatTime(item.lastMessage.createdAt)}
											</span>
										)}
									</div>
									<div className="mt-0.5 flex items-center justify-between gap-2">
										<p className="truncate text-xs text-muted-foreground">
											{item.lastMessage?.body ||
												(item.jobTitle ? `Re: ${item.jobTitle}` : "No messages yet")}
										</p>
										{item.unreadCount > 0 && (
											<span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
												{item.unreadCount}
											</span>
										)}
									</div>
								</div>
							</Link>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
