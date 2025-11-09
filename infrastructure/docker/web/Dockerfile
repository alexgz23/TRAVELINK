# Multi-stage Dockerfile para Frontend Web

# Stage 1: Base
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@8.10.0
WORKDIR /app

# Stage 2: Dependencies
FROM base AS dependencies
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

# Stage 3: Development
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/web/node_modules ./apps/web/node_modules
COPY . .
WORKDIR /app/apps/web
EXPOSE 3000
ENV PORT 3000
CMD ["pnpm", "dev"]

# Stage 4: Builder
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/web/node_modules ./apps/web/node_modules
COPY . .
WORKDIR /app/apps/web

ENV NEXT_TELEMETRY_DISABLED 1

RUN pnpm build

# Stage 5: Production
FROM node:18-alpine AS production
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public

# Standalone build
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["dumb-init", "node", "server.js"]
