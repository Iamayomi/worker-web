"use client";

import { useMemo, useState } from "react";
import {
 useNotificationPreferences,
 useUpdateNotificationPreferences,
} from "@/lib/hooks/use-notifications";
import {
 useAnalyticsPreferences,
 useUpdateAnalyticsPreferences,
} from "@/lib/hooks/use-analytics";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Bell, LoaderCircle, Mail } from "lucide-react";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsSubNav } from "@/components/settings/settings-sub-nav";
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
 <div className={` border px-4 py-2 text-sm ${styles}`}>
 {children}
 </div>
 );
}

export default function NotificationSettingsPage() {
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

 return (
 <AnimatedContent>
 <div className="mx-auto max-w-3xl space-y-6">
 <PageHeader
 title="Settings"
 description="Manage your account security and preferences."
 />

 <SettingsSubNav />

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
 className="flex flex-wrap items-start justify-between gap-4 border border-border/10 p-4"
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
 </AnimatedContent>
 );
}
