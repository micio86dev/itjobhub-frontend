import type { RequestHandler } from "@builder.io/qwik-city";

const SITE_URL = "https://itjobhub.com";
const SUPPORTED_LANGUAGES = ["it", "en", "es", "de", "fr"];

interface Job {
  id: string;
  updated_at?: string;
  created_at?: string;
}

/**
 * Dynamic sitemap.xml endpoint
 * Generates sitemap with all static and dynamic pages
 * Includes multi-language hreflang tags for SEO
 */
export const onGet: RequestHandler = async ({ send, env }) => {
  const API_URL = env.get("PUBLIC_API_URL") || "http://localhost:3001";

  // Fetch all active jobs from API
  let jobs: Job[] = [];
  try {
    const response = await fetch(`${API_URL}/jobs?limit=1000&status=active`);
    if (response.ok) {
      const result = await response.json();
      jobs = result.data?.jobs || [];
    }
  } catch {
    // If API fails, generate sitemap with static pages only
    console.error("[Sitemap] Failed to fetch jobs from API");
  }

  const now = new Date().toISOString();

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <!-- Homepage -->
  <url>
    <loc>${SITE_URL}/</loc>
${generateHreflangTags("/")}
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${now}</lastmod>
  </url>
  
  <!-- Jobs listing page -->
  <url>
    <loc>${SITE_URL}/jobs</loc>
${generateHreflangTags("/jobs")}
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
    <lastmod>${now}</lastmod>
  </url>
  
  <!-- Login page -->
  <url>
    <loc>${SITE_URL}/login</loc>
${generateHreflangTags("/login")}
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <!-- Register page -->
  <url>
    <loc>${SITE_URL}/register</loc>
${generateHreflangTags("/register")}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Dynamic job pages -->
${jobs
  .map(
    (job) => `  <url>
    <loc>${SITE_URL}/jobs/detail/${job.id}</loc>
${generateHreflangTags(`/jobs/detail/${job.id}`)}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${job.updated_at || job.created_at || now}</lastmod>
  </url>`,
  )
  .join("\n")}

</urlset>`;

  send(
    new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    }),
  );
};

/**
 * Generate hreflang tags for all supported languages
 */
function generateHreflangTags(path: string): string {
  const tags = SUPPORTED_LANGUAGES.map(
    (lang) =>
      `    <xhtml:link rel="alternate" hreflang="${lang}" href="${SITE_URL}${path}"/>`,
  );
  tags.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${path}"/>`,
  );
  return tags.join("\n");
}
