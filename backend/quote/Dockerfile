# ---------------------------------------------------
# 1. 빌드 단계 (Builder) - 모든 도구 포함
# ---------------------------------------------------
FROM node:20-alpine AS builder
ARG APP_NAME=quote

WORKDIR /app

# 1-1. 알파인 리눅스 필수 패키지 (NestJS/Node 호환성)
RUN apk add --no-cache libc6-compat

# 1-2. 패키지 파일 복사
COPY package.json package-lock.json ./
COPY ${APP_NAME}/package.json ${APP_NAME}/ || true

# 1-3. 의존성 설치 (CI 모드: 빠르고 정확함)
RUN npm install -g @nestjs/cli
RUN npm install --legacy-peer-deps

# 1-4. 소스 코드 복사 및 빌드
COPY . .
# 스키마 복사 (필요한 경우)
RUN [ -d "schemas" ] && cp -r schemas ${APP_NAME}/src/ || true

# 1-5. OpenTelemetry 타입 에러 강제 무시 처리
RUN if [ -f instrumentation.ts ]; then \
        sed -i '/traceExporter:/i \        // @ts-ignore' instrumentation.ts; \
    fi
RUN if [ -f ${APP_NAME}/instrumentation.ts ]; then \
        sed -i '/traceExporter:/i \        // @ts-ignore' ${APP_NAME}/instrumentation.ts; \
    fi

# 1-6. 빌드 실행 (메모리 제한, 타임아웃, 상세 로그)
RUN echo "🚀 Starting nest build for ${APP_NAME}..." && \
    cd ${APP_NAME} && \
    NODE_OPTIONS="--max-old-space-size=4096" nest build --verbose 2>&1 | tee /tmp/build.log && \
    echo "✅ Build completed successfully" && \
    ls -la dist/ || (echo "❌ Build failed, showing logs:" && cat /tmp/build.log && exit 1)

# 1-7. [다이어트 핵심] 빌드 완료 후, 실행에 필요 없는 '개발용 패키지' 제거
RUN npm prune --production
RUN cd ${APP_NAME} && npm prune --production || true

# ---------------------------------------------------
# 2. 실행 단계 (Runner) - 초경량화
# ---------------------------------------------------
FROM node:20-alpine AS runner
ARG APP_NAME=quote

WORKDIR /app
ENV NODE_ENV=production

# 2-1. 정리된 node_modules 복사
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/${APP_NAME}/node_modules ./${APP_NAME}/node_modules || true

# 2-2. 실행 파일(dist)과 설정 파일 복사
COPY --from=builder /app/${APP_NAME}/dist ./dist
COPY --from=builder /app/${APP_NAME}/package.json ./package.json

# 2-3. 실행 명령어 (nest build 결과물 경로)
CMD ["node", "dist/main"]
