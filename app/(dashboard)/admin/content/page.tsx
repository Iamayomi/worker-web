"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useAdminPosts, useDeletePost } from "@/lib/hooks/use-posts";
import { PostStatus, type Post } from "@/types/api/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteModal } from "@/components/ui/delete-modal";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContent } from "@/components/shared/animated-content";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsSkeleton, TableSkeleton } from "@/components/shared/skeletons";
import { Archive, CheckCircle2, ExternalLink, FileText, PenLine, Pencil, Plus, Trash2 } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
 draft: "bg-yellow-500/10 text-yellow-600",
 published: "bg-green-500/10 text-green-600",
 archived: "bg-gray-500/10 text-gray-600",
};

function formatDate(value?: string) {
 if (!value) return "—";
 return new Date(value).toLocaleDateString();
}

export default function AdminContentPage() {
 const { user } = useAuth();
 const router = useRouter();
 const isAdmin = useMemo(
 () =>
 (user?.roles ?? []).some((r) => r === "super_admin" || r === "admin"),
 [user]
 );

 const [search, setSearch] = useState("");
 const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

 const { data, isLoading, isError, error, refetch } = useAdminPosts({
 query: search || undefined,
 limit: 50,
 });
 const deletePost = useDeletePost();

 const posts: Post[] = data?.posts ?? [];

 const totalPosts = data?.pagination.total ?? 0;
 const publishedCount = posts.filter(
 (p) => p.status === PostStatus.PUBLISHED
 ).length;
 const draftCount = posts.filter((p) => p.status === PostStatus.DRAFT).length;
 const archivedCount = posts.filter(
 (p) => p.status === PostStatus.ARCHIVED
 ).length;

 if (!isAdmin) {
 return (
 <AnimatedContent>
 <div className="mx-auto max-w-2xl">
 <div className=" border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
 You need an admin role to view this page.
 </div>
 </div>
 </AnimatedContent>
 );
 }

 return (
 <AnimatedContent>
 <div className="mx-auto max-w-6xl space-y-6">
 <div className="flex flex-wrap items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">
 Content management
 </h1>
 <p className="mt-1 text-sm text-muted-foreground">
 Write and manage blog posts, guides and career content.
 </p>
 </div>
 <div className="flex items-center gap-2">
 <Button asChild>
 <Link href="/admin/content/new">
 <Plus className="h-4 w-4" /> New post
 </Link>
 </Button>
 </div>
 </div>

 {isLoading ? (
 <StatCardsSkeleton count={4} />
 ) : (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <StatCard label="Total posts" value={totalPosts} icon={FileText} />
 <StatCard
 label="Published"
 value={publishedCount}
 icon={CheckCircle2}
 />
 <StatCard label="Drafts" value={draftCount} icon={PenLine} />
 <StatCard label="Archived" value={archivedCount} icon={Archive} />
 </div>
 )}

 {isError && (
 <div className=" border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
 {error instanceof Error ? error.message : "Failed to load posts"}
 </div>
 )}

 <div className="space-y-4">
 <SearchInput
 value={search}
 onChange={setSearch}
 placeholder="Search posts..."
 />
 {isLoading ? (
 <TableSkeleton rows={6} columns={5} />
 ) : posts.length === 0 ? (
 <div className=" border border-border/15">
 <EmptyState
 icon={FileText}
 title="No posts yet"
 description="Create your first post to get started."
 />
 </div>
 ) : (
 <ul className="divide-y divide-border/10 overflow-hidden border border-border/15">
 {posts.map((post) => (
 <li key={post.id}>
 <div
 role="button"
 tabIndex={0}
 onClick={() => router.push(`/admin/content/${post.id}`)}
 onKeyDown={(e) => {
 if (e.key === "Enter" || e.key === " ") {
 e.preventDefault();
 router.push(`/admin/content/${post.id}`);
 }
 }}
 className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40"
 >
 <div className="min-w-0">
 <p className="truncate text-sm font-medium">
 {post.title}
 </p>
 <p className="mt-0.5 text-xs text-muted-foreground">
 {post.category ?? "Uncategorized"} · Updated{" "}
 {formatDate(post.updatedAt)}
 </p>
 </div>
 <div className="flex shrink-0 items-center gap-2">
 <Badge
 className={STATUS_STYLES[post.status] ?? undefined}
 >
 {post.status}
 </Badge>
 <Link
 href={`/admin/content/${post.id}`}
 aria-label={`Edit ${post.title}`}
 onClick={(e) => e.stopPropagation()}
 className=" p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
 >
 <Pencil className="h-4 w-4" />
 </Link>
 {post.status === PostStatus.PUBLISHED && post.slug && (
 <Link
 href={`/resources/${post.slug}`}
 target="_blank"
 rel="noreferrer"
 aria-label={`View ${post.title}`}
 onClick={(e) => e.stopPropagation()}
 className=" p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
 >
 <ExternalLink className="h-4 w-4" />
 </Link>
 )}
 <button
 type="button"
 aria-label={`Delete ${post.title}`}
 onClick={(e) => {
 e.stopPropagation();
 setDeleteTarget(post);
 }}
 className=" p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
 >
 <Trash2 className="h-4 w-4" />
 </button>
 </div>
 </div>
 </li>
 ))}
 </ul>
 )}
 </div>
 </div>

 <DeleteModal
 open={!!deleteTarget}
 onOpenChange={(open) => {
 if (!open) setDeleteTarget(null);
 }}
 onConfirm={() => {
 if (!deleteTarget) return;
 deletePost.mutate(deleteTarget.id, {
 onSuccess: () => {
 setDeleteTarget(null);
 refetch();
 },
 });
 }}
 title="Delete post?"
 description={`This will permanently remove "${
 deleteTarget?.title ?? "this post"
 }" from the site. This action cannot be undone.`}
 isLoading={deletePost.isPending}
 />
 </AnimatedContent>
 );
}
