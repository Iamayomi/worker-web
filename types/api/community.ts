// Community module API types

import type { PaginationMeta } from "@/types/api/jobs";

export enum CommunityVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
}

export enum CommunityStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  ARCHIVED = "archived",
}

export enum CommunityRole {
  MEMBER = "member",
  MODERATOR = "moderator",
  ADMIN = "admin",
}

export enum CommunityMemberStatus {
  ACTIVE = "active",
  BANNED = "banned",
}

export enum CommunityPostStatus {
  PUBLISHED = "published",
  REMOVED = "removed",
}

export enum CommunityPostPolicy {
  ALL_MEMBERS = "all_members",
  MODERATOR_ONLY = "moderator_only",
}

export enum CommunityEventType {
  IN_PERSON = "in_person",
  ONLINE = "online",
  HYBRID = "hybrid",
}

export enum CommunityEventStatus {
  PUBLISHED = "published",
  CANCELLED = "cancelled",
}

export enum EventRsvpStatus {
  GOING = "going",
  INTERESTED = "interested",
  NOT_GOING = "not_going",
}

export enum CommunityCommentStatus {
  ACTIVE = "active",
  REMOVED = "removed",
}

export interface AuthorSummary {
  userId: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
}

export interface CommunityData {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  visibility: CommunityVisibility;
  postPolicy: CommunityPostPolicy;
  status: CommunityStatus;
  ownerId: string;
  memberCount: number;
  isMember?: boolean;
  role?: CommunityRole;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityMemberData {
  id: string;
  communityId: string;
  userId: string;
  role: CommunityRole;
  status: CommunityMemberStatus;
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  joinedAt: string;
}

export interface CommunityPostData {
  id: string;
  communityId: string;
  authorId: string;
  content: string;
  mediaUrls: string[];
  isMemberPost: boolean;
  status: CommunityPostStatus;
  likeCount: number;
  commentCount: number;
  isLikedByUser?: boolean;
  author?: AuthorSummary;
  communityName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityCommentData {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  status: CommunityCommentStatus;
  author?: AuthorSummary;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityEventData {
  id: string;
  communityId: string;
  organizerId: string;
  title: string;
  description?: string;
  eventType: CommunityEventType;
  location?: string;
  meetLink?: string;
  startsAt: string;
  endsAt?: string;
  maxAttendees?: number;
  status: CommunityEventStatus;
  goingCount: number;
  interestedCount: number;
  reminderSentAt?: string;
  communityName?: string;
  organizer?: AuthorSummary;
  myRsvp?: EventRsvpStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EventRsvpData {
  id: string;
  eventId: string;
  userId: string;
  response: EventRsvpStatus;
  user?: AuthorSummary;
  createdAt: string;
}

export type FeedItemData =
  | { type: "post"; post: CommunityPostData }
  | { type: "event"; event: CommunityEventData };

// Response envelopes
export interface CommunityResponseData {
  community: CommunityData;
}

export interface ListCommunitiesData {
  communities: CommunityData[];
  pagination: PaginationMeta;
}

export interface CommunityMemberResponseData {
  member: CommunityMemberData;
}

export interface ListMembersData {
  members: CommunityMemberData[];
  pagination: PaginationMeta;
}

export interface MembershipData {
  isMember: boolean;
  role?: CommunityRole;
  memberCount: number;
}

export interface PostResponseData {
  post: CommunityPostData;
}

export interface ListPostsData {
  posts: CommunityPostData[];
  pagination: PaginationMeta;
}

export interface LikeResponseData {
  postId: string;
  liked: boolean;
  likeCount: number;
}

export interface CommentResponseData {
  comment: CommunityCommentData;
}

export interface ListCommentsData {
  comments: CommunityCommentData[];
  pagination: PaginationMeta;
}

export interface EventResponseData {
  event: CommunityEventData;
}

export interface ListEventsData {
  events: CommunityEventData[];
  pagination: PaginationMeta;
}

export interface RsvpResponseData {
  rsvp: EventRsvpData;
  goingCount: number;
  interestedCount: number;
}

export interface ListRsvpsData {
  rsvps: EventRsvpData[];
  pagination: PaginationMeta;
}

export interface FeedData {
  items: FeedItemData[];
  pagination: PaginationMeta;
}

export interface TrendingData {
  posts: CommunityPostData[];
  pagination: PaginationMeta;
}

// Inputs
export interface CreateCommunityInput {
  name: string;
  description?: string;
  coverImage?: string;
  visibility: CommunityVisibility;
  postPolicy?: CommunityPostPolicy;
}

export interface UpdateCommunityInput {
  name?: string;
  description?: string;
  coverImage?: string;
  visibility?: CommunityVisibility;
  postPolicy?: CommunityPostPolicy;
}

export interface ListCommunitiesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListMembersParams {
  page?: number;
  limit?: number;
  role?: CommunityRole;
}

export interface CreateCommunityPostInput {
  content: string;
  mediaUrls?: string[];
}

export interface UpdateCommunityPostInput {
  content?: string;
  mediaUrls?: string[];
}

export interface ListPostsParams {
  page?: number;
  limit?: number;
  authorId?: string;
}

export interface CreateCommentInput {
  content: string;
}

export interface ListCommentsParams {
  page?: number;
  limit?: number;
}

export interface CreateCommunityEventInput {
  title: string;
  description?: string;
  eventType: CommunityEventType;
  location?: string;
  meetLink?: string;
  startsAt: string;
  endsAt?: string;
  maxAttendees?: number;
}

export interface UpdateCommunityEventInput {
  title?: string;
  description?: string;
  eventType?: CommunityEventType;
  location?: string;
  meetLink?: string;
  startsAt?: string;
  endsAt?: string;
  maxAttendees?: number;
}

export interface ListEventsParams {
  page?: number;
  limit?: number;
  upcoming?: boolean;
  past?: boolean;
}

export interface FeedQueryParams {
  page?: number;
  limit?: number;
  type?: "posts" | "events" | "all";
  sort?: "latest" | "trending";
}
