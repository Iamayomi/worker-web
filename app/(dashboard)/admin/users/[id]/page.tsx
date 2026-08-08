"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useGetUser,
  useSuspendUser,
  useActivateUser,
  useDeleteUser,
} from "@/lib/hooks/use-users";
import { useCreateConversation } from "@/lib/hooks/use-chat";
import { useFollowStatus } from "@/lib/hooks/use-follows";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { useTalentProfileByUserId } from "@/lib/hooks/use-profiles";
import { ACCOUNT_TYPE_LABELS, ROLE_LABELS } from "@/lib/constants/enums";
import type { UserRole } from "@/types/api/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteModal } from "@/components/ui/delete-modal";
import { EditUserModal } from "@/components/admin/edit-user-modal";
import { AnimatedContent } from "@/components/shared/animated-content";
import { SectionSkeleton } from "@/components/shared/skeletons";
import { FollowButton } from "@/components/shared/follow-button";
import {
  CertificationList,
  EducationList,
  WorkExperienceList,
} from "@/components/profile/talent-entry-list";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Ban,
  CheckCircle2,
  LoaderCircle,
  Mail,
  MessageCircle,
  Shield,
  Trash2,
  User,
  UserCog,
  Users,
  UserRound,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  invited: "bg-yellow-500/10 text-yellow-600",
  active: "bg-green-500/10 text-green-600",
  pending_verification: "bg-blue-500/10 text-blue-600",
  suspended: "bg-red-500/10 text-red-600",
  blocked: "bg-red-500/10 text-red-600",
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const isSuperAdmin = useMemo(
    () => (currentUser?.roles ?? []).includes("super_admin"),
    [currentUser]
  );
  const isAdmin = useMemo(
    () =>
      (currentUser?.roles ?? []).includes("super_admin") ||
      (currentUser?.roles ?? []).includes("admin"),
    [currentUser]
  );

  const { data: user, isLoading, isError, error } = useGetUser(id);
  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();
  const deleteUser = useDeleteUser();
  const createConversation = useCreateConversation();
  const { data: followStatus } = useFollowStatus(id);

  const isTalent = useMemo(
    () =>
      user?.accountType === "talent" ||
      (user?.roles ?? []).includes("talent" as UserRole),
    [user]
  );
  const { data: talentProfile } = useTalentProfileByUserId(id, isTalent);

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [messaging, setMessaging] = useState(false);

  usePageTitle(user?.email);

  const isSuspended = user?.status === "suspended";

  const confirmSuspend = () => {
    if (!user) return;
    suspendUser.mutate(
      { userId: user.id, reason: reason.trim() || undefined },
      { onSuccess: () => setSuspendOpen(false) }
    );
  };

  const handleMessage = async () => {
    if (!user) return;
    setMessaging(true);
    try {
      const result = await createConversation.mutateAsync({
        participantIds: [user.id],
      });
      if (result?.id) {
        router.push(`/messages/${result.id}`);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to open conversation"
      );
    } finally {
      setMessaging(false);
    }
  };

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-3xl space-y-6">
        {isLoading ? (
          <SectionSkeleton className="py-10" />
        ) : isError || !user ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load user"}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                  {user.email}
                  <Badge className={STATUS_STYLES[user.status] ?? undefined}>
                    {user.status.replace(/_/g, " ")}
                  </Badge>
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isAdmin && (
                  <>
                    <FollowButton targetUserId={user.id} />
                    <Button
                      variant="outline"
                      onClick={() => void handleMessage()}
                      disabled={messaging || createConversation.isPending}
                    >
                      {messaging ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <MessageCircle className="h-4 w-4" />
                      )}
                      Message
                    </Button>
                  </>
                )}
                {isSuperAdmin && (
                  <>
                    <Button variant="outline" onClick={() => setEditOpen(true)}>
                      <UserCog className="h-4 w-4" /> Edit
                    </Button>
                    {isSuspended ? (
                      <Button
                        variant="outline"
                        disabled={activateUser.isPending}
                        onClick={() => activateUser.mutate(user.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Activate
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        disabled={suspendUser.isPending}
                        onClick={() => setSuspendOpen(true)}
                      >
                        <Ban className="h-4 w-4" /> Suspend
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      disabled={deleteUser.isPending}
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" /> Delete
                    </Button>
                  </>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-lg border border-border/15 px-5 py-3">
                <Link
                  href={`/admin/users/${id}/followers`}
                  className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">
                    {followStatus?.followerCount ?? 0}
                  </span>
                  <span className="text-muted-foreground">followers</span>
                </Link>
                <Link
                  href={`/admin/users/${id}/following`}
                  className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
                >
                  <UserRound className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">
                    {followStatus?.followingCount ?? 0}
                  </span>
                  <span className="text-muted-foreground">following</span>
                </Link>
              </div>
            )}

            <div className="rounded-lg border border-border/15">
              <div className="border-b border-border/15 px-5 py-3 font-semibold">
                Account details
              </div>
              <div className="divide-y divide-border/10 px-5">
                <InfoRow
                  label="Email"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> {user.email}
                    </span>
                  }
                />
                <InfoRow
                  label="Account type"
                  value={
                    ACCOUNT_TYPE_LABELS[
                      user.accountType as keyof typeof ACCOUNT_TYPE_LABELS
                    ] ?? user.accountType
                  }
                />
                <InfoRow
                  label="Roles"
                  value={
                    <span className="inline-flex flex-wrap justify-end gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {ROLE_LABELS[role as UserRole] ?? role}
                        </Badge>
                      ))}
                    </span>
                  }
                />
                <InfoRow
                  label="Email verified"
                  value={user.emailVerified ? "Yes" : "No"}
                />
                <InfoRow
                  label="Phone verified"
                  value={user.phoneVerified ? "Yes" : "No"}
                />
                <InfoRow
                  label="Temp password"
                  value={user.tempPassword ? "Yes" : "No"}
                />
                <InfoRow
                  label="Referral code"
                  value={user.referralCode ?? "—"}
                />
              </div>
            </div>

            {isTalent && talentProfile && (
              <div className="space-y-6">
                <WorkExperienceList
                  talentProfileId={talentProfile.id}
                  admin={isAdmin}
                  editable={isAdmin}
                />
                <EducationList
                  talentProfileId={talentProfile.id}
                  admin={isAdmin}
                  editable={isAdmin}
                />
                <CertificationList
                  talentProfileId={talentProfile.id}
                  admin={isAdmin}
                  editable={isAdmin}
                />
              </div>
            )}

            <div className="rounded-lg border border-border/15">
              <div className="border-b border-border/15 px-5 py-3 font-semibold">
                Activity
              </div>
              <div className="divide-y divide-border/10 px-5">
                <InfoRow
                  label="Invited by"
                  value={
                    user.invitedBy ? (
                      <span className="inline-flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" /> {user.invitedBy}
                      </span>
                    ) : (
                      "—"
                    )
                  }
                />
                <InfoRow label="Invited at" value={formatDate(user.invitedAt)} />
                <InfoRow
                  label="Last login"
                  value={formatDateTime(user.lastLoginAt)}
                />
                <InfoRow label="Created" value={formatDateTime(user.createdAt)} />
                <InfoRow label="Updated" value={formatDateTime(user.updatedAt)} />
              </div>
            </div>

            {isSuperAdmin && (
              <div className="flex items-center gap-2 rounded-lg border border-border/15 px-4 py-3 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 shrink-0" />
                Super admins can suspend, activate or delete this account.
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend {user?.email}</DialogTitle>
            <DialogDescription>
              The user will lose access until the account is reactivated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="suspend-reason">Reason (optional)</Label>
            <Input
              id="suspend-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Violation of terms of service"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSuspendOpen(false)}
              disabled={suspendUser.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmSuspend}
              disabled={suspendUser.isPending}
            >
              <Ban className="h-4 w-4" /> Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          if (!user) return;
          deleteUser.mutate(user.id, { onSuccess: () => setDeleteOpen(false) });
        }}
        title="Delete user?"
        description={`This will permanently remove ${user?.email ?? "this user"}'s access. This action cannot be undone.`}
        isLoading={deleteUser.isPending}
      />

      {user && (
        <EditUserModal
          user={user}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </AnimatedContent>
  );
}
