"use client";

import { FollowsListPage } from "@/components/follows/follows-list-page";

export default function MyFollowingPage() {
  return (
    <FollowsListPage
      type="following"
      source="me"
      backHref="/profile"
      backLabel="Profile"
    />
  );
}
