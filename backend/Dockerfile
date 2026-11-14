# ==========================================
# STAGE 1: Builder Stage (Compile TypeScript)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# TypeScript compile
RUN npx tsc --skipLibCheck --noEmitOnError false || true

# ==========================================
# STAGE 2: Production Runner Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

# Production dependencies install කරයි
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# 📁 Uploads folders සාදා Permissions `node` user ට ලබා දීම
RUN mkdir -p /app/uploads/events && chown -R node:node /app/uploads

# 🔒 Non-root user කෙනෙක් ලෙස Run කිරීම
USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]