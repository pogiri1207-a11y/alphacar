# --- 1단계: 빌드 스테이지 ---
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 루트 의존성 설치
COPY package*.json ./
RUN npm install -g @nestjs/cli && \
    npm install --legacy-peer-deps

# 2. community 의존성 설치 (중요!)
# community 폴더의 package.json을 복사해서 설치합니다.
COPY community/package.json ./community/
RUN cd community && npm install --legacy-peer-deps

# 3. 소스 코드 복사
COPY . .

# 4. 빌드 실행
# --verbose 옵션 제거 및 community 폴더에서 빌드
RUN cd community && \
    echo "🚀 Starting nest build for community..." && \
    NODE_OPTIONS="--max-old-space-size=4096" nest build

# --- 2단계: 실행 스테이지 ---
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat

# 5. 결과물 복사
# community의 결과물을 가져옵니다.
COPY --from=builder /app/community/dist ./dist
COPY --from=builder /app/community/node_modules ./node_modules
COPY --from=builder /app/community/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/main"]
