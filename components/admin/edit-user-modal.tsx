"use client";

import { useEffect, useState } from "react";
import { useUpdateUser } from "@/lib/hooks/use-users";
import { ROLE_LABELS } from "@/lib/constants/enums";
import { AccountType, UserRole, UserStatus } from "@/types/api/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EDITABLE_ROLES = Object.keys(ROLE_LABELS) as UserRole[];

const STATUS_OPTIONS = [
  { value: UserStatus.ACTIVE, label: "Active" },
  { value: UserStatus.INVITED, label: "Invited" },
  { value: UserStatus.PENDING_VERIFICATION, label: "Pending verification" },
  { value: UserStatus.SUSPENDED, label: "Suspended" },
  { value: UserStatus.BLOCKED, label: "Blocked" },
];

const ACCOUNT_TYPES = [
  { value: AccountType.TALENT, label: "Talent" },
  { value: AccountType.CLIENT, label: "Client" },
  { value: AccountType.ADMIN, label: "Admin" },
];

interface EditUserModalProps {
  user: {
    id: string;
    email: string;
    accountType?: string;
    roles: string[];
    status: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    tempPassword?: boolean;
    termsAccepted?: boolean;
    referralCode?: string;
    invitedBy?: string;
    invitedAt?: string;
    lastLoginAt?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
}

export function EditUserModal({ user, open, onOpenChange }: EditUserModalProps) {
  const updateUser = useUpdateUser();

  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState<AccountType | "">("");
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [status, setStatus] = useState<UserStatus | "">("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [tempPassword, setTempPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [invitedBy, setInvitedBy] = useState("");
  const [invitedAt, setInvitedAt] = useState("");
  const [lastLoginAt, setLastLoginAt] = useState("");

  useEffect(() => {
    if (open && user) {
      setEmail(user.email ?? "");
      setAccountType(
        (user.accountType ?? "") as AccountType | ""
      );
      setRoles((user.roles ?? []) as UserRole[]);
      setStatus((user.status ?? "") as UserStatus | "");
      setEmailVerified(user.emailVerified ?? false);
      setPhoneVerified(user.phoneVerified ?? false);
      setTempPassword(user.tempPassword ?? false);
      setTermsAccepted(user.termsAccepted ?? false);
      setReferralCode(user.referralCode ?? "");
      setInvitedBy(user.invitedBy ?? "");
      setInvitedAt(toDateTimeLocal(user.invitedAt));
      setLastLoginAt(toDateTimeLocal(user.lastLoginAt));
    }
  }, [open, user]);

  const toggleRole = (role: UserRole) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const confirm = () => {
    if (!user) return;
    updateUser.mutate(
      {
        userId: user.id,
        email: email.trim() || undefined,
        accountType: accountType || undefined,
        roles,
        status: status || undefined,
        emailVerified,
        phoneVerified,
        tempPassword,
        termsAccepted,
        referralCode: referralCode.trim() || undefined,
        invitedBy: invitedBy.trim() || undefined,
        invitedAt: invitedAt ? new Date(invitedAt).toISOString() : undefined,
        lastLoginAt: lastLoginAt
          ? new Date(lastLoginAt).toISOString()
          : undefined,
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            Update account details for {user?.email}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Account type</Label>
              <Select
                value={accountType}
                onValueChange={(v) => setAccountType(v as AccountType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as UserStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Roles</Label>
            <div className="grid grid-cols-2 gap-2">
              {EDITABLE_ROLES.map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-2 rounded-md border border-border/15 px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={roles.includes(role)}
                    onCheckedChange={() => toggleRole(role)}
                  />
                  {ROLE_LABELS[role]}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Flags</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Email verified",
                  checked: emailVerified,
                  onChange: setEmailVerified,
                },
                {
                  label: "Phone verified",
                  checked: phoneVerified,
                  onChange: setPhoneVerified,
                },
                {
                  label: "Temp password",
                  checked: tempPassword,
                  onChange: setTempPassword,
                },
                {
                  label: "Terms accepted",
                  checked: termsAccepted,
                  onChange: setTermsAccepted,
                },
              ].map((flag) => (
                <label
                  key={flag.label}
                  className="flex items-center gap-2 rounded-md border border-border/15 px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={flag.checked}
                    onCheckedChange={(checked) =>
                      flag.onChange(Boolean(checked))
                    }
                  />
                  {flag.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-referral">Referral code</Label>
              <Input
                id="edit-referral"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-invited-by">Invited by (user id)</Label>
              <Input
                id="edit-invited-by"
                value={invitedBy}
                onChange={(e) => setInvitedBy(e.target.value)}
                placeholder="Leave empty to clear"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-invited-at">Invited at</Label>
              <Input
                id="edit-invited-at"
                type="datetime-local"
                value={invitedAt}
                onChange={(e) => setInvitedAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-last-login">Last login</Label>
              <Input
                id="edit-last-login"
                type="datetime-local"
                value={lastLoginAt}
                onChange={(e) => setLastLoginAt(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateUser.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={confirm}
            disabled={updateUser.isPending || roles.length === 0}
          >
            {updateUser.isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
