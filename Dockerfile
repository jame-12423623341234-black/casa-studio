# Build stage
FROM node:20-alpine as builder

WORKDIR /app

COPY package.json bun.lock* ./

# Install dependencies (use npm or bun)
RUN npm install --frozen-lockfile || npm install

COPY . .

# Build the app (creates .output directory)
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

# Expose the port (Nitro defaults to 3000)
EXPOSE 3000

# Start the server
CMD ["node", ".output/server/index.mjs"]
