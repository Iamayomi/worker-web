"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useConnectGoogleGmail,
  useDisconnectGoogleGmail,
  useGoogleGmailStatus,
} from "@/lib/hooks/use-google-gmail";
import { useSubscription } from "@/lib/hooks/use-billing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Inbox, LoaderCircle, Unlink } from "lucide-react";

export function GoogleGmailCard() {
  const { data, isLoading } = useGoogleGmailStatus();
  const { data: billing } = useSubscription();
  const connectMutation = useConnectGoogleGmail();
  const disconnectMutation = useDisconnectGoogleGmail();
  const [error, setError] = useState("");

  const connected = data?.connected ?? false;
  const allowsGmail = billing?.limits?.allowsGmailInbox ?? false;

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
    if (!window.confirm("Disconnect Gmail? Synced recruitment emails will no longer update.")) {
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
          <Inbox className="h-4 w-4 text-primary" />
          Gmail inbox
        </CardTitle>
        <CardDescription>
          Connect your Google account to sync and read recruitment emails
          directly in the platform. Enterprise plan only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!allowsGmail ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The Gmail inbox requires the Enterprise plan.
            </p>
            <Button asChild>
              <Link href="/billing">Upgrade plan</Link>
            </Button>
          </div>
        ) : isLoading ? (
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
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/gmail-inbox">Open inbox</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Button onClick={handleConnect} disabled={connectMutation.isPending}>
              {connectMutation.isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Inbox className="h-4 w-4" />
              )}
              Connect Gmail
            </Button>
            <p className="text-xs text-muted-foreground">
              You&apos;ll be taken to Google to authorize. Only Gmail
              read-only permissions are requested.
            </p>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
