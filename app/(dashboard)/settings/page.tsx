"use client";

import { useMemo, useState, type FormEvent } from "react";
import { worker } from "@/lib/api/worker";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/lib/hooks/use-notifications";
import {
  useAnalyticsPreferences,
  useUpdateAnalyticsPreferences,
} from "@/lib/hooks/use-analytics";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Key,
  Shield,
  Ban,
  Bell,
  Mail,
  ChevronRight,
  UserRound,
  LoaderCircle,
} from "lucide-react";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { AccountType, UserRole } from "@/types/api/auth";
import type {
  ChannelPreferences,
  NotificationPreferenceCategory,
  NotificationPreferences,
} from "@/lib/types/api";

const CHANNELS: { key: keyof ChannelPreferences; label: string }[] = [
  { key: "inApp", label: "In-app" },
  { key: "email", label: "Email" },
  { key: "push", label: "Push" },
];

const CATEGORY_LABELS: Record<
  NotificationPreferenceCategory,
  { label: string; desc: string }
> = {
  applications: {
    label: "Applications",
    desc: "Application status updates and recruiter responses",
  },
  offers: {
    label: "Offers",
    desc: "Job offers and interview requests",
  },
  jobs: {
    label: "Jobs",
    desc: "New jobs matching your profile",
  },
  system: {
    label: "System",
    desc: "Account and service notices",
  },
  auth: {
    label: "Security",
    desc: "Sign-ins, password changes, and verification emails",
  },
};

function StatusBanner({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  const styles =
    kind === "error"
      ? "border-destructive/20 bg-destructive/10 text-destructive"
      : "border-green-500/20 bg-green-500/10 text-green-600";
  return (
    <div className={`rounded-lg border px-4 py-2 text-sm ${styles}`}>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [prefsEdits, setPrefsEdits] = useState<Partial<NotificationPreferences> | null>(null);
  const [prefsError, setPrefsError] = useState("");
  const [prefsSaved, setPrefsSaved] = useState("");
  const prefsQuery = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  const analyticsPrefsQuery = useAnalyticsPreferences();
  const updateAnalyticsPrefs = useUpdateAnalyticsPreferences();
  const weeklyEmailOptIn = analyticsPrefsQuery.data?.weekly_email_opt_in ?? false;

  const prefs: NotificationPreferences | null = useMemo(() => {
    const base = prefsQuery.data;
    if (!base) return null;
    return (Object.keys(CATEGORY_LABELS) as NotificationPreferenceCategory[]).reduce(
      (acc, category) => {
        acc[category] = {
          ...base[category],
          ...(prefsEdits?.[category] ?? {}),
        };
        return acc;
      },
      {} as NotificationPreferences
    );
  }, [prefsQuery.data, prefsEdits]);

  function handleToggle(
    category: NotificationPreferenceCategory,
    channel: keyof ChannelPreferences
  ) {
    if (!prefs) return;
    setPrefsSaved("");
    setPrefsEdits((prev) => ({
      ...(prev ?? {}),
      [category]: { ...prefs[category], [channel]: !prefs[category][channel] },
    }));
  }

  async function handleSavePreferences() {
    if (!prefs) return;
    setPrefsError("");
    setPrefsSaved("");
    try {
      await updatePrefs.mutateAsync(prefs);
      setPrefsEdits(null);
      setPrefsSaved("Notification preferences saved");
    } catch (e) {
      setPrefsError(
        e instanceof Error ? e.message : "Failed to save notification preferences"
      );
    }
  }

  const hasPassword = user?.hasPassword ?? false;

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!hasPassword && !newPassword) {
      setError("Fill in a new password");
      return;
    }
    if (hasPassword && !currentPassword) {
      setError("Enter your current password");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    setLoading(true);
    const res = await worker.auth.post("/auth/change-password", {
      ...(hasPassword ? { current_password: currentPassword } : {}),
      new_password: newPassword,
    });
    if (res.success) {
      setSuccess(res.message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setError(res.message || "Failed to update password");
    }
    setLoading(false);
  }

  const myRoles = ((user?.roles ?? []) as UserRole[]);
  const isAdmin =
    myRoles.includes(UserRole.ADMIN) || myRoles.includes(UserRole.SUPER_ADMIN);
  const isClient = user?.accountType === AccountType.CLIENT && !isAdmin;
  const profileHref = "/profile";

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          title="Settings"
          description="Manage your account, security and notification preferences."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <aside className="lg:col-span-1">
            <div className="space-y-1 rounded-xl border border-border/15 p-2">
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account
              </p>
              {[
                {
                  href: profileHref,
                  label: isClient ? "Company profile" : "Profile",
                  desc: "Your public details",
                  icon: UserRound,
                },
                {
                  href: "/sessions",
                  label: "Sessions",
                  desc: "Manage active sessions",
                  icon: Shield,
                },
                {
                  href: "/settings/blocked",
                  label: "Blocked users",
                  desc: "People you've blocked",
                  icon: Ban,
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/60"
                >
                  <div className="rounded-lg bg-primary/10 p-1.5">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </aside>

          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  Security
                </CardTitle>
                <CardDescription>
                  {hasPassword
                    ? "Update the password used to sign in to your account."
                    : "Your account was created with Google. Set a password to also sign in with your email and password."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {error && <StatusBanner kind="error">{error}</StatusBanner>}
                  {success && <StatusBanner kind="success">{success}</StatusBanner>}

                  {hasPassword && (
                    <div className="space-y-1.5">
                      <Label htmlFor="currentPassword">Current password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={8}
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4" />
                    )}
                    {loading
                      ? "Saving..."
                      : hasPassword
                        ? "Change password"
                        : "Set password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Notification preferences
                </CardTitle>
                <CardDescription>
                  Choose which channels you receive updates on for each category.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(prefsError || prefsQuery.isError) && (
                  <div className="mb-4">
                    <StatusBanner kind="error">
                      {prefsError ||
                        (prefsQuery.error instanceof Error
                          ? prefsQuery.error.message
                          : "Failed to load notification preferences")}
                    </StatusBanner>
                  </div>
                )}
                {prefsSaved && (
                  <div className="mb-4">
                    <StatusBanner kind="success">{prefsSaved}</StatusBanner>
                  </div>
                )}

                {prefsQuery.isLoading && !prefs ? (
                  <p className="text-sm text-muted-foreground">
                    Loading notification preferences...
                  </p>
                ) : prefs ? (
                  <div className="space-y-6">
                    {(Object.keys(CATEGORY_LABELS) as NotificationPreferenceCategory[]).map(
                      (category) => (
                        <div
                          key={category}
                          className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border/10 p-4"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {CATEGORY_LABELS[category].label}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {CATEGORY_LABELS[category].desc}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            {CHANNELS.map((channel) => (
                              <label
                                key={channel.key}
                                className="flex cursor-pointer flex-col items-center gap-1"
                              >
                                <Switch
                                  checked={prefs[category][channel.key]}
                                  onCheckedChange={() =>
                                    handleToggle(category, channel.key)
                                  }
                                />
                                <span className="text-xs">{channel.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    )}

                    <Button
                      type="button"
                      disabled={updatePrefs.isPending}
                      onClick={handleSavePreferences}
                    >
                      {updatePrefs.isPending ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                      {updatePrefs.isPending ? "Saving..." : "Save preferences"}
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Weekly analytics summary
                </CardTitle>
                <CardDescription>
                  A digest of your key metrics is emailed to you every Monday
                  morning. You can change this anytime.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly email summary of your account activity.
                  </p>
                  <Switch
                    checked={weeklyEmailOptIn}
                    disabled={
                      analyticsPrefsQuery.isLoading || updateAnalyticsPrefs.isPending
                    }
                    onCheckedChange={(value) => updateAnalyticsPrefs.mutate(value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AnimatedContent>
  );
}
