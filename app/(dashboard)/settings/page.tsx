"use client";

import { useRef, useState, type FormEvent } from "react";
import { worker } from "@/lib/api/worker";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useUploadAvatar } from "@/lib/hooks/use-users";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera, ChevronRight, Shield, Key } from "lucide-react";
import { AnimatedContent } from "@/components/shared/animated-content";

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
    if (!currentPassword || !newPassword) {
      setError("Fill in both fields");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    setLoading(true);
    const res = await worker.auth.post("/auth/reset-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    if (res.success) {
      setSuccess("Password updated successfully");
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
          <form onSubmit={handleChangePassword} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
            )}
            {success && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-600">{success}</div>
            )}

            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium">Current password</label>
              <input id="currentPassword" type="password" value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium">New password</label>
              <input id="newPassword" type="password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} minLength={8}
                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>

            <Button type="submit" disabled={loading}>
              <Key className="h-4 w-4" /> {loading ? "Updating..." : "Change password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
    </AnimatedContent>
  );
}

