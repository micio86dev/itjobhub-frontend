import type { RequestHandler } from "@builder.io/qwik-city";

interface Job {
  id: string;
  updated_at?: string;
  created_at?: string;
}

interface News {
  slug: string;
  updated_at?: string;
  published_at?: string;
  created_at?: string;
}

const SUPPORTED_LANGUAGES = ["it", "en", "es", "de", "fr"];

/**
 * Dynamic sitemap.xml endpoint
 * Generates sitemap with all static and dynamic pages
 * Includes multi-language hreflang tags for SEO
 */
export const onGet: RequestHandler = async ({ send, env }) => {
  const API_URL = env.get("PUBLIC_API_URL") || "http://127.0.0.1:3001";
  const RAW_SITE_URL = env.get("PUBLIC_SITE_URL");
  const SITE_URL =
    RAW_SITE_URL && RAW_SITE_URL !== "undefined"
      ? RAW_SITE_URL
      : "https://devboards.io";

  // Fetch data in parallel
  const [jobsResult, newsResult] = await Promise.allSettled([
    fetch(`${API_URL}/jobs?limit=1000&status=active`),
    fetch(`${API_URL}/news?limit=1000&is_published=true`),
  ]);

  let jobs: Job[] = [];
  if (jobsResult.status === "fulfilled" && jobsResult.value.ok) {
    try {
      const result = await jobsResult.value.json();
      jobs = result.data?.jobs || [];
    } catch (e) {
      console.error("[Sitemap] Failed to parse jobs JSON", e);
    }
  } else {
    console.error("[Sitemap] Failed to fetch jobs");
  }

  let newsList: News[] = [];
  if (newsResult.status === "fulfilled" && newsResult.value.ok) {
    try {
      const result = await newsResult.value.json();
      // Adjust based on actual API response structure for news
      newsList = result.data?.news || [];
    } catch (e) {
      console.error("[Sitemap] Failed to parse news JSON", e);
    }
  } else {
    console.error("[Sitemap] Failed to fetch news");
  }

  const now = new Date().toISOString();

  // Helper for generating hreflang tags for a specific path
  const generateHreflangTags = (path: string) => {
    const tags = SUPPORTED_LANGUAGES.map((lang) => {
      const href = `${SITE_URL}${path}${lang !== "it" ? `?lang=${lang}` : ""}`;
      return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`;
    });
    // x-default points to the default version (Italian)
    tags.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${path}"/>`,
    );
    return tags.join("\n");
  };

  // Helper for URL entry - now generates an entry for EACH language version
  const createUrlEntries = (
    path: string,
    priority: string,
    changefreq: string,
    lastmod: string = now,
  ) => {
    return SUPPORTED_LANGUAGES.map((lang) => {
      const loc = `${SITE_URL}${path}${lang !== "it" ? `?lang=${lang}` : ""}`;
      return `  <url>
    <loc>${loc}</loc>
${generateHreflangTags(path)}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`;
    }).join("\n");
  };

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <!-- Static Pages -->
${createUrlEntries("/", "1.0", "daily")}
${createUrlEntries("/jobs", "0.9", "hourly")}
${createUrlEntries("/news", "0.9", "hourly")}
${createUrlEntries("/login", "0.5", "monthly")}
${createUrlEntries("/register", "0.6", "monthly")}
${createUrlEntries("/contact", "0.5", "monthly")}
${createUrlEntries("/privacy-policy", "0.3", "monthly")}
${createUrlEntries("/cookie-policy", "0.3", "monthly")}
${createUrlEntries("/forgot-password", "0.4", "monthly")}
  
  <!-- Dynamic Job Pages -->
${jobs
  .map((job) =>
    createUrlEntries(
      `/jobs/detail/${job.id}`,
      "0.8",
      "weekly",
      job.updated_at || job.created_at || now,
    ),
  )
  .join("\n")}

  <!-- Dynamic News Pages -->
${newsList
  .map((news) =>
    createUrlEntries(
      `/news/${news.slug}`,
      "0.8",
      "weekly",
      news.updated_at || news.published_at || news.created_at || now,
    ),
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
