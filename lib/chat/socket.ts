import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_WORKER_API_URL?.replace(/\/api\/v1\/?$/, "") ||
	"http://localhost:3001";

function readToken(): string | null {
	if (typeof window === "undefined") return null;
	const remember = window.localStorage.getItem("worker_remember") === "true";
	const store = remember ? window.localStorage : window.sessionStorage;
	const stored = store.getItem("worker_access_token");
	if (stored) return stored;
	return useAuthStore.getState().tokens?.access_token ?? null;
}

type ChatSocketHandler = (data: unknown) => void;

export class ChatSocketClient {
	private socket: Socket | null = null;
	private handlers = new Map<string, Set<ChatSocketHandler>>();

	connect(): Socket {
		if (this.socket?.connected) return this.socket;

		const token = readToken();
		this.socket = io(`${API_BASE_URL}/chat`, {
			auth: { token },
			transports: ["websocket"],
		});

		this.socket.on("connect", () => {
			this.dispatch("connect", undefined);
		});
		this.socket.on("disconnect", (reason) => {
			this.dispatch("disconnect", reason);
		});
		this.socket.on("connect_error", (err) => {
			this.dispatch("error", err);
		});

		for (const event of ["chat.message", "chat.typing", "chat.read"] as const) {
			this.socket.on(event, (payload) => {
				this.dispatch(event, payload);
			});
		}

		return this.socket;
	}

	joinConversation(conversationId: string): void {
		this.socket?.emit("join", { conversationId });
	}

	leaveConversation(conversationId: string): void {
		this.socket?.emit("leave", { conversationId });
	}

	emitTyping(conversationId: string, isTyping: boolean): void {
		this.socket?.emit("typing", { conversationId, isTyping });
	}

	on<T = unknown>(event: string, handler: (data: T) => void): () => void {
		if (!this.handlers.has(event)) this.handlers.set(event, new Set());
		const wrapped: ChatSocketHandler = (data) => handler(data as T);
		this.handlers.get(event)!.add(wrapped);
		return () => {
			this.handlers.get(event)?.delete(wrapped);
		};
	}

	disconnect(): void {
		this.socket?.disconnect();
		this.socket = null;
	}

	private dispatch(event: string, data: unknown): void {
		this.handlers.get(event)?.forEach((handler) => handler(data));
	}
}

export const chatSocket = new ChatSocketClient();
