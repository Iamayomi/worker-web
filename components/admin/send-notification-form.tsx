"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, Send, X } from "lucide-react";
import { useSendNotification } from "@/lib/hooks/use-notifications";
import { usePeopleSearch } from "@/lib/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { FormTextarea } from "@/components/ui/form-textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchInput } from "@/components/shared/search-input";
import type { SearchPeopleItem } from "@/lib/types/chat";

const CATEGORY_OPTIONS = [
  { value: "system", label: "System" },
  { value: "auth", label: "Auth" },
  { value: "job", label: "Job" },
  { value: "application", label: "Application" },
  { value: "offer", label: "Offer" },
  { value: "chat", label: "Chat" },
  { value: "follow", label: "Follow" },
] as const;

const TYPE_OPTIONS = [
  { value: "in_app", label: "In-app" },
  { value: "push", label: "Push" },
] as const;

const ACCOUNT_TYPE_OPTIONS = [
  { value: "talent", label: "Talent" },
  { value: "client", label: "Client" },
  { value: "admin", label: "Admin" },
] as const;

type RecipientScope = "people" | "accountType" | "all";

interface RecipientChip {
  userId: string;
  name: string;
  email?: string;
}

function RecipientPicker({
  selected,
  onToggle,
}: {
  selected: RecipientChip[];
  onToggle: (person: RecipientChip) => void;
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isFetching } = usePeopleSearch(debounced);

  const results = useMemo(() => data?.items ?? [], [data]);

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((person) => (
            <span
              key={person.userId}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/20 bg-secondary/60 py-1 pl-2 pr-1 text-xs"
            >
              {person.name}
              <button
                type="button"
                onClick={() => onToggle(person)}
                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label={`Remove ${person.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search people by name, company or email..."
      />
      {debounced.trim().length >= 2 && (
        <div className="max-h-40 overflow-y-auto rounded-lg border border-border/15">
          {isFetching ? (
            <p className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Searching...
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">No people found.</p>
          ) : (
            <ul className="divide-y divide-border/10">
              {results.map((person: SearchPeopleItem) => {
                const isSelected = selected.some((s) => s.userId === person.userId);
                return (
                  <li key={person.userId}>
                    <button
                      type="button"
                      onClick={() =>
                        onToggle({
                          userId: person.userId,
                          name: person.name,
                          email: person.email,
                        })
                      }
                      className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-secondary/60"
                    >
                      <Avatar className="size-7">
                        {person.avatarUrl && (
                          <AvatarImage src={person.avatarUrl} alt={person.name} />
                        )}
                        <AvatarFallback className="text-[10px]">
                          {person.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {person.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {person.email ??
                            (person.accountType === "client" ? "Company" : "Talent")}
                        </span>
                      </span>
                      {isSelected && (
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          Selected
                        </Badge>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function SendNotificationForm() {
  const [scope, setScope] = useState<RecipientScope>("people");
  const [recipients, setRecipients] = useState<RecipientChip[]>([]);
  const [accountType, setAccountType] = useState("talent");
  const [category, setCategory] = useState("system");
  const [type, setType] = useState("in_app");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");

  const send = useSendNotification();

  const toggleRecipient = (person: RecipientChip) => {
    setRecipients((prev) =>
      prev.some((s) => s.userId === person.userId)
        ? prev.filter((s) => s.userId !== person.userId)
        : [...prev, person]
    );
  };

  const canSend =
    title.trim().length > 0 &&
    message.trim().length > 0 &&
    (scope !== "people" || recipients.length > 0);

  const handleSend = async () => {
    if (!canSend) return;
    try {
      const payload = {
        category,
        title: title.trim(),
        message: message.trim(),
        type,
        ...(link.trim() ? { link: link.trim() } : {}),
        ...(scope === "people"
          ? { userIds: recipients.map((r) => r.userId) }
          : scope === "accountType"
            ? { accountType }
            : { all: true }),
      };
      const result = await send.mutateAsync(payload);
      toast.success(
        `Notification sent to ${result?.recipientCount ?? 0} recipient(s).`
      );
      setTitle("");
      setMessage("");
      setLink("");
      setRecipients([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send notification");
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/15 p-5">
      <div>
        <h2 className="text-base font-semibold">Send a notification</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Recipients who have disabled this category&apos;s in-app channel will be
          skipped.
        </p>
      </div>

      <FormSelect
        label="Recipients"
        value={scope}
        onValueChange={(v) => setScope(v as RecipientScope)}
        options={[
          { value: "people", label: "Specific people" },
          { value: "accountType", label: "Everyone by account type" },
          { value: "all", label: "All active users" },
        ]}
      />

      {scope === "people" && (
        <RecipientPicker selected={recipients} onToggle={toggleRecipient} />
      )}

      {scope === "accountType" && (
        <FormSelect
          label="Account type"
          value={accountType}
          onValueChange={setAccountType}
          options={ACCOUNT_TYPE_OPTIONS}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <FormSelect
          label="Category"
          value={category}
          onValueChange={setCategory}
          options={CATEGORY_OPTIONS}
        />
        <FormSelect
          label="Type"
          value={type}
          onValueChange={setType}
          options={TYPE_OPTIONS}
        />
      </div>

      <FormInput
        label="Title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={255}
        placeholder="e.g. New feature announcement"
      />

      <FormTextarea
        label="Message"
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        placeholder="Write your notification message..."
      />

      <FormInput
        label="Link (optional)"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="/dashboard"
      />

      <Button
        type="button"
        onClick={() => void handleSend()}
        disabled={!canSend || send.isPending}
        className="w-full"
      >
        {send.isPending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Send notification
      </Button>
    </div>
  );
}
