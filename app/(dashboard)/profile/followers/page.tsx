"use client";

import { FollowsListPage } from "@/components/follows/follows-list-page";

export default function MyFollowersPage() {
  return (
    <FollowsListPage
      type="followers"
      source="me"
      backHref="/profile"
      backLabel="Profile"
    />
  );
}
