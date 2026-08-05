"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { worker } from "@/lib/api/worker";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useUploadAvatar } from "@/lib/hooks/use-users";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/lib/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Camera, ChevronRight, Shield, Key, Bell } from "lucide-react";
import { AnimatedContent } from "@/components/shared/animated-content";
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

export default function SettingsPage() {
  const { user } = useAuth();
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarMsg, setAvatarMsg] = useState("");
  const [avatarError, setAvatarError] = useState("");

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

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file");
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be 5MB or smaller");
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }
    setAvatarError("");
    setAvatarMsg("");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleUploadAvatar() {
    if (!avatarFile) return;
    setAvatarError("");
    setAvatarMsg("");
    await uploadAvatar.mutateAsync(avatarFile, {
      onSuccess: (res) => {
        setAvatarFile(null);
        setAvatarPreview(null);
        setAvatarMsg(res?.message ?? "Avatar upload queued for processing");
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
    });
  }

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

  const sections = [
    {
      title: "Account",
      items: [
        { icon: Shield, label: "Sessions", desc: "Manage active sessions", href: "/sessions" },
      ],
    },
  ];

  return (
    <AnimatedContent>
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Profile picture</h2>
        <div className="rounded-lg border border-border/15 p-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="block w-full max-w-sm text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary"
              />
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, GIF or WEBP — up to 5MB
              </p>
            </div>
          </div>

          {avatarError && (
            <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {avatarError}
            </div>
          )}
          {avatarMsg && (
            <div className="mt-3 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-600">
              {avatarMsg}
            </div>
          )}
          {uploadAvatar.isError && (
            <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {uploadAvatar.error instanceof Error
                ? uploadAvatar.error.message
                : "Upload failed"}
            </div>
          )}

          {avatarPreview && (
            <Button
              type="button"
              className="mt-4"
              disabled={uploadAvatar.isPending}
              onClick={handleUploadAvatar}
            >
              <Camera className="h-4 w-4" />
              {uploadAvatar.isPending ? "Uploading..." : "Upload picture"}
            </Button>
          )}
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="mb-3 text-lg font-semibold">{section.title}</h2>
          <div className="space-y-1 rounded-lg border border-border/15">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-secondary/50 first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div>
        <h2 className="mb-3 text-lg font-semibold">Security</h2>
        <div className="rounded-lg border border-border/15 p-5">
          {!hasPassword && (
            <p className="mb-4 text-sm text-muted-foreground">
              Your account was created with Google. Set a password to also sign
              in with your email and password.
            </p>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
            )}
            {success && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-600">{success}</div>
            )}

            {hasPassword && (
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input id="currentPassword" type="password" value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} minLength={8} />
            </div>

            <Button type="submit" disabled={loading}>
              <Key className="h-4 w-4" />{" "}
              {loading
                ? "Saving..."
                : hasPassword
                  ? "Change password"
                  : "Set password"}
            </Button>
          </form>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Notifications</h2>
        <div className="rounded-lg border border-border/15 p-5">
          {(prefsError || prefsQuery.isError) && (
            <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {prefsError ||
                (prefsQuery.error instanceof Error
                  ? prefsQuery.error.message
                  : "Failed to load notification preferences")}
            </div>
          )}
          {prefsSaved && (
            <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-600">
              {prefsSaved}
            </div>
          )}

          {prefsQuery.isLoading && !prefs ? (
            <p className="text-sm text-muted-foreground">
              Loading notification preferences...
            </p>
          ) : prefs ? (
            <div className="space-y-4">
              {(Object.keys(CATEGORY_LABELS) as NotificationPreferenceCategory[]).map(
                (category) => (
                  <div key={category}>
                    <p className="text-sm font-medium">
                      {CATEGORY_LABELS[category].label}
                    </p>
                    <p className="mb-2 text-xs text-muted-foreground">
                      {CATEGORY_LABELS[category].desc}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      {CHANNELS.map((channel) => (
                        <label
                          key={channel.key}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <Switch
                            checked={prefs[category][channel.key]}
                            onCheckedChange={() =>
                              handleToggle(category, channel.key)
                            }
                          />
                          <span className="text-sm">{channel.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              )}

              <Button
                type="button"
                className="mt-2"
                disabled={updatePrefs.isPending}
                onClick={handleSavePreferences}
              >
                <Bell className="h-4 w-4" />{" "}
                {updatePrefs.isPending ? "Saving..." : "Save preferences"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
    </AnimatedContent>
  );
}

