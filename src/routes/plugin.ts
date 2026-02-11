import type { RequestHandler } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = async ({ headers, sharedMap }) => {
  // HSTS - 1 year, include subdomains, preload
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
  // Generate a random nonce for this request
  const nonce = crypto.randomUUID();
  sharedMap.set("nonce", nonce);

  // Note: 'unsafe-inline' for style-src is currently required for Qwik's localized inline styles
  // We allow fonts from google, images from everywhere, and scripts from self or with our nonce.
  const csp = [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`, // Removed 'unsafe-inline', added nonce
    "connect-src 'self' https://vitals.vercel-insights.com https://fonts.googleapis.com https://fonts.gstatic.com https://maps.googleapis.com",
    "frame-src 'self' https://www.google.com https://maps.google.com",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "require-trusted-types-for 'script'",
    "trusted-types default",
  ];

  headers.set("Content-Security-Policy", csp.join("; "));
};
