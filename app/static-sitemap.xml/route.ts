import { BASE_URL } from "@/lib/constants";

export async function GET() {
  const now = new Date().toISOString();

  const urls = [
    `${BASE_URL}/`,
    `${BASE_URL}/notes`,
    `${BASE_URL}/contact`,
    `${BASE_URL}/experience`,
    `${BASE_URL}/builds`,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${url.includes("notes") ? "weekly" : "monthly"}</changefreq>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
