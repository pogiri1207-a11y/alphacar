# 0. 공통 베이스: npm을 최신으로 올려서 취약점 줄이기
FROM node:20-alpine AS base
WORKDIR /app

# 🔹 여기서 전역 npm을 최신으로 올림 (cross-spawn / glob / brace-expansion 같이 올라감)
RUN npm install -g npm@latest

# 1. 의존성 설치
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. 실행
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]

