"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle, MessageCirclePlus, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	useCreateConversation,
	usePeopleSearch,
} from "@/lib/hooks/use-chat";
import type { SearchPeopleItem } from "@/lib/types/chat";

function initials(name?: string, email?: string): string {
	const source = name || email || "?";
	return source
		.split(" ")
		.map((part) => part[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

export function NewConversationDialog() {
	const router = useRouter();
	const createConversation = useCreateConversation();
	const [query, setQuery] = useState("");
	const [debounced, setDebounced] = useState("");
	const [startingId, setStartingId] = useState<string | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(query), 300);
		return () => clearTimeout(timer);
	}, [query]);

	const { data, isFetching, error } = usePeopleSearch(debounced);

	const startChat = async (person: SearchPeopleItem) => {
		if (startingId) return;
		setStartingId(person.userId);
		try {
			const result = await createConversation.mutateAsync({
				participantIds: [person.userId],
			});
			if (result?.id) {
				router.push(`/messages/${result.id}`);
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to start chat");
			setStartingId(null);
		}
	};

	const showEmpty =
		debounced.trim().length < 2 ||
		(!isFetching && !error && (data?.items.length ?? 0) === 0);

	return (
		<Dialog
			onOpenChange={(open) => {
				if (!open) {
					setQuery("");
					setDebounced("");
				}
			}}
		>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<MessageCirclePlus className="h-4 w-4" /> New conversation
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Find someone to message</DialogTitle>
					<DialogDescription>
						Search by name, company or email. You&apos;ll only see people you
						can start a conversation with.
					</DialogDescription>
				</DialogHeader>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search people..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="pl-9"
						autoFocus
					/>
				</div>

				<div className="max-h-80 min-h-24 overflow-y-auto">
					{isFetching ? (
						<div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
							<LoaderCircle className="h-4 w-4 animate-spin" />
							Searching...
						</div>
					) : error ? (
						<p className="py-6 text-center text-sm text-destructive">
							{error instanceof Error ? error.message : "Search failed"}
						</p>
					) : showEmpty ? (
						<p className="py-6 text-center text-sm text-muted-foreground">
							{debounced.trim().length < 2
								? "Type at least 2 characters to search."
								: "No people found."}
						</p>
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
										<Avatar className="size-9">
											{person.avatarUrl && (
												<AvatarImage
													src={person.avatarUrl}
													alt={person.name}
												/>
											)}
											<AvatarFallback>
												{initials(person.name, person.email)}
											</AvatarFallback>
										</Avatar>
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm font-medium">
												{person.name}
											</span>
											<span className="block truncate text-xs text-muted-foreground">
												{person.email}
											</span>
										</span>
										{startingId === person.userId ? (
											<LoaderCircle className="h-4 w-4 animate-spin" />
										) : (
											<UserRound className="h-4 w-4 text-muted-foreground" />
										)}
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
