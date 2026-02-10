import type { RequestHandler } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = async ({ headers }) => {
  // HSTS - 1 year, include subdomains, preload
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
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
  // Note: 'unsafe-inline' is currently required for Qwik's localized inline styles behavior in some cases
  // and 'unsafe-eval' might be needed for dev mode, but we try to be strict.
  // We allow fonts from google, images from everywhere (user content), and scripts from self.
  const csp = [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Qwik needs unsafe-inline for now; unsafe-eval often needed in dev
    "connect-src 'self' https://vitals.vercel-insights.com https://fonts.googleapis.com https://fonts.gstatic.com", // Add other API origins if needed
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  headers.set("Content-Security-Policy", csp.join("; "));
};
