import { MetadataRoute } from "next";

import { BASE_URL, VERSION } from "@/lib/constants";
import { getNotesContent } from "@/lib/api/pages";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const notesResponse = await getNotesContent({
    fields: ["slug", "publishedAt", "bannerImage", "updatedAt"],
    limit: 1000,
  });

  const notes = notesResponse?.data?.notes || [];

  return notes.map((note) => ({
    url: `${BASE_URL}/notes/${note.slug}`,
    lastModified: note.updatedAt
      ? new Date(note.updatedAt)
      : note.publishedAt
      ? new Date(note.publishedAt)
      : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
    images: [note.bannerImage || `${BASE_URL}/blank-book.jpg?v=${VERSION}`],
  }));
}
