
# Build Stage: Installs dependencies
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
# Use 'npm ci' for faster, more reliable builds from package-lock.json
RUN npm ci --only=production

# Final Stage: Creates the lean production image
FROM node:18-alpine

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy the pruned node_modules from the 'builder' stage
COPY --from=builder /app/node_modules ./node_modules

# Copy your application source code
# Note: The .dockerignore file will prevent unnecessary files from being copied
COPY . .

EXPOSE 4000
CMD ["node", "index.js"]