"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ExternalLink,
  Eye,
  FileText,
  MapPin,
  Pencil,
  Share2,
  UserRound,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useClientProfile,
  useTalentProfile,
  type TalentProfileData,
} from "@/lib/hooks/use-profiles";
import { useFollowStatus } from "@/lib/hooks/use-follows";
import { useTalentAnalytics } from "@/lib/hooks/use-analytics";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { AccountType, UserRole } from "@/types/api/auth";
import {
  ACCOUNT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  ROLE_LABELS,
  WORK_PREFERENCES,
} from "@/lib/constants/enums";
import type { UserData } from "@/lib/auth/types";
import { toast } from "sonner";
import { AnimatedContent } from "@/components/shared/animated-content";
import { SectionCard } from "@/components/shared/section-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TalentAnalyticsView, ClientAnalyticsView } from "@/components/analytics/analytics-views";
import {
  CertificationList,
  EducationList,
  WorkExperienceList,
} from "@/components/profile/talent-entry-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function optionLabel(
  options: readonly { value: string; label: string }[],
  value?: string
) {
  return options.find((o) => o.value === value)?.label ?? value;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm sm:col-span-2">{children || "—"}</dd>
    </div>
  );
}

function EditProfileButton() {
  return (
    <Link href="/profile/edit">
      <Button variant="outline">
        <Pencil className="h-4 w-4" />
        Edit profile
      </Button>
    </Link>
  );
}

function AdminProfileView({ user }: { user: UserData }) {
  const roles = ((user.roles ?? []) as UserRole[]).filter(
    (role) => role !== UserRole.USER
  );
  const { data: followStatus } = useFollowStatus(user.id);
  const roleLabel =
    roles.length > 0
      ? roles.map((role) => ROLE_LABELS[role] ?? role).join(", ")
      : user.accountType;
  const accountTypeLabel =
    ACCOUNT_TYPE_LABELS[user.accountType as AccountType] ?? user.accountType;
  const displayName =
    user.email.split("@")[0].replace(/[._-]/g, " ").trim() || "Admin";
  const initials = user.email.slice(0, 2).toUpperCase();
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
  const followerCount = followStatus?.followerCount ?? 0;
  const followingCount = followStatus?.followingCount ?? 0;

  return (
    <>
      <div className="rounded-2xl border border-border/15 bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar className="size-16">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight capitalize">
                {displayName}
              </h1>
              <p className="mt-1 text-sm font-medium capitalize text-primary">
                {roleLabel}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                {accountTypeLabel} account
              </p>
            </div>
          </div>
          <EditProfileButton />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/10 pt-4">
          <Link
            href="/profile/followers"
            className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
          >
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{followerCount}</span>
            <span className="text-muted-foreground">
              {followerCount === 1 ? "follower" : "followers"}
            </span>
          </Link>
          <Link
            href="/profile/following"
            className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
          >
            <UserRound className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{followingCount}</span>
            <span className="text-muted-foreground">following</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Member since {memberSince}
            </span>
          </div>
        </div>
      </div>

      <SectionCard title="Account details">
        <dl className="divide-y divide-border/15">
          <DetailRow label="Email">{user.email}</DetailRow>
          {user.lastLoginAt && (
            <DetailRow label="Last login">
              {new Date(user.lastLoginAt).toLocaleString()}
            </DetailRow>
          )}
        </dl>
      </SectionCard>
    </>
  );
}

function TalentProfileView({ profile }: { profile: TalentProfileData }) {
  const { data: followStatus } = useFollowStatus(profile.userId);
  const { data: analytics } = useTalentAnalytics();

  const displayName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ") || "Your name";
  const location = [profile.country, profile.stateOfResidence]
    .filter(Boolean)
    .join(", ");
  const followerCount = followStatus?.followerCount ?? 0;
  const followingCount = followStatus?.followingCount ?? 0;
  const profileViews = analytics?.profile_views ?? 0;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/talent/${profile.id}`
      );
      toast.success("Profile link copied");
    } catch {
      toast.error("Could not copy profile link");
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-border/15 bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar className="size-16">
              {profile.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="text-lg font-semibold">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {displayName}
              </h1>
              {profile.professionalTitle && (
                <p className="mt-1 text-sm font-medium text-primary">
                  {profile.professionalTitle}
                </p>
              )}
              {location && (
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {location}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share profile
            </Button>
            <EditProfileButton />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/10 pt-4">
          <Link
            href="/profile/followers"
            className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
          >
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{followerCount}</span>
            <span className="text-muted-foreground">
              {followerCount === 1 ? "follower" : "followers"}
            </span>
          </Link>
          <Link
            href="/profile/following"
            className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
          >
            <UserRound className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{followingCount}</span>
            <span className="text-muted-foreground">following</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{profileViews}</span>
            <span className="text-muted-foreground">
              {profileViews === 1 ? "profile view" : "profile views"}
            </span>
          </div>
        </div>
      </div>

      {profile.bio && (
        <SectionCard title="About">
          <p className="text-sm leading-relaxed">{profile.bio}</p>
        </SectionCard>
      )}

      <SectionCard title="Skills">
        {profile.skills && profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No skills listed.</p>
        )}
      </SectionCard>

      <SectionCard title="Experience">
        <dl className="divide-y divide-border/15">
          <DetailRow label="Years of experience">
            {profile.yearsOfExperience != null
              ? `${profile.yearsOfExperience}`
              : null}
          </DetailRow>
          <DetailRow label="Employment type">
            {optionLabel(EMPLOYMENT_TYPES, profile.employmentType)}
          </DetailRow>
          <DetailRow label="Work preference">
            {optionLabel(WORK_PREFERENCES, profile.workPreference)}
          </DetailRow>
        </dl>
      </SectionCard>

      <WorkExperienceList />
      <EducationList />
      <CertificationList />

      <SectionCard title="Links">
        <dl className="divide-y divide-border/15">
          <DetailRow label="CV / Résumé">
            {profile.resumeUrl ? (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                View CV
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </DetailRow>
          <DetailRow label="Portfolio">
            {profile.portfolioUrl ? (
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                {profile.portfolioUrl}
              </a>
            ) : null}
          </DetailRow>
          <DetailRow label="LinkedIn">
            {profile.linkedinUrl ? (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                {profile.linkedinUrl}
              </a>
            ) : null}
          </DetailRow>
        </dl>
      </SectionCard>

      <SectionCard title="Analytics">
        <TalentAnalyticsView />
      </SectionCard>
    </>
  );
}

function ClientProfileView() {
  const { data: profile, isLoading, isError, error } = useClientProfile();
  const { data: followStatus } = useFollowStatus(profile?.userId ?? "");

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "Could not load your company profile."}
      </div>
    );
  }

  const initials =
    profile.companyName
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "C";
  const followerCount = followStatus?.followerCount ?? 0;
  const isVerified = profile.verificationStatus === "verified";

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/companies/${profile.id}`
      );
      toast.success("Company link copied");
    } catch {
      toast.error("Could not copy company link");
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-border/15 bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar className="size-16">
              {profile.logoUrl ? (
                <AvatarImage src={profile.logoUrl} alt={profile.companyName} />
              ) : null}
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-bold tracking-tight">
                  {profile.companyName || "Your company"}
                </h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              {profile.industry && (
                <p className="mt-1 text-sm font-medium text-primary">
                  {profile.industry}
                </p>
              )}
              {profile.country && (
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {profile.country}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share company
            </Button>
            <EditProfileButton />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/10 pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{followerCount}</span>
            <span className="text-muted-foreground">
              {followerCount === 1 ? "follower" : "followers"}
            </span>
          </div>
        </div>
      </div>

      <SectionCard title="Company">
        <dl className="divide-y divide-border/15">
          <DetailRow label="Company name">{profile.companyName}</DetailRow>
          <DetailRow label="Company size">{profile.companySize}</DetailRow>
          <DetailRow label="Website">
            {profile.website ? (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                {profile.website}
              </a>
            ) : null}
          </DetailRow>
          <DetailRow label="Company description">
            {profile.companyDescription}
          </DetailRow>
        </dl>
      </SectionCard>

      <SectionCard title="Contact person">
        <dl className="divide-y divide-border/15">
          <DetailRow label="Name">
            {[profile.contactFirstName, profile.contactLastName]
              .filter(Boolean)
              .join(" ")}
          </DetailRow>
          <DetailRow label="Phone">{profile.phone}</DetailRow>
        </dl>
      </SectionCard>

      <SectionCard title="Analytics">
        <ClientAnalyticsView />
      </SectionCard>
    </>
  );
}

export default function ProfilePage() {
  usePageTitle("Profile");
  const { user } = useAuth();
  const { data: profile, isLoading, isError, error } = useTalentProfile();

  const myRoles = ((user?.roles ?? []) as UserRole[]);
  const isAdmin =
    myRoles.includes(UserRole.ADMIN) || myRoles.includes(UserRole.SUPER_ADMIN);
  const isClient = user?.accountType === AccountType.CLIENT && !isAdmin;
  const isTalent = user?.accountType === AccountType.TALENT && !isAdmin;

  return (
    <AnimatedContent className="mx-auto max-w-3xl space-y-6">
      {isAdmin && user ? (
        <AdminProfileView user={user} />
      ) : isClient ? (
        <ClientProfileView />
      ) : isTalent ? (
        isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
          </div>
        ) : isError || !profile ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p>
              {error instanceof Error
                ? error.message
                : "Could not load your profile."}
            </p>
            <p className="mt-2 text-muted-foreground">
              Haven&apos;t completed registration?{" "}
              <Link
                href="/complete-profile"
                className="font-medium text-primary underline"
              >
                Finish setting up your profile
              </Link>
              .
            </p>
          </div>
        ) : (
          <TalentProfileView profile={profile} />
        )
      ) : (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Profile is not available for this account type.
        </div>
      )}
    </AnimatedContent>
  );
}
