// Content posts API types

export enum PostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category?: string;
  tags: string[];
  status: PostStatus;
  authorId?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostListData {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface CreatePostInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  status?: PostStatus;
}

export type UpdatePostInput = Partial<CreatePostInput>;

export interface PostQueryParams {
  query?: string;
  category?: string;
  tag?: string;
  status?: PostStatus;
  sort?: "newest" | "oldest";
  page?: number;
  limit?: number;
}
