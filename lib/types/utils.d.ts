interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
interface ApiPaginatedResponse<T> extends ApiResponse<T> {
  data?: T;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    showingStart?: number;
    showingEnd?: number;
  };
}

type SocialPlatform =
  | "facebook"
  | "x"
  | "instagram"
  | "youtube"
  | "linkedin"
  | "tiktok"
  | "threads"
  | "whatsapp"
  | "telegram"
  | "snapchat"
  | "pinterest"
  | "github"
  | "email"
  | "website"
  | "medium";

type SocialLink = {
  href: string;
  icon: IconType;
  label: string;
};

type SocialConfig = {
  key: SocialPlatform;
  label: string;
  icon: IconType;
  baseUrl: string;
  pattern: RegExp;
};
