FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package manifests and install production deps
COPY package.json package-lock.json* ./
RUN npm ci --production || npm install --production

# Copy source
COPY . .

# Build frontend if present
RUN npm run build --if-present || true

ENV PORT=8080
EXPOSE 8080

# Start server (assumes server build outputs to dist/server.cjs)
CMD ["node", "dist/server.cjs"]
