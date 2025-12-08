# Use the official Bun image
FROM oven/bun:latest AS base

WORKDIR /app

# Copy only dependency files first (better caching)
COPY package.json bun.lock* ./

# Install dependencies using Bun
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

EXPOSE 3000

# Start the app
CMD ["bun", "run", "start"]