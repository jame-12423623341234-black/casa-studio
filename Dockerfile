# Build stage
FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json bun.lock* ./

# Install dependencies with bun
RUN bun install --frozen-lockfile

COPY . .

# Build the app (creates .output directory)
RUN bun run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Copy built output and node_modules from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Use dumb-init to handle signals and run the app as the container entrypoint.
# This avoids a broken command override when Railway appends extra args like `port=3000`.
ENTRYPOINT ["dumb-init", "--", "node", ".output/server/index.mjs"]
