"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  Users,
  Send,
  BookmarkPlus,
  Bookmark,
  Trash2,
  Play,
  LoaderCircle,
  Lock,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { AccountType } from "@/types/api/auth";
import { useSubscription } from "@/lib/hooks/use-billing";
import { usePublicTalentProfile, type TalentProfileData } from "@/lib/hooks/use-profiles";
import {
  useTalentSearch,
  useReachOut,
  useSavedSearches,
  useSaveSearch,
  useRunSavedSearch,
  useDeleteSavedSearch,
  useTalentSearchAnalytics,
  type TalentSearchParams,
  type TalentSearchSort,
} from "@/lib/hooks/use-talent-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorAlert } from "@/components/shared/error-alert";
import { PlanType } from "@/lib/types/billing";

const DEFAULT_FILTERS: TalentSearchParams = {
  query: "",
  skills: [],
  page: 1,
  limit: 10,
  sort: "newest",
};

function TalentCard({
  talent,
  selected,
  onSelect,
}: {
  talent: TalentProfileData;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full border p-4 text-left transition-colors ${
        selected
          ? "border-primary/40 bg-primary/5"
          : "border-border/15 bg-card hover:border-primary/30"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">
          {talent.firstName} {talent.lastName}
        </span>
        {talent.openToWork && <Badge variant="default">Open to work</Badge>}
        {talent.redacted && (
          <Badge variant="outline">
            <Lock className="mr-0.5 h-3 w-3" />
            Preview
          </Badge>
        )}
      </div>
      {talent.professionalTitle && (
        <p className="mt-0.5 text-sm text-muted-foreground">{talent.professionalTitle}</p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        {[talent.country, talent.yearsOfExperience != null ? `${talent.yearsOfExperience} yrs` : null]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {(talent.skills?.length ?? 0) > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {talent.skills!.slice(0, 6).map((s) => (
            <span key={s} className="bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

function TalentDetail({ id }: { id: string }) {
  const { data, isLoading, isError } = usePublicTalentProfile(id);
  const reachOut = useReachOut(id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [roleTitle, setRoleTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    reachOut.mutate(
      { roleTitle, message },
      {
        onSuccess: (res) => {
          setDialogOpen(false);
          setRoleTitle("");
          setMessage("");
          toast.success(
            res.remainingThisMonth >= 0
              ? `Outreach sent (${res.remainingThisMonth} left this month)`
              : "Outreach sent"
          );
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to send outreach"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Loading profile...
      </div>
    );
  }
  if (isError || !data) return <ErrorAlert message="Failed to load profile" />;

  return (
    <div className="border border-border/15 bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">
            {data.firstName} {data.lastName}
          </h3>
          {data.professionalTitle && (
            <p className="text-sm text-muted-foreground">{data.professionalTitle}</p>
          )}
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Send className="h-4 w-4" />
          Reach out
        </Button>
      </div>

      {data.redacted && (
        <div className="mt-3 border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
          Preview only — phone and resume are hidden.{" "}
          <Link href="/billing" className="font-medium underline">
            Upgrade to Pro
          </Link>{" "}
          to unlock contact details.
        </div>
      )}

      {data.bio && <p className="mt-3 text-sm text-foreground/90">{data.bio}</p>}

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {data.country && (
          <div>
            <dt className="text-xs text-muted-foreground">Location</dt>
            <dd>{data.country}</dd>
          </div>
        )}
        {data.yearsOfExperience != null && (
          <div>
            <dt className="text-xs text-muted-foreground">Experience</dt>
            <dd>{data.yearsOfExperience} years</dd>
          </div>
        )}
        {(data.salaryMin != null || data.salaryMax != null) && (
          <div>
            <dt className="text-xs text-muted-foreground">Expectation</dt>
            <dd>
              {data.salaryCurrency ?? "NGN"}{" "}
              {data.salaryMin?.toLocaleString() ?? "—"} –{" "}
              {data.salaryMax?.toLocaleString() ?? "—"}
            </dd>
          </div>
        )}
        {data.availabilityDate && (
          <div>
            <dt className="text-xs text-muted-foreground">Available from</dt>
            <dd>{new Date(data.availabilityDate).toLocaleDateString()}</dd>
          </div>
        )}
        {data.phone && (
          <div>
            <dt className="text-xs text-muted-foreground">Phone</dt>
            <dd>{data.phone}</dd>
          </div>
        )}
        {data.portfolioUrl && (
          <div>
            <dt className="text-xs text-muted-foreground">Portfolio</dt>
            <dd>
              <a href={data.portfolioUrl} target="_blank" rel="noreferrer" className="underline">
                View
              </a>
            </dd>
          </div>
        )}
      </dl>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reach out to {data.firstName} {data.lastName}
            </DialogTitle>
            <DialogDescription>
              Send a structured opportunity message. Monthly limits apply by plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="roleTitle">Role title</Label>
              <Input
                id="roleTitle"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Senior Backend Engineer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="outreachMessage">Message</Label>
              <textarea
                id="outreachMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Why this role fits them..."
                rows={5}
                maxLength={2000}
                className="w-full border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!roleTitle.trim() || !message.trim() || reachOut.isPending}
            >
              {reachOut.isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AnalyticsCard() {
  const { data } = useTalentSearchAnalytics();
  if (!data) return null;
  const limit = data.outreach_monthly_limit;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-primary" />
          Headhunting activity
        </CardTitle>
        <CardDescription>Enterprise telemetry for the last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-2xl font-bold">{data.profiles_viewed_7d}</p>
          <p className="text-xs text-muted-foreground">Profiles viewed (7d)</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{data.profiles_viewed_30d}</p>
          <p className="text-xs text-muted-foreground">Profiles viewed (30d)</p>
        </div>
        <div>
          <p className="text-2xl font-bold">
            {data.outreach_sent_this_month}/
            {Number.isFinite(limit) ? limit : "∞"}
          </p>
          <p className="text-xs text-muted-foreground">Outreach sent (month)</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{data.saved_searches}</p>
          <p className="text-xs text-muted-foreground">Saved searches</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TalentSearchPage() {
  const { user } = useAuth();
  const { data: billing, isLoading: billingLoading } = useSubscription();
  const [draft, setDraft] = useState({ query: "", skillsText: "", country: "" });
  const [filters, setFilters] = useState<TalentSearchParams>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<TalentSearchSort>("newest");
  const [flags, setFlags] = useState({ openToWorkOnly: false, verifiedOnly: false });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("");

  const isClient = user?.accountType === AccountType.CLIENT;
  const effectivePlan = billing?.effectivePlan ?? PlanType.FREE;
  const isEnterprise = effectivePlan === PlanType.ENTERPRISE;
  const canSearch =
    isClient &&
    (effectivePlan === PlanType.PRO || effectivePlan === PlanType.ENTERPRISE);

  const searchQuery = useTalentSearch(
    { ...filters, sort, ...flags },
    canSearch
  );
  const savedQuery = useSavedSearches();
  const saveMutation = useSaveSearch();
  const runMutation = useRunSavedSearch();
  const deleteMutation = useDeleteSavedSearch();

  const results = useMemo(
    () => searchQuery.data?.items ?? [],
    [searchQuery.data]
  );

  const applyFilters = () => {
    setFilters({
      query: draft.query || undefined,
      skills: draft.skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      country: draft.country || undefined,
      page: 1,
      limit: 10,
    });
    setSelectedId(null);
  };

  const handleSave = () => {
    if (!saveName.trim()) {
      toast.error("Give the search a name first");
      return;
    }
    saveMutation.mutate(
      { name: saveName.trim(), criteria: { ...filters, sort, ...flags } },
      {
        onSuccess: () => {
          setSaveName("");
          toast.success("Search saved — you'll be notified of new matches");
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to save search"),
      }
    );
  };

  return (
    <AnimatedContent className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Talent search"
        description="Headhunt verified talent with advanced filters and direct outreach."
      />

      {billingLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Checking plan...
        </div>
      ) : !isClient ? (
        <EmptyState
          icon={Users}
          title="Clients only"
          description="Talent search is an employer headhunting tool."
        />
      ) : !canSearch ? (
        <EmptyState
          icon={Lock}
          title="Talent search requires Pro"
          description="Upgrade to Pro or Enterprise to search talent, send outreach, and save searches."
          action={
            <Button asChild>
              <Link href="/billing">Upgrade plan</Link>
            </Button>
          }
        />
      ) : (
        <>
          {isEnterprise && <AnalyticsCard />}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Keyword</Label>
                <Input
                  value={draft.query}
                  onChange={(e) => setDraft({ ...draft, query: e.target.value })}
                  placeholder="e.g. backend engineer"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Skills (comma separated)</Label>
                <Input
                  value={draft.skillsText}
                  onChange={(e) => setDraft({ ...draft, skillsText: e.target.value })}
                  placeholder="TypeScript, React"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input
                  value={draft.country}
                  onChange={(e) => setDraft({ ...draft, country: e.target.value })}
                  placeholder="Nigeria"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Sort</Label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as TalentSearchSort)}
                  className="w-full border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="experience">Most experienced</option>
                  <option value="recently_active">Recently active</option>
                </select>
              </div>
              <div className="flex items-end gap-4 pb-2">
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={flags.openToWorkOnly}
                    onChange={(e) => setFlags({ ...flags, openToWorkOnly: e.target.checked })}
                  />
                  Open to work
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={flags.verifiedOnly}
                    onChange={(e) => setFlags({ ...flags, verifiedOnly: e.target.checked })}
                  />
                  Verified only
                </label>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={applyFilters}>
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {searchQuery.isError && (
            <ErrorAlert
              message={
                searchQuery.error instanceof Error
                  ? searchQuery.error.message
                  : "Search failed"
              }
            />
          )}

          <div className="grid items-start gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              {searchQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Searching...</p>
              ) : results.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No talent found"
                  description="Adjust filters or save this search to get notified of new matches."
                />
              ) : (
                results.map((t) => (
                  <TalentCard
                    key={t.id}
                    talent={t}
                    selected={selectedId === t.id}
                    onSelect={() => setSelectedId(t.id)}
                  />
                ))
              )}
              {searchQuery.data && searchQuery.data.total > results.length && (
                <p className="text-xs text-muted-foreground">
                  Showing {results.length} of {searchQuery.data.total}
                </p>
              )}
            </div>
            <div className="lg:sticky lg:top-0">
              {selectedId ? (
                <TalentDetail id={selectedId} />
              ) : (
                <div className="flex min-h-48 items-center justify-center border border-dashed border-border/70 text-sm text-muted-foreground">
                  Select a profile to view details
                </div>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bookmark className="h-4 w-4 text-primary" />
                Saved searches
              </CardTitle>
              <CardDescription>
                Re-run filters anytime. New public profiles matching your skills
                trigger a notification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Name these filters, e.g. Lagos React devs"
                  className="min-w-0 flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                >
                  <BookmarkPlus className="h-4 w-4" />
                  Save current filters
                </Button>
              </div>
              {(savedQuery.data?.searches ?? []).map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 border border-border/15 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(s.criteria.skills ?? []).join(", ") || "All talent"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={runMutation.isPending}
                      onClick={() =>
                        runMutation.mutate(
                          { id: s.id },
                          {
                            onSuccess: (res) => {
                              setFilters({ ...s.criteria, page: 1, limit: 10 });
                              setSelectedId(null);
                              toast.success(
                                `${res.total} match${res.total === 1 ? "" : "es"} found`
                              );
                            },
                            onError: (err) =>
                              toast.error(
                                err instanceof Error ? err.message : "Run failed"
                              ),
                          }
                        )
                      }
                    >
                      <Play className="h-4 w-4" />
                      Run
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        deleteMutation.mutate(s.id, {
                          onSuccess: () => toast.success("Search deleted"),
                          onError: (err) =>
                            toast.error(
                              err instanceof Error ? err.message : "Delete failed"
                            ),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </AnimatedContent>
  );
}
