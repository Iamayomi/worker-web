"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useChatUnreadCount } from "@/lib/hooks/use-chat";

export function ChatFab() {
	const pathname = usePathname();
	const { data } = useChatUnreadCount();
	const unread = data?.total ?? 0;

	if (pathname.startsWith("/messages")) return null;

	return (
		<Link
			href="/messages"
			aria-label="Messages"
			className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
		>
			<MessageCircle className="size-6" />
			{unread > 0 && (
				<span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-white">
					{unread > 99 ? "99+" : unread}
				</span>
			)}
		</Link>
	);
}
