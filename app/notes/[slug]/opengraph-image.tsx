import { getNoteContent } from "@/lib/api/pages";
import { BASE_URL } from "@/lib/constants";

export const size = {
  width: 1200,
  height: 630,
};

export const alt = "Note banner image";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const note = (await getNoteContent(slug))?.data;

  const imageUrl = note?.bannerImage || `${BASE_URL}/blank-book.jpg`;

  try {
    const imageRes = await fetch(imageUrl, {
      next: { revalidate: 86400 },
    });

    if (!imageRes.ok) {
      throw new Error("Failed to fetch note banner image");
    }

    return new Response(await imageRes.arrayBuffer(), {
      headers: {
        "Content-Type": imageRes.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    const fallbackRes = await fetch(`${BASE_URL}/blank-book.jpg`, {
      next: { revalidate: 86400 },
    });

    return new Response(await fallbackRes.arrayBuffer(), {
      headers: {
        "Content-Type": fallbackRes.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }
}
