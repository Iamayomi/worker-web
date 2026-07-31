import type {
  ContactMessagePayload,
  ContactPageContent,
} from "@/lib/types/contact";
import type {
  BuildsPageContent,
  ExperiencePageContent,
} from "@/lib/types/experience";
import type {
  NoteCommentPayload,
  PublicNoteComment,
  PublicNoteDetail,
  PublicNoteListItem,
  PublicNotesContent,
} from "@/lib/types/notes";
import { apiFetch, apiPost } from "./util";

export const getLandingContent = () =>
  apiFetch<ApiResponse<ILandingContent>>("/landing");

export const getExperienceContent = () =>
  apiFetch<ApiResponse<ExperiencePageContent>>("/experience");

export const getBuildsContent = () =>
  apiFetch<ApiResponse<BuildsPageContent>>("/builds");

export const getContactContent = () =>
  apiFetch<ApiResponse<ContactPageContent>>("/contact");

export const sendContactMessage = (payload: ContactMessagePayload) =>
  apiPost<ApiResponse<null>>("/contact", payload);

export const getNotesContent = (query?: {
  page?: number;
  q?: string;
  limit?: number;
  fields?: (keyof PublicNoteListItem)[];
}) => apiFetch<ApiPaginatedResponse<PublicNotesContent>>("/notes", query);

export const getNoteContent = (slug: string) =>
  apiFetch<ApiResponse<PublicNoteDetail>>(`/notes/${slug}`);

export const sendNoteComment = (slug: string, payload: NoteCommentPayload) =>
  apiPost<ApiResponse<PublicNoteComment>>(`/notes/${slug}/comments`, payload);

export const likeNoteComment = (slug: string, id: string) =>
  apiPost<ApiResponse<{ id: string; likes: number; liked: boolean }>>(
    `/notes/${slug}/comments/${id}/like`
  );

export const trackNoteRead = (slug: string) =>
  apiPost<ApiResponse<{ views: number; counted: boolean }>>(
    `/notes/${slug}/read`
  );

export const subscribeToNewsletter = (payload: {
  email: string;
  source?: string;
  page?: string;
}) => apiPost<ApiResponse<{ subscribed: boolean }>>("/newsletter", payload);
