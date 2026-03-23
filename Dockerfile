# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Download tldr logo for PWA icons
RUN apk add --no-cache wget && \
    wget -q -O public/logo.png https://raw.githubusercontent.com/tldr-pages/tldr/main/images/logo.png && \
    wget -q -O public/logo.svg https://raw.githubusercontent.com/tldr-pages/tldr/main/images/logo.svg && \
    cp public/logo.png public/icons/icon-192.png && \
    cp public/logo.png public/icons/icon-512.png

RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache git su-exec && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built artifacts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY entrypoint.sh ./

RUN chmod +x entrypoint.sh

# Pre-create the volume mount point with correct ownership so git can write to it
RUN mkdir -p /tldr-pages && chown nextjs:nodejs /tldr-pages

# Volume for persisting tldr-pages data
VOLUME ["/tldr-pages"]

# Entrypoint runs as root to fix volume permissions, then drops to nextjs
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

ENTRYPOINT ["./entrypoint.sh"]
