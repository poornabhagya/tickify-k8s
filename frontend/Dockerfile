# ==========================================
# Stage 1: Build Stage (Build React SPA Bundle via Vite)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# ==========================================
# Stage 2: Production Web Server Stage (Nginx)
# ==========================================
FROM nginx:1.25-alpine AS runner


COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]