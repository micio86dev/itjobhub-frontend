import type { RequestHandler } from "@builder.io/qwik-city";
import { requestStore } from "../utils/async-store";
import { buildCsp } from "../utils/csp";

export const onRequest: RequestHandler = async ({
  headers,
  sharedMap,
  method,
  request,
  error,
}) => {
  // Custom CSRF guard for DELETE (Qwik's built-in checkOrigin is disabled because
  // same-origin fetch omits the Origin header on bodyless requests, causing false 403s).
  // Rule: block only when there is NO Bearer token AND the Origin header is present
  // but its host doesn't match the Host header. Absent Origin (same-origin fetch) → allow.
  if (method === "DELETE") {
    const auth =
      request.headers.get("Authorization") ??
      request.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      const originHeader = request.headers.get("origin");
      if (originHeader !== null) {
        const requestHost = request.headers.get("host") ?? "";
        let originHost: string;
        try {
          originHost = new URL(originHeader).host;
        } catch {
          throw error(403, "CSRF check failed: malformed Origin header");
        }
        if (originHost !== requestHost) {
          throw error(
            403,
            `CSRF check failed: Origin "${originHeader}" does not match Host "${requestHost}"`,
          );
        }
      }
      // No Origin header → same-origin fetch → allow
    }
    // Bearer token present → JWT auth → CSRF irrelevant → allow
  }
  // Generate a random nonce for this request
  const nonce = crypto.randomUUID();

  const store = requestStore.getStore();
  if (store) {
    store.nonce = nonce;
  }
  sharedMap.set("nonce", nonce);

  headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  // X-Frame-Options - Protect against clickjacking
  headers.set("X-Frame-Options", "SAMEORIGIN");

  // X-Content-Type-Options - Prevent MIME sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // Referrer-Policy - Privacy for referrers
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy - Limit browser features
  headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=()",
  );

  // COOP - Cross-Origin-Opener-Policy
  headers.set("Cross-Origin-Opener-Policy", "same-origin");

  // Content-Security-Policy (CSP)
  // Note: 'unsafe-inline' for style-src is currently required for Qwik's localized inline styles
  // We allow fonts from google, images from everywhere, and scripts from self or with our nonce.
  if (!import.meta.env.DEV) {
    const csp = buildCsp(
      nonce,
      import.meta.env.PUBLIC_API_URL,
      !!import.meta.env.VITE_CLARITY_ID,
    );
    headers.set("Content-Security-Policy", csp.join("; "));
  }
};
