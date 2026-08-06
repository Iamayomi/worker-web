"use client";

import { useParams } from "next/navigation";
import { ChatShell } from "@/components/chat/chat-shell";
import { MessageThread } from "@/components/chat/message-thread";

export default function ConversationPage() {
	const params = useParams<{ id: string }>();
	return (
		<ChatShell>
			<MessageThread conversationId={params.id} />
		</ChatShell>
	);
}
