# ---------------------------------------------------
# 1. 빌드 단계 (Builder) - 모든 도구 포함
# ---------------------------------------------------
FROM node:20-alpine AS builder
ARG APP_NAME

WORKDIR /app

# 1-1. 알파인 리눅스 필수 패키지 (NestJS/Node 호환성)
RUN apk add --no-cache libc6-compat

# 1-2. 패키지 파일 복사
COPY package.json package-lock.json ./
COPY ${APP_NAME}/package.json ${APP_NAME}/
# package-lock.json 복사 (있을 경우)
RUN if [ -f ${APP_NAME}/package-lock.json ]; then cp ${APP_NAME}/package-lock.json ${APP_NAME}/; fi || true

# 1-3. npm 캐시 정리 및 개발 의존성 포함 전체 설치 (빌드에 필요)
RUN npm cache clean --force || true
RUN npm install -g @nestjs/cli
RUN npm ci --legacy-peer-deps --cache /tmp/.npm

# 1-4. 소스 코드 복사 및 빌드
COPY . .
RUN [ -d "schemas" ] && cp -r schemas ${APP_NAME}/src/ || true
# 서비스별 의존성 설치 (package-lock.json이 있으면 ci, 없으면 install)
RUN cd ${APP_NAME} && \
    if [ -f package-lock.json ]; then \
        npm ci --legacy-peer-deps --cache /tmp/.npm || npm install --legacy-peer-deps --cache /tmp/.npm || true; \
    else \
        npm install --legacy-peer-deps --cache /tmp/.npm || true; \
    fi
RUN cd ${APP_NAME} && nest build

# 1-5. Production 의존성만 별도 설치 (monorepo에서는 루트만 설치하면 충분)
WORKDIR /app
RUN mkdir -p prod-deps
COPY package.json package-lock.json prod-deps/

WORKDIR /app/prod-deps
# Production 의존성만 설치 (devDependencies 제외) - 루트 node_modules만으로 충분
RUN npm ci --omit=dev --legacy-peer-deps --cache /tmp/.npm

# 1-6. npm 캐시 정리 (이미지 크기 절감)
RUN npm cache clean --force || true
WORKDIR /app
RUN rm -rf /tmp/.npm || true

# ---------------------------------------------------
# 2. 실행 단계 (Runner) - 초경량화 (Production 의존성만)
# ---------------------------------------------------
FROM node:20-alpine AS runner
ARG APP_NAME

WORKDIR /app
ENV NODE_ENV=production

# 2-1. Production 의존성만 복사 (devDependencies 제외)
COPY --from=builder /app/prod-deps/node_modules ./node_modules

# 2-2. 서비스별 node_modules는 monorepo 구조에서 불필요
# 루트 node_modules만으로 충분 (각 서비스는 루트 의존성 사용)
RUN mkdir -p ${APP_NAME}

# 2-3. 빌드된 실행 파일 복사 (dist 폴더)
COPY --from=builder /app/${APP_NAME}/dist ./${APP_NAME}/dist
COPY --from=builder /app/${APP_NAME}/package.json ./${APP_NAME}/package.json

# 2-4. 실행 경로 확인 및 실행
# nest build 결과물은 보통 dist/src/main.js 또는 dist/main.js에 생성됨
EXPOSE 3000-4000
CMD ["sh", "-c", "NODE_PATH=/app/node_modules:/app/${APP_NAME}/node_modules node $(find ./${APP_NAME}/dist -name 'main.js' -type f | head -n 1)"]
