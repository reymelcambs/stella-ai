FROM node:20-slim

WORKDIR /usr/src/app

# Copy package manifests and install ALL deps (devDependencies needed for build)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Generate dummy firebase-applet-config.json (since it is gitignored and not uploaded to builder)
RUN echo '{"apiKey":"","authDomain":"","projectId":"","appId":"","storageBucket":"","messagingSenderId":"","measurementId":"","firestoreDatabaseId":""}' > firebase-applet-config.json

# Build frontend + server bundle (will fail loudly if something is wrong)
RUN npm run build

# Remove devDependencies to shrink the final image
RUN npm prune --production

ENV PORT=8080
EXPOSE 8080

# Start server (assumes server build outputs to dist/server.cjs)
CMD ["node", "dist/server.cjs"]
