"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Briefcase,
  BriefcaseBusiness,
  FileText,
  Globe,
  Laptop,
  Link2,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  User,
} from "lucide-react";
import { usePublicTalentProfile } from "@/lib/hooks/use-profiles";
import { useRecordAnalyticsEvent } from "@/lib/hooks/use-analytics";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { useAuth } from "@/lib/auth/auth-context";
import { useCreateConversation } from "@/lib/hooks/use-chat";
import { AccountType } from "@/types/api/auth";
import { FollowButton } from "@/components/shared/follow-button";
import { FollowStats } from "@/components/follows/follow-stats";
import {
  CertificationList,
  EducationList,
  WorkExperienceList,
} from "@/components/profile/talent-entry-list";
import { EMPLOYMENT_TYPES, WORK_PREFERENCES } from "@/lib/constants/enums";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorAlert } from "@/components/shared/error-alert";
import { AnimatedContent } from "@/components/shared/animated-content";

const employmentLabel = (value?: string) =>
  EMPLOYMENT_TYPES.find((t) => t.value === value)?.label ?? value;

const preferenceLabel = (value?: string) =>
  WORK_PREFERENCES.find((t) => t.value === value)?.label ?? value;

const genderLabel = (value?: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : undefined;

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="text-right text-sm font-medium">{children}</span>
    </div>
  );
}

export default function PublicTalentProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const createConversation = useCreateConversation();
  const [startingChat, setStartingChat] = useState(false);
  const { data: profile, isLoading, isError, error } = usePublicTalentProfile(
    params.id
  );
  const recordEvent = useRecordAnalyticsEvent();

  usePageTitle(
    profile ? `${profile.firstName} ${profile.lastName}` : "Talent profile"
  );

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied");
    } catch {
      toast.error("Could not copy profile link");
    }
  };

  const startChat = async () => {
    if (!profile) return;
    if (!isAuthenticated) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/talent/${profile.id}`)}`
      );
      return;
    }
    setStartingChat(true);
    try {
      const result = await createConversation.mutateAsync({
        participantIds: [profile.userId],
      });
      if (result?.id) {
        router.push(`/messages/${result.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start chat");
    } finally {
      setStartingChat(false);
    }
  };

  if (isLoading) {
    return (
      <AnimatedContent className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/15 bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <Skeleton className="size-16 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-3 pt-1">
                  <Skeleton className="h-7 w-40 sm:w-56" />
                  <Skeleton className="h-4 w-24 sm:w-32" />
                  <Skeleton className="h-4 w-32 sm:w-44" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-28 rounded-md" />
                <Skeleton className="h-9 w-28 rounded-md" />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>

          <div className="rounded-2xl border border-border/15 bg-card p-6 shadow-sm sm:p-8">
            <Skeleton className="h-4 w-24" />
            <div className="mt-3 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/15 bg-card p-6 shadow-sm sm:p-8">
            <Skeleton className="h-4 w-16" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </AnimatedContent>
    );
  }

  if (isError || !profile) {
    return (
      <AnimatedContent className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <ErrorAlert
          message={
            error instanceof Error
              ? error.message
              : "This profile is not available."
          }
        />
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/jobs">Browse jobs</Link>
          </Button>
        </div>
      </AnimatedContent>
    );
  }

  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ");
  const initials =
    [profile.firstName, profile.lastName]
      .filter(Boolean)
      .map((name) => name[0]?.toUpperCase() ?? "")
      .join("") || "T";
  const location = [profile.country, profile.stateOfResidence]
    .filter(Boolean)
    .join(", ");
  const years = profile.yearsOfExperience;
  const yearsLabel = years
    ? years === 1
      ? "1 year"
      : `${years} years`
    : undefined;

  return (
    <AnimatedContent className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <div className="space-y-4">
        <div className="rounded-2xl border border-border/15 bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <Avatar className="size-16">
                {profile.avatarUrl && (
                  <AvatarImage
                    src={profile.avatarUrl}
                    alt={fullName}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold tracking-tight">
                  {fullName}
                </h1>
                <p className="mt-1 text-sm font-medium text-primary">
                  {profile.professionalTitle ?? "Talent"}
                </p>
                {location && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {location}
                  </p>
                )}
                <div className="mt-3">
                  <FollowStats userId={profile.userId} />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FollowButton targetUserId={profile.userId} />
              {user?.accountType === AccountType.CLIENT && (
                <Button
                  variant="outline"
                  onClick={startChat}
                  disabled={startingChat || authLoading}
                >
                  {startingChat ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  Message
                </Button>
              )}
              <Button variant="outline" onClick={share}>
                <Share2 className="h-4 w-4" />
                Share profile
              </Button>
            </div>
          </div>

          {profile.bio && (
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/15 bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h2>
          <div className="mt-2 divide-y divide-border">
            <InfoRow icon={Briefcase} label="Experience">
              {yearsLabel ?? "Any level"}
            </InfoRow>
            <InfoRow icon={BriefcaseBusiness} label="Employment type">
              {employmentLabel(profile.employmentType) ?? "Any"}
            </InfoRow>
            <InfoRow icon={Laptop} label="Work preference">
              {preferenceLabel(profile.workPreference) ?? "Any"}
            </InfoRow>
            {profile.gender && (
              <InfoRow icon={User} label="Gender">
                {genderLabel(profile.gender)}
              </InfoRow>
            )}
            {profile.phone && (
              <InfoRow icon={Phone} label="Phone">
                {profile.phone}
              </InfoRow>
            )}
          </div>
        </div>

        <WorkExperienceList talentProfileId={profile.id} />
        <EducationList talentProfileId={profile.id} />
        <CertificationList talentProfileId={profile.id} />

        <div className="rounded-2xl border border-border/15 bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Links
          </h2>
          <div className="mt-2 space-y-2">
            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  recordEvent.mutate({
                    eventType: "resume_download",
                    targetType: "talent_profile",
                    targetId: profile.id,
                  })
                }
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                View CV
              </a>
            )}
            {profile.portfolioUrl && (
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Globe className="h-4 w-4" />
                Portfolio
              </a>
            )}
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Link2 className="h-4 w-4" />
                LinkedIn
              </a>
            )}
            {!profile.resumeUrl &&
              !profile.portfolioUrl &&
              !profile.linkedinUrl && (
                <p className="text-sm text-muted-foreground">
                  No links shared yet.
                </p>
              )}
          </div>
        </div>
      </div>
    </AnimatedContent>
  );
}
