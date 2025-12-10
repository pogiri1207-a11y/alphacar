# 1. 빌드 단계 (Node 20)
FROM node:20-alpine AS builder
ARG APP_NAME

WORKDIR /app

# 🔐 빌드 스테이지에서 npm 최신 버전으로 업데이트
RUN npm install -g npm@latest

# 모든 파일 복사
COPY . .

# 글로벌 툴 설치 (Nest CLI 등)
RUN npm install -g @nestjs/cli @types/node

# 👇 schemas 폴더가 있다면, 앱의 src 폴더 안으로 복사
RUN [ -d "schemas" ] && cp -r schemas ${APP_NAME}/src/ || true

# --- MSA 빌드 실행 ---
RUN cd ${APP_NAME} && \
    npm install && \
    ln -s /app/${APP_NAME}/node_modules /app/node_modules && \
    nest build

# 2. 실행 단계 (최종 이미지)
FROM node:20-alpine AS runner
ARG APP_NAME

WORKDIR /app
ENV NODE_ENV=production

# 런타임 파일 복사
COPY --from=builder /app/${APP_NAME}/dist ./dist
COPY --from=builder /app/${APP_NAME}/package.json ./package.json

# 프로덕션 의존성 설치 후, npm(및 내부 취약 라이브러리) 제거
RUN npm install --production && \
    rm -rf /usr/local/lib/node_modules/npm

EXPOSE 3000-4000

# main.js 자동 탐색해서 실행
CMD ["sh", "-c", "node $(find dist -name main.js | head -n 1)"]

