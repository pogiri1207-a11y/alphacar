# --- 1단계: 빌드 스테이지 ---
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 루트 의존성 설치
COPY package*.json ./
RUN npm install -g @nestjs/cli && \
    npm install --legacy-peer-deps

# 2. [수정] News 서비스 의존성 설치
# main이 아니라 news 폴더를 복사해야 합니다!
COPY news/package.json ./news/
RUN cd news && npm install --legacy-peer-deps

# 3. 소스 코드 복사
COPY . .

# 4. [수정] 빌드 실행
# main이 아니라 news 폴더로 들어가서 빌드해야 합니다!
RUN cd news && \
    NODE_OPTIONS="--max-old-space-size=4096" nest build

# --- 2단계: 실행 스테이지 ---
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat

# 5. [수정] 결과물 복사
# news 폴더의 결과물을 가져옵니다.
COPY --from=builder /app/news/dist ./dist
COPY --from=builder /app/news/node_modules ./node_modules
COPY --from=builder /app/news/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/main"]

