import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import { queryKeys } from "@/lib/api/query-keys";
import { chatSocket } from "@/lib/chat/socket";
import type {
  ChatAttachment,
  ChatConversation,
  ChatConversationsData,
  ChatMessage,
  ChatMessagesData,
  ChatUnreadCount,
  CreateConversationInput,
  SearchPeopleData,
  SendMessageInput,
} from "@/lib/types/chat";

export function useConversations() {
	return useQuery({
		queryKey: queryKeys.chat.conversations({}),
		queryFn: async () => {
			const res = await worker.auth.get<ChatConversationsData>(
				"/chat/conversations",
			);
			if (!res.success)
				throw new Error(res.message || "Failed to load conversations");
			return res.data ?? { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
		},
	});
}

export function useConversation(id: string) {
	return useQuery({
		queryKey: queryKeys.chat.conversation(id),
		queryFn: async () => {
			const res = await worker.auth.get<ChatConversation>(
				`/chat/conversations/${id}`,
			);
			if (!res.success)
				throw new Error(res.message || "Failed to load conversation");
			return res.data;
		},
		enabled: !!id,
	});
}

export function useMessages(conversationId: string) {
	return useQuery({
		queryKey: queryKeys.chat.messages(conversationId),
		queryFn: async () => {
			const res = await worker.auth.get<ChatMessagesData>(
				`/chat/conversations/${conversationId}/messages`,
			);
			if (!res.success)
				throw new Error(res.message || "Failed to load messages");
			return (
				res.data ?? {
					items: [],
					hasMore: false,
				}
			);
		},
		enabled: !!conversationId,
	});
}

export function useLoadMoreMessages(conversationId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (beforeId: string) => {
			const res = await worker.auth.get<ChatMessagesData>(
				`/chat/conversations/${conversationId}/messages?beforeId=${beforeId}`,
			);
			if (!res.success)
				throw new Error(res.message || "Failed to load older messages");
			return (
				res.data ?? {
					items: [],
					hasMore: false,
				}
			);
		},
		onSuccess: (older) => {
			const key = queryKeys.chat.messages(conversationId);
			const current = qc.getQueryData<ChatMessagesData>(key);
			const existingIds = new Set(
				(current?.items ?? []).map((m) => m.id),
			);
			const merged = [...(older.items ?? []).filter((m) => !existingIds.has(m.id)), ...(current?.items ?? [])];
			qc.setQueryData<ChatMessagesData>(key, {
				items: merged,
				hasMore: older.hasMore,
				nextCursor: older.nextCursor,
			});
		},
	});
}

export function useSendMessage(conversationId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input: SendMessageInput) => {
			const res = await worker.auth.post<ChatMessage>(
				`/chat/conversations/${conversationId}/messages`,
				input,
			);
			if (!res.success)
				throw new Error(res.message || "Failed to send message");
			return res.data;
		},
		onSuccess: (message) => {
			if (!message) return;
			appendMessageToCache(qc, conversationId, message);
			qc.invalidateQueries({ queryKey: queryKeys.chat.conversations({}) });
			qc.invalidateQueries({ queryKey: queryKeys.chat.unreadCount() });
		},
	});
}

export function useUploadChatFile() {
	return useMutation({
		mutationFn: async (file: File) => {
			const formData = new FormData();
			formData.append("file", file);
			const res = await worker.auth.upload<ChatAttachment>(
				"/upload/chat",
				formData,
			);
			if (!res.success)
				throw new Error(res.message || "Failed to upload file");
			return res.data;
		},
	});
}

export function useMarkConversationRead(conversationId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			const res = await worker.auth.patch(
				`/chat/conversations/${conversationId}/read`,
			);
			if (!res.success) throw new Error(res.message || "Failed to mark as read");
		},
		onSuccess: () => {
			const conversationsKey = queryKeys.chat.conversations({});
			const conversations = qc.getQueryData<ChatConversationsData>(conversationsKey);
			if (conversations) {
				qc.setQueryData<ChatConversationsData>(conversationsKey, {
					...conversations,
					items: conversations.items.map((item) =>
						item.id === conversationId ? { ...item, unreadCount: 0 } : item,
					),
				});
			}
			qc.invalidateQueries({ queryKey: queryKeys.chat.unreadCount() });
		},
	});
}

export function useCreateConversation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input: CreateConversationInput) => {
			const res = await worker.auth.post<ChatConversation>(
				"/chat/conversations",
				input,
			);
			if (!res.success)
				throw new Error(res.message || "Failed to create conversation");
			return res.data;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.chat.conversations({}) });
		},
	});
}

export function usePeopleSearch(query: string) {
	const trimmed = query.trim();
	return useQuery({
		queryKey: ["chat", "people-search", trimmed],
		enabled: trimmed.length >= 2,
		retry: false,
		queryFn: async () => {
			const res = await worker.auth.get<SearchPeopleData>(
				`/chat/people/search?q=${encodeURIComponent(trimmed)}`,
			);
			if (!res.success)
				throw new Error(res.message || "Failed to search people");
			return res.data ?? { items: [] };
		},
	});
}

export function useChatUnreadCount() {
	return useQuery({
		queryKey: queryKeys.chat.unreadCount(),
		queryFn: async () => {
			const res = await worker.auth.get<ChatUnreadCount>(
				"/chat/conversations/unread-count",
			);
			if (!res.success) return { total: 0 };
			return res.data ?? { total: 0 };
		},
		refetchInterval: 30_000,
	});
}

export function useChatRealtime(conversationId: string) {
	const qc = useQueryClient();
	const [isTyping, setIsTyping] = useState(false);
	const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!conversationId) return;
		const socket = chatSocket.connect();
		socket.emit("join", { conversationId });

		const offMessage = chatSocket.on(
			"chat.message",
			(payload: ChatMessage & { _touchConversation?: boolean }) => {
				if (payload?.conversationId !== conversationId) return;
				appendMessageToCache(qc, conversationId, payload);
				qc.invalidateQueries({ queryKey: queryKeys.chat.conversations({}) });
				qc.invalidateQueries({ queryKey: queryKeys.chat.unreadCount() });
			},
		);

		const offTyping = chatSocket.on(
			"chat.typing",
			(payload: { conversationId?: string; isTyping?: boolean }) => {
				if (payload?.conversationId !== conversationId) return;
				if (payload.isTyping) {
					setIsTyping(true);
					if (typingTimer.current) clearTimeout(typingTimer.current);
					typingTimer.current = setTimeout(() => setIsTyping(false), 4000);
				} else {
					setIsTyping(false);
				}
			},
		);

		const offRead = chatSocket.on(
			"chat.read",
			(payload: { conversationId?: string }) => {
				if (payload?.conversationId !== conversationId) return;
				qc.invalidateQueries({ queryKey: queryKeys.chat.unreadCount() });
				qc.invalidateQueries({ queryKey: queryKeys.chat.conversations({}) });
			},
		);

		return () => {
			socket.emit("leave", { conversationId });
			offMessage();
			offTyping();
			offRead();
			if (typingTimer.current) clearTimeout(typingTimer.current);
		};
	}, [conversationId, qc]);

	return { isTyping };
}

function appendMessageToCache(
	qc: ReturnType<typeof useQueryClient>,
	conversationId: string,
	message: ChatMessage,
) {
	const key = queryKeys.chat.messages(conversationId);
	const current = qc.getQueryData<ChatMessagesData>(key);
	if (!current) {
		qc.setQueryData<ChatMessagesData>(key, {
			items: [message],
			hasMore: false,
		});
		return;
	}
	if (current.items.some((m) => m.id === message.id)) return;
	qc.setQueryData<ChatMessagesData>(key, {
		...current,
		items: [...current.items, message],
	});
}
