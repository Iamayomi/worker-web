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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { ShieldCheck } from "lucide-react";

export function InviteUserForm() {
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

 return (
 <div>
 {invite.isError && (
 <div className="mb-4 border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
 {invite.error instanceof Error
 ? invite.error.message
 : "Failed to send invite"}
 </div>
 )}
 {invite.isSuccess && (
 <div className="mb-4 border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-600">
 Invitation sent to {lastInvited}.
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="space-y-1.5">
 <Label htmlFor="invite-email">
 Email address<span className="text-foreground"> *</span>
 </Label>
 <div className="relative">
 <Input
 id="invite-email"
 type="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="colleague@company.com"
 />
 </div>
 </div>

 <div className="space-y-1.5">
 <Label>
 Account type<span className="text-foreground"> *</span>
 </Label>
 <Select
 value={accountType || undefined}
 onValueChange={(value) => selectAccountType(value as AccountType)}
 >
 <SelectTrigger className="w-full">
 <SelectValue placeholder="Select account type" />
 </SelectTrigger>
 <SelectContent>
 {allowedAccountTypes.map((type) => (
 <SelectItem key={type} value={type}>
 {ACCOUNT_TYPE_LABELS[type]}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5">
 <Label>
 Role<span className="text-foreground"> *</span>
 </Label>
 <Select
 value={role || undefined}
 onValueChange={(value) => setRole(value as UserRole)}
 disabled={!accountType}
 >
 <SelectTrigger className="w-full">
 <SelectValue
 placeholder={accountType ? "Select role" : "Select account type first"}
 />
 </SelectTrigger>
 <SelectContent>
 {roleOptions.map((r) => (
 <SelectItem key={r} value={r}>
 {ROLE_LABELS[r]}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <Button
 type="submit"
 disabled={invite.isPending || !email.trim() || !accountType || !role}
 >
 <ShieldCheck className="h-4 w-4" />
 {invite.isPending ? "Sending..." : "Send invite"}
 </Button>
 </form>
 </div>
 );
}
