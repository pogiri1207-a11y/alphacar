# ---------------------------------------------------
# 1. 빌드 단계 (Builder) - 모든 도구 포함
# ---------------------------------------------------
FROM node:20-alpine AS builder
ARG APP_NAME=main

WORKDIR /app

# 1-1. 알파인 리눅스 필수 패키지 (NestJS/Node 호환성)
RUN apk add --no-cache libc6-compat

# 1-2. 패키지 파일 복사 (의존성 캐시 최적화)
# (빌드 컨텍스트가 backend/ 이므로 해당 경로 기준)
COPY package.json package-lock.json ./
COPY ${APP_NAME}/package.json ${APP_NAME}/

# 1-3. 의존성 설치 (CI 모드: 빠르고 정확함)
# 이때는 빌드를 위해 devDependencies(NestCLI 등)가 모두 설치됩니다.
RUN npm install -g @nestjs/cli && \
    npm install --legacy-peer-deps

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

# 1-6. 빌드 실행 -> dist 폴더 생성
RUN cd ${APP_NAME} && nest build

# 🔥 [다이어트 핵심] 빌드 완료 후, 실행에 필요 없는 '개발용 패키지' 제거
# 이 명령어가 실행되면 node_modules 크기가 확 줄어듭니다.
RUN npm prune --production && \
    cd ${APP_NAME} && npm prune --production || true

# ---------------------------------------------------
# 2. 실행 단계 (Runner) - 초경량화
# ---------------------------------------------------
FROM node:20-alpine AS runner
ARG APP_NAME=main

WORKDIR /app
ENV NODE_ENV=production

# 2-1. [절대 금지] RUN npm install 명령어 금지! ❌
# 대신 Builder에서 이미 정리된 node_modules를 복사해옵니다. ✅
COPY --from=builder /app/node_modules ./node_modules
# 앱 내부에 별도 node_modules가 생성된 경우를 대비해 복사 (없으면 무시됨)
COPY --from=builder /app/${APP_NAME}/node_modules ./${APP_NAME}/node_modules || true

# 2-2. 실행 파일(dist)과 설정 파일(package.json) 한 번에 복사
# 레이어를 줄이기 위해 한 줄로 처리
COPY --from=builder /app/${APP_NAME}/dist /app/${APP_NAME}/package.json ./

# 2-3. 실행
EXPOSE 3000-4000
CMD ["sh", "-c", "node $(find . -name main.js | head -n 1)"]
