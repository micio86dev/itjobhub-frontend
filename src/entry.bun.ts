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
  // CSRF check disabled: all mutations are authenticated via JWT (Authorization header).
  // Qwik's built-in check blocks bodyless DELETE requests because the browser omits
  // Content-Type (making it a "simple request") and doesn't send Origin for same-origin
  // fetch calls, causing null !== server-origin → 403.
  checkOrigin: false,
  static: {
    // Default cache control for non-hashed files (favicon, robots.txt, etc)
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

      // Serve static files (images, css, js, fonts)
      const staticResponse = await staticFile(request);
      if (staticResponse) {
        const responseHeaders = new Headers(staticResponse.headers);

        // Hashed build assets (q-*.js, style.css, etc) and fonts/assets should be cached forever
        if (
          url.pathname.startsWith("/build/") ||
          url.pathname.startsWith("/assets/") ||
          url.pathname.startsWith("/fonts/") ||
          // Heuristic for hashed files: contains a hyphen and looks like an asset
          (/\.[a-z0-9]{2,8}\.(js|css|woff2?|svg|png|jpg|webp)$/.test(
            url.pathname,
          ) &&
            url.pathname.includes("-"))
        ) {
          responseHeaders.set(
            "Cache-Control",
            "public, max-age=31536000, immutable",
          );
        } else {
          // Non-hashed assets (manifest.json, favicon.svg, robots.txt, etc)
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
        if (
          !headers.has("Content-Security-Policy") &&
          Bun.env.NODE_ENV !== "development"
        ) {
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
            `script-src 'self' ${scriptSrc} https://maps.googleapis.com ` +
              `https://www.clarity.ms ` +
              `'sha256-L2VzofRwMKVb7ZeLc29Zs5ei5OG9KJ1eXSwz+w4q4/g=' ` + // Vite error handler
              `'sha256-6WHWhiUFSczbUiBvl0gdiF+EeOdPRe66tRIT3FE3E8M=' ` + // qerror listener
              `'sha256-g01uwY0Xp3A6CVmaGXVUZb4BB5+qYIWzHD6zL4NT2+Q=' ` + // qwikdevtools
              `'sha256-U8Wi5C4OM++NZ4A8DB4yxBO/FitF+ui36Yy1UtYbX48=' ` + // qwik-inspector
              `'sha256-EwODyXb+JyP/QFEaG9yjy11qmIlA9bcynhiLgeq19to=' ` + // additional dev tool
              `'sha256-fEB7sBoAvtPwo71XmsbRDawJ54q8Ylx7LVMiLzf4zYU='`, // additional dev script
            "connect-src 'self' https://vitals.vercel-insights.com https://fonts.googleapis.com https://fonts.gstatic.com https://maps.googleapis.com https://c.clarity.ms https://www.clarity.ms",
            "frame-src 'self' https://www.google.com https://maps.google.com",
            "frame-ancestors 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "require-trusted-types-for 'script'",
            "trusted-types default google-maps google-maps-api google-maps-api-loader google-maps-api#html lit-html dompurify devboards-policy clarity-api 'allow-duplicates'",
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
