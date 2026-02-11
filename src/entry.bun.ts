/*
 * WHAT IS THIS FILE?
 *
 * It's the entry point for the Bun HTTP server when building for production.
 *
 * Learn more about the Bun integration here:
 * - https://qwik.dev/docs/deployments/bun/
 * - https://bun.sh/docs/api/http
 *
 */
import { createQwikCity } from "@builder.io/qwik-city/middleware/bun";
import qwikCityPlan from "@qwik-city-plan";
import render from "./entry.ssr";

// Create the Qwik City Bun middleware
const { router, notFound, staticFile } = createQwikCity({
  render,
  qwikCityPlan,
  static: {
    cacheControl: "public, max-age=3600",
  },
});

// Allow for dynamic port
const port = Number(Bun.env.PORT ?? 3000);

console.log(`Server started: http://localhost:${port}/`);

Bun.serve({
  async fetch(request: Request) {
    const url = new URL(request.url);
    console.log(
      `[DEBUG] Incoming request: ${request.method} ${request.url} -> Path: ${url.pathname}`,
    );
    if (url.pathname === "/health") {
      return new Response("UP", { status: 200 });
    }

    // Customize Cache-Control for static files
    const staticResponse = await staticFile(request);
    if (staticResponse) {
      if (
        url.pathname.startsWith("/build/") ||
        url.pathname.startsWith("/assets/") ||
        url.pathname.startsWith("/fonts/") ||
        url.pathname.endsWith(".woff2") ||
        url.pathname.endsWith(".svg")
      ) {
        // Hashed build assets, fonts and static vectors: Cache for 1 year, immutable
        staticResponse.headers.set(
          "Cache-Control",
          "public, max-age=31536000, immutable",
        );
      } else {
        // Public assets (favicon, robots.txt, etc): Cache for 1 hour
        staticResponse.headers.set("Cache-Control", "public, max-age=3600");
      }
      return staticResponse;
    }

    // Server-side render this request with Qwik City
    const qwikCityResponse = await router(request);
    if (qwikCityResponse) {
      // Create new headers to ensure mutability
      const headers = new Headers(qwikCityResponse.headers);

      // Security Headers
      if (!headers.has("Content-Security-Policy")) {
        headers.set(
          "Content-Security-Policy",
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://vitals.vercel-insights.com https://fonts.googleapis.com https://fonts.gstatic.com https://maps.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://www.google.com https://maps.google.com; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self';",
        );
      }
      headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains",
      );
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("X-Frame-Options", "SAMEORIGIN");
      headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

      return new Response(qwikCityResponse.body, {
        status: qwikCityResponse.status,
        statusText: qwikCityResponse.statusText,
        headers,
      });
    }

    // Path not found
    return notFound(request);
  },
  port,
});
