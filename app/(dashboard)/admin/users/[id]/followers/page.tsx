"use client";

import { useParams } from "next/navigation";
import { FollowsListPage } from "@/components/follows/follows-list-page";

export default function AdminUserFollowersPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  if (!id) return null;

  return (
    <FollowsListPage
      type="followers"
      source="user"
      userId={id}
      backHref={`/admin/users/${id}`}
      backLabel="User details"
      canRemove
    />
  );
}
