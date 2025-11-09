# Multi-stage Dockerfile para Backend

# Stage 1: Base
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@8.10.0
WORKDIR /app

# Stage 2: Dependencies
FROM base AS dependencies
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

# Stage 3: Development
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/backend/node_modules ./apps/backend/node_modules
COPY . .
WORKDIR /app/apps/backend
EXPOSE 4000
CMD ["pnpm", "dev"]

# Stage 4: Builder
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/backend/node_modules ./apps/backend/node_modules
COPY . .
WORKDIR /app/apps/backend
RUN pnpm build

# Stage 5: Production
FROM node:18-alpine AS production
RUN apk add --no-cache libc6-compat dumb-init
RUN npm install -g pnpm@8.10.0
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/node_modules ./node_modules

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

EXPOSE 4000

CMD ["dumb-init", "node", "dist/main.js"]
