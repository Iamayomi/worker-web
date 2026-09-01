"use client";

import { useState } from "react";
import {
 useConnectGoogleCalendar,
 useDisconnectGoogleCalendar,
 useGoogleCalendarStatus,
} from "@/lib/hooks/use-google-calendar";
import { Button } from "@/components/ui/button";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { CalendarCheck, LoaderCircle, Unlink } from "lucide-react";

export function GoogleCalendarCard() {
 const { data, isLoading } = useGoogleCalendarStatus();
 const connectMutation = useConnectGoogleCalendar();
 const disconnectMutation = useDisconnectGoogleCalendar();
 const [error, setError] = useState("");

 const connected = data?.connected ?? false;

 async function handleConnect() {
 setError("");
 try {
 const result = await connectMutation.mutateAsync();
 if (result?.authUrl) {
 window.location.assign(result.authUrl);
 }
 } catch (err) {
 setError(err instanceof Error ? err.message : "Failed to connect");
 }
 }

 async function handleDisconnect() {
 setError("");
 if (
 !window.confirm(
 "Disconnect Google Calendar? Existing Meet links stay in your calendar."
 )
 ) {
 return;
 }
 try {
 await disconnectMutation.mutateAsync();
 } catch (err) {
 setError(err instanceof Error ? err.message : "Failed to disconnect");
 }
 }

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <CalendarCheck className="h-4 w-4 text-primary" />
 Google Meet &amp; Calendar
 </CardTitle>
 <CardDescription>
 Connect your Google account to automatically create Google Meet links
 for video call interviews. Links are added to your calendar and shared
 with participants.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 {isLoading ? (
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <LoaderCircle className="h-4 w-4 animate-spin" />
 Checking connection...
 </div>
 ) : connected ? (
 <div className="space-y-4">
 <div className="flex flex-wrap items-center justify-between gap-3 border bg-secondary/30 px-4 py-3">
 <div>
 <p className="text-sm font-medium">Connected</p>
 <p className="text-sm text-muted-foreground">
 {data?.googleEmail ?? "Google account"}
 </p>
 </div>
 <Button
 variant="outline"
 size="sm"
 onClick={handleDisconnect}
 disabled={disconnectMutation.isPending}
 >
 {disconnectMutation.isPending ? (
 <LoaderCircle className="h-4 w-4 animate-spin" />
 ) : (
 <Unlink className="h-4 w-4" />
 )}
 Disconnect
 </Button>
 </div>
 <p className="text-xs text-muted-foreground">
 New video call interviews can now be scheduled with an automatic
 Google Meet link.
 </p>
 </div>
 ) : (
 <div className="space-y-4">
 <Button onClick={handleConnect} disabled={connectMutation.isPending}>
 {connectMutation.isPending ? (
 <LoaderCircle className="h-4 w-4 animate-spin" />
 ) : (
 <CalendarCheck className="h-4 w-4" />
 )}
 Connect Google Calendar
 </Button>
 <p className="text-xs text-muted-foreground">
 You&apos;ll be taken to Google to authorize. Only calendar event
 permissions are requested.
 </p>
 </div>
 )}
 {error && <p className="text-sm text-destructive">{error}</p>}
 </CardContent>
 </Card>
 );
}
