"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useInviteUser } from "@/lib/hooks/use-users";
import {
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPE_ROLES,
  ROLE_LABELS,
  getInviteableAccountTypes,
  getInviteableRoles,
} from "@/lib/constants/enums";
import type { AccountType, UserRole } from "@/types/api/auth";
import { Button } from "@/components/ui/button";
import { Mail, ShieldCheck } from "lucide-react";
import { AnimatedContent } from "@/components/shared/animated-content";

export default function InvitePage() {
  const { user } = useAuth();
  const invite = useInviteUser();

  const myRoles = useMemo(() => (user?.roles ?? []) as UserRole[], [user]);
  const allowedRoles = useMemo(() => getInviteableRoles(myRoles), [myRoles]);
  const allowedAccountTypes = useMemo(
    () => getInviteableAccountTypes(myRoles),
    [myRoles]
  );

  const [email, setEmail] = useState("");
  const [lastInvited, setLastInvited] = useState("");
  const [accountType, setAccountType] = useState<AccountType | "">("");
  const [role, setRole] = useState<UserRole | "">("");

  const roleOptions = useMemo(() => {
    if (!accountType) return [];
    return ACCOUNT_TYPE_ROLES[accountType].filter((r) =>
      allowedRoles.includes(r)
    );
  }, [accountType, allowedRoles]);

  const canInvite = allowedAccountTypes.length > 0;

  function selectAccountType(value: AccountType) {
    setAccountType(value);
    const firstRole = ACCOUNT_TYPE_ROLES[value].find((r) =>
      allowedRoles.includes(r)
    );
    setRole(firstRole ?? "");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accountType || !role || !email.trim()) return;
    await invite.mutateAsync(
      { email: email.trim(), account_type: accountType, roles: [role] },
      {
        onSuccess: () => {
          setLastInvited(email.trim());
          setEmail("");
        },
      }
    );
  }

  if (!canInvite) {
    return (
      <AnimatedContent>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Your role does not allow inviting users.
          </div>
        </div>
      </AnimatedContent>
    );
  }

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invite a user</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Send an invitation email so they can join and set up their account.
          </p>
        </div>

        {invite.isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {invite.error instanceof Error
              ? invite.error.message
              : "Failed to send invite"}
          </div>
        )}
        {invite.isSuccess && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-600">
            Invitation sent to {lastInvited}.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-border/15 p-5"
        >
          <div>
            <label
              htmlFor="invite-email"
              className="mb-1 block text-sm font-medium"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="block w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="invite-account-type"
              className="mb-1 block text-sm font-medium"
            >
              Account type
            </label>
            <select
              id="invite-account-type"
              value={accountType}
              onChange={(e) => selectAccountType(e.target.value as AccountType)}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select account type</option>
              {allowedAccountTypes.map((type) => (
                <option key={type} value={type}>
                  {ACCOUNT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="invite-role"
              className="mb-1 block text-sm font-medium"
            >
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              disabled={!accountType}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="">
                {accountType ? "Select role" : "Select account type first"}
              </option>
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            disabled={
              invite.isPending || !email.trim() || !accountType || !role
            }
          >
            <ShieldCheck className="h-4 w-4" />
            {invite.isPending ? "Sending..." : "Send invite"}
          </Button>
        </form>
      </div>
    </AnimatedContent>
  );
}
