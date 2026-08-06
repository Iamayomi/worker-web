"use client";

import { usePathname } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { ConversationList } from "@/components/chat/conversation-list";
import { NewConversationDialog } from "@/components/chat/new-conversation-dialog";
import { useConversations } from "@/lib/hooks/use-chat";

export function ChatShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isThreadPage = pathname !== "/messages";
	const { data, isLoading, error } = useConversations();

	return (
		<div className="mx-auto flex h-[calc(100dvh-8.5rem)] max-w-6xl gap-4 overflow-hidden">
			<aside
				className={`w-full overflow-y-auto rounded-lg border border-border/10 bg-card/40 md:w-80 md:shrink-0 ${
					isThreadPage ? "hidden md:block" : "block"
				}`}
			>
				<ConversationList
					items={data?.items ?? []}
					isLoading={isLoading}
					error={error as Error | null}
					action={<NewConversationDialog />}
				/>
			</aside>

			<section
				className={`min-w-0 flex-1 overflow-hidden rounded-lg border border-border/10 bg-card/40 ${
					isThreadPage ? "block" : "hidden md:block"
				}`}
			>
				{isThreadPage ? (
					children
				) : (
					<div className="flex h-full items-center justify-center text-muted-foreground">
						<div className="flex flex-col items-center gap-2 py-12 text-center">
							<MessagesSquare className="h-8 w-8" />
							<p className="text-sm">Select a conversation to start messaging</p>
						</div>
					</div>
				)}
			</section>
		</div>
	);
}
