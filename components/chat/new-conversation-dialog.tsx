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
import { useIsOnline } from "@/lib/hooks/use-presence";
import { useAuth } from "@/lib/auth/auth-context";
import type { SearchPeopleItem } from "@/lib/types/chat";

const ADMIN_ROLES = ["super_admin", "admin"];

function isAdminUser(user?: { roles?: string[] } | null): boolean {
	return (user?.roles ?? []).some((role) => ADMIN_ROLES.includes(role));
}

function initials(name?: string): string {
	const source = name || "?";
	return source
		.split(" ")
		.map((part) => part[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

function PresenceDot({ userId }: { userId: string }) {
	const online = useIsOnline(userId);
	return (
		<span
			className={`size-2.5 shrink-0 rounded-full ${
				online ? "bg-emerald-500" : "bg-muted-foreground/40"
			}`}
			title={online ? "Online" : "Offline"}
		/>
	);
}

export function NewConversationDialog() {
	const router = useRouter();
	const { user } = useAuth();
	const isAdmin = isAdminUser(user);
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
						{isAdmin
							? "Search by name, company or email. You can message anyone on the platform."
							: "Search by name or company. You'll only see people you can start a conversation with."}
					</DialogDescription>
				</DialogHeader>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder={isAdmin ? "Search name, company or email..." : "Search people..."}
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
										<span className="relative shrink-0">
											<Avatar className="size-9">
												{person.avatarUrl && (
													<AvatarImage
														src={person.avatarUrl}
														alt={person.name}
													/>
												)}
												<AvatarFallback>
													{initials(person.name)}
												</AvatarFallback>
											</Avatar>
											<span className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background">
												<PresenceDot userId={person.userId} />
											</span>
										</span>
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm font-medium">
												{person.name}
											</span>
											<span className="block truncate text-xs text-muted-foreground">
												{person.email ??
													(person.accountType === "client"
														? "Company"
														: "Talent")}
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
