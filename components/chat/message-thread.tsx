"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Image as ImageIcon, Paperclip, Send, ChevronUp, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth/auth-context";
import { chatSocket } from "@/lib/chat/socket";
import { useIsOnline, useSeedPresence } from "@/lib/hooks/use-presence";
import { ConversationActions } from "@/components/chat/conversation-actions";
import { FollowButton } from "@/components/shared/follow-button";
import {
	useConversation,
	useMessages,
	useSendMessage,
	useLoadMoreMessages,
	useMarkConversationRead,
	useChatRealtime,
	useUploadChatFile,
} from "@/lib/hooks/use-chat";
import type { ChatMessage } from "@/lib/types/chat";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ACCEPT_TYPES =
	"image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rtf";

function formatBytes(bytes?: number): string {
	if (!bytes || bytes <= 0) return "";
	const units = ["B", "KB", "MB", "GB"];
	const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
	const value = bytes / 1024 ** index;
	return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function initials(name?: string, email?: string): string {
	const source = name || email || "?";
	return source
		.split(" ")
		.map((part) => part[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

function formatMessageTime(value: string): string {
	const date = new Date(value);
	const now = new Date();
	const sameDay = date.toDateString() === now.toDateString();
	const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	return sameDay
		? time
		: `${date.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
}

export function MessageThread({ conversationId }: { conversationId: string }) {
	const { user } = useAuth();
	const { data: conversation } = useConversation(conversationId);
	const {
		data: messagesData,
		isLoading,
		error,
	} = useMessages(conversationId);
	const sendMessage = useSendMessage(conversationId);
	const loadMore = useLoadMoreMessages(conversationId);
	const markRead = useMarkConversationRead(conversationId);
	const { isTyping } = useChatRealtime(conversationId);
	const uploadFile = useUploadChatFile();

	const [draft, setDraft] = useState("");
	const [attachment, setAttachment] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const messages = messagesData?.items ?? [];
	const other = conversation?.participants.find((p) => p.userId !== user?.id);
	const currentUserId = user?.id;

	useSeedPresence(conversation?.participants ?? []);
	const otherOnline = useIsOnline(other?.userId);

	useEffect(() => {
		if (!conversationId) return;
		markRead.mutate();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [conversationId]);

	const stickToBottom = useRef(true);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
		if (stickToBottom.current || nearBottom) {
			requestAnimationFrame(() => {
				el.scrollTop = el.scrollHeight;
			});
		}
	}, [messages.length, isTyping]);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
	}, [messages.length]);

	const handleScroll = () => {
		const el = scrollRef.current;
		if (!el) return;
		stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
	};

	const handleLoadOlder = async () => {
		if (!messagesData?.nextCursor || loadMore.isPending) return;
		const el = scrollRef.current;
		const prevHeight = el?.scrollHeight ?? 0;
		await loadMore.mutateAsync(messagesData.nextCursor);
		requestAnimationFrame(() => {
			if (el) el.scrollTop = el.scrollHeight - prevHeight;
		});
	};

	const handleSend = async () => {
		const body = draft.trim();
		const file = attachment;
		if ((!body && !file) || sendMessage.isPending || uploadFile.isPending) return;

		let attachmentMeta: {
			attachmentUrl?: string;
			attachmentName?: string;
			attachmentSize?: number;
			attachmentType?: string;
		} = {};

		if (file) {
			const uploaded = await uploadFile.mutateAsync(file);
			if (!uploaded) return;
			attachmentMeta = {
				attachmentUrl: uploaded.url,
				attachmentName: uploaded.name,
				attachmentSize: uploaded.size,
				attachmentType: uploaded.type,
			};
		}

		setDraft("");
		setAttachment(null);
		stickToBottom.current = true;
		await sendMessage.mutateAsync({ body: body || undefined, ...attachmentMeta });
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		if (file.size > MAX_FILE_SIZE) {
			toast.error("File is too large. Maximum size is 20MB.");
			return;
		}
		setAttachment(file);
	};

	const handleTyping = () => {
		if (typingTimer.current) clearTimeout(typingTimer.current);
		chatSocket.emitTyping(conversationId, true);
		typingTimer.current = setTimeout(() => {
			chatSocket.emitTyping(conversationId, false);
		}, 1500);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			void handleSend();
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-3">
				{[...Array(4)].map((_, i) => (
					<div
						key={i}
						className="h-12 animate-pulse rounded-lg bg-muted/50"
						style={{ width: `${60 + ((i * 37) % 40)}%` }}
					/>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
				{error.message}
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			{/* header */}
			<div className="flex items-center gap-3 border-b px-5 py-3">
				<span className="relative shrink-0">
					<Avatar className="size-9">
						{other?.avatarUrl ? (
							<AvatarImage
								src={other.avatarUrl}
								alt={other.name || "Avatar"}
							/>
						) : null}
						<AvatarFallback>
							{initials(other?.name, other?.email)}
						</AvatarFallback>
					</Avatar>
					<span
						className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background ${
							otherOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
						}`}
					/>
				</span>
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold">
						{other?.name || other?.email || "Unknown"}
					</p>
					<p className="truncate text-xs text-muted-foreground">
						{otherOnline
							? "Online"
							: conversation?.jobTitle
								? `Re: ${conversation.jobTitle}`
								: "Offline"}
					</p>
				</div>
				{other?.userId && (
					<div className="ml-auto flex items-center gap-2">
						<FollowButton targetUserId={other.userId} />
						<ConversationActions reportedId={other.userId} />
					</div>
				)}
			</div>

			{/* messages */}
			<div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-5 py-4">
				<div ref={listRef} className="mx-auto max-w-3xl space-y-3">
					{messagesData?.hasMore && (
						<div className="flex justify-center">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => void handleLoadOlder()}
								disabled={loadMore.isPending}
							>
								<ChevronUp className="h-4 w-4" /> Load older
							</Button>
						</div>
					)}

					{messages.length === 0 && (
						<p className="py-8 text-center text-sm text-muted-foreground">
							No messages yet. Say hello!
						</p>
					)}

					{messages.map((message: ChatMessage) => {
						const mine = message.senderId === currentUserId;
						return (
							<div
								key={message.id}
								className={`flex ${mine ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
										mine
											? "rounded-br-md bg-primary text-primary-foreground"
											: "rounded-bl-md bg-secondary"
									}`}
								>
									{!mine && message.senderName && (
										<p className="mb-0.5 text-xs font-medium text-muted-foreground">
											{message.senderName}
										</p>
									)}
									<p className="whitespace-pre-wrap break-words">
										{message.body}
									</p>
									{message.attachmentUrl && (
										<a
											href={message.attachmentUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="mt-2 block"
										>
											{message.attachmentType?.startsWith("image/") ? (
												<span className="relative block overflow-hidden rounded-lg">
													{/* eslint-disable-next-line @next/next/no-img-element */}
													<img
														src={message.attachmentUrl}
														alt={message.attachmentName ?? "Attachment"}
														className="max-h-48 w-full rounded-lg object-cover"
													/>
												</span>
											) : (
												<span className="flex items-center gap-2 rounded-lg border border-border/20 bg-background/40 px-3 py-2">
													<FileText className="h-4 w-4 shrink-0" />
													<span className="min-w-0">
														<span className="block truncate text-sm font-medium">
															{message.attachmentName ?? "Attachment"}
														</span>
														{message.attachmentSize != null &&
															message.attachmentSize > 0 && (
																<span className="block text-xs opacity-70">
																	{formatBytes(message.attachmentSize)}
																</span>
															)}
													</span>
												</span>
											)}
										</a>
									)}
									<p
										className={`mt-1 text-right text-[10px] ${
											mine
												? "text-primary-foreground/70"
												: "text-muted-foreground"
										}`}
									>
										{formatMessageTime(message.createdAt)}
									</p>
								</div>
							</div>
						);
					})}

					{isTyping && (
						<div className="flex justify-start">
							<div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-secondary px-4 py-3">
								<span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
								<span
									className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
									style={{ animationDelay: "0.15s" }}
								/>
								<span
									className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
									style={{ animationDelay: "0.3s" }}
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* composer */}
			<div className="border-t px-5 py-3">
				<div className="mx-auto max-w-3xl space-y-2">
					{attachment && (
						<div className="flex items-center gap-2 rounded-lg border border-border/15 bg-muted/40 px-3 py-2">
							{attachment.type.startsWith("image/") ? (
								<ImageIcon className="h-4 w-4 shrink-0" />
							) : (
								<FileText className="h-4 w-4 shrink-0" />
							)}
							<span className="min-w-0 flex-1">
								<span className="block truncate text-sm font-medium">
									{attachment.name}
								</span>
								<span className="block text-xs text-muted-foreground">
									{formatBytes(attachment.size)}
								</span>
							</span>
							{uploadFile.isPending && (
								<span className="text-xs text-muted-foreground">Uploading…</span>
							)}
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-6 w-6 shrink-0"
								onClick={() => setAttachment(null)}
								disabled={uploadFile.isPending}
								aria-label="Remove attachment"
							>
								<X className="h-3.5 w-3.5" />
							</Button>
						</div>
					)}
					<div className="flex items-end gap-2">
						<input
							ref={fileInputRef}
							type="file"
							accept={ACCEPT_TYPES}
							className="hidden"
							onChange={handleFileSelect}
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="h-10 w-10 shrink-0 text-muted-foreground"
							onClick={() => fileInputRef.current?.click()}
							disabled={uploadFile.isPending}
							aria-label="Attach a file"
						>
							<Paperclip className="h-4 w-4" />
						</Button>
						<Textarea
							value={draft}
							onChange={(e) => {
								setDraft(e.target.value);
								handleTyping();
							}}
							onKeyDown={handleKeyDown}
							placeholder="Type a message..."
							className="max-h-32 min-h-10 flex-1 resize-none"
							rows={1}
						/>
						<Button
							onClick={() => void handleSend()}
							disabled={
								(!draft.trim() && !attachment) ||
								sendMessage.isPending ||
								uploadFile.isPending
							}
							className="h-10 w-10 shrink-0"
							size="icon"
						>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
