const SCRIPT_HASHES = [
  "'sha256-L2VzofRwMKVb7ZeLc29Zs5ei5OG9KJ1eXSwz+w4q4/g='",
  "'sha256-6WHWhiUFSczbUiBvl0gdiF+EeOdPRe66tRIT3FE3E8M='",
  "'sha256-g01uwY0Xp3A6CVmaGXVUZb4BB5+qYIWzHD6zL4NT2+Q='",
  "'sha256-U8Wi5C4OM++NZ4A8DB4yxBO/FitF+ui36Yy1UtYbX48='",
  "'sha256-EwODyXb+JyP/QFEaG9yjy11qmIlA9bcynhiLgeq19to='",
  "'sha256-fEB7sBoAvtPwo71XmsbRDawJ54q8Ylx7LVMiLzf4zYU='",
].join(" ");

export function buildCsp(nonce?: string, apiUrl?: string): string[] {
  const scriptSrc = nonce
    ? `'self' 'nonce-${nonce}' 'unsafe-eval'`
    : "'self' 'unsafe-eval'";

  const connectExtra = apiUrl ? ` ${apiUrl}` : "";

  return [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `script-src ${scriptSrc} https://maps.googleapis.com https://www.clarity.ms https://scripts.clarity.ms ${SCRIPT_HASHES}`,
    `connect-src 'self'${connectExtra} https://vitals.vercel-insights.com https://fonts.googleapis.com https://fonts.gstatic.com https://maps.googleapis.com https://c.clarity.ms https://j.clarity.ms https://www.clarity.ms`,
    "frame-src 'self' https://www.google.com https://maps.google.com",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "require-trusted-types-for 'script'",
    "trusted-types default google-maps google-maps-api google-maps-api-loader google-maps-api#html lit-html dompurify devboards-policy clarity-api 'allow-duplicates'",
  ];
}
