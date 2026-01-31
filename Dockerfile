# ARG for version tracking
ARG APP_VERSION=edge

# ==========================================
# Stage 1: Install & Build
# ==========================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json bun.lock tsconfig.json ./
# Copy patches if any
# COPY patches ./patches

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build Qwik app (SSR)
# This typically generates a 'dist' and 'server' folder
RUN bun run build

# ==========================================
# Stage 2: Production Runtime
# ==========================================
FROM oven/bun:1-alpine AS runner

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

WORKDIR /app

# Copy necessary files for runtime
# Qwik with Bun adapter usually needs the server entry script and the dist folder
COPY --from=builder --chown=nextjs:nodejs /app/server ./server
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
# Node modules might be needed if not fully bundled, but Bun adapter often bundles.
# To be safe for dependencies not bundled (like some native modules), we can copy node_modules or install prod deps.
# Usually bun build --target=bun handles it, but Qwik adapter build might be just JS.
# Let's install prod modules only to be safe.
COPY --from=builder --chown=nextjs:nodejs /app/bun.lock ./bun.lock
RUN bun install --frozen-lockfile --production

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Metadata
ARG APP_VERSION
LABEL org.opencontainers.image.version=${APP_VERSION}
LABEL org.opencontainers.image.title="Frontend SSR"
LABEL org.opencontainers.image.vendor="DevBoards"

# User context
USER nextjs

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the Qwik Bun server
# The entry point depends on the output of the adapter. Usually server/entry.bun.js or similar.
CMD ["bun", "run", "serve"]
