"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Key, LoaderCircle } from "lucide-react";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsSubNav } from "@/components/settings/settings-sub-nav";
import { GoogleCalendarCard } from "@/components/settings/google-calendar-card";

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

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const hasPassword = user?.hasPassword ?? false;
  const isClient = user?.accountType === "client";
  const searchParams = useSearchParams();
  const [googleNotice] = useState<"connected" | "error" | null>(() => {
    const status = searchParams.get("google");
    return status === "connected" || status === "error" ? status : null;
  });

  useEffect(() => {
    if (!googleNotice) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("google");
    window.history.replaceState({}, "", url.toString());
  }, [googleNotice]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    const res = await api.auth.post("/auth/change-password", {
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

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          title="Settings"
          description="Manage your account security and preferences."
        />

        <SettingsSubNav />

        {googleNotice === "connected" && (
          <StatusBanner kind="success">
            Google Calendar connected successfully.
          </StatusBanner>
        )}
        {googleNotice === "error" && (
          <StatusBanner kind="error">
            Google Calendar connection failed. Please try again.
          </StatusBanner>
        )}

        {isClient && <GoogleCalendarCard />}

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
      </div>
    </AnimatedContent>
  );
}
