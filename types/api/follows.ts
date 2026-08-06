import type { PaginationMeta } from "@/types/api/jobs";

export interface FollowData {
  id: string;
  follower_id: string;
  followed_id: string;
  created_at: string;
  updated_at: string;
}

export interface FollowUserData {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  accountType?: string;
}

export interface FollowUserResponseData {
  follow?: FollowData;
  message?: string;
}

export interface GetFollowStatusData {
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}

export interface ListFollowsData {
  follows: FollowUserData[];
  pagination: PaginationMeta;
}
