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
import { requestStore } from "./utils/async-store";

// Create the Qwik City Bun middleware
const { router, notFound, staticFile } = createQwikCity({
  render,
  qwikCityPlan,
  static: {
    cacheControl: "public, max-age=0, must-revalidate",
  },
});

// Allow for dynamic port
const port = Number(Bun.env.PORT ?? 3000);

console.log(`Server started: http://localhost:${port}/`);

Bun.serve({
  async fetch(request: Request) {
    return requestStore.run({}, async () => {
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
        const responseHeaders = new Headers(staticResponse.headers);

        if (
          url.pathname.startsWith("/build/") ||
          url.pathname.startsWith("/assets/") ||
          url.pathname.startsWith("/fonts/") ||
          (/\.(woff2?|svg|png|jpg|jpeg|webp|avif|ico|js|css)$/.test(
            url.pathname,
          ) &&
            url.pathname.includes("-")) // Simple heuristic for hashed files if outside /build/
        ) {
          // Hashed build assets, fonts and static vectors: Cache for 1 year, immutable
          responseHeaders.set(
            "Cache-Control",
            "public, max-age=31536000, immutable",
          );
        } else {
          // Public assets (favicon, robots.txt, etc): Must revalidate (max-age=0)
          responseHeaders.set(
            "Cache-Control",
            "public, max-age=0, must-revalidate",
          );
        }

        return new Response(staticResponse.body, {
          status: staticResponse.status,
          statusText: staticResponse.statusText,
          headers: responseHeaders,
        });
      }

      // Server-side render this request with Qwik City
      const qwikCityResponse = await router(request);
      if (qwikCityResponse) {
        // Create new headers to ensure mutability
        const headers = new Headers(qwikCityResponse.headers);

        // Standard Qwik SSR Cache-Control: Must revalidate to ensure fresh HTML
        if (!headers.has("Cache-Control")) {
          headers.set(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          );
        }

        // Security Headers
        if (!headers.has("Content-Security-Policy")) {
          // Fallback CSP if plugin doesn't set it (should match plugin.ts logic)
          const nonce = requestStore.getStore()?.nonce;
          const scriptSrc = nonce
            ? `'self' 'nonce-${nonce}' 'unsafe-eval'`
            : "'self' 'unsafe-eval'";

          const csp = [
            "default-src 'self'",
            "img-src 'self' data: https:",
            "font-src 'self' https://fonts.gstatic.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            `script-src ${scriptSrc} https://maps.googleapis.com`,
            "connect-src 'self' https://vitals.vercel-insights.com https://fonts.googleapis.com https://fonts.gstatic.com https://maps.googleapis.com",
            "frame-src 'self' https://www.google.com https://maps.google.com",
            "frame-ancestors 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "require-trusted-types-for 'script'",
            "trusted-types default google-maps google-maps-api#html lit-html dompurify devboards-policy 'allow-duplicates'",
          ];
          headers.set("Content-Security-Policy", csp.join("; "));
        }
        headers.set(
          "Strict-Transport-Security",
          "max-age=63072000; includeSubDomains; preload",
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
    });
  },
  port,
});
