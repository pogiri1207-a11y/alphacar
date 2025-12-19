# ---------------------------------------------------
# 1. 빌드 단계 (Builder)
# ---------------------------------------------------
FROM node:20-alpine AS builder

# 작업 디렉터리를 루트(/app)로 설정
WORKDIR /app

# 1-1. 알파인 리눅스 필수 패키지
RUN apk add --no-cache libc6-compat

# 1-2. 패키지 파일 복사
COPY package.json package-lock.json ./
COPY mypage/package.json mypage/

# 1-3. 루트 의존성 설치
RUN npm install -g @nestjs/cli
RUN npm install --legacy-peer-deps

# 1-4. [추가됨] mypage 전용 의존성 설치 (이 부분이 빠져서 에러가 났습니다)
RUN cd mypage && npm install --legacy-peer-deps

# 1-5. 소스 코드 복사 (전체 복사)
COPY . .

# 1-6. 스키마 복사 (있을 경우)
RUN [ -d "schemas" ] && cp -r schemas mypage/src/ || true

# 1-7. mypage 빌드 실행
RUN cd mypage && nest build

# 1-8. 프로덕션 용량 최적화
RUN npm prune --production
RUN cd mypage && npm prune --production

# ---------------------------------------------------
# 2. 실행 단계 (Runner)
# ---------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
# MyPage 서비스 포트
ENV PORT=3006

# 2-1. 의존성 복사 (루트 및 mypage 각각)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/mypage/node_modules ./mypage/node_modules

# 2-2. 빌드 결과물 복사
COPY --from=builder /app/mypage/dist ./mypage/dist
COPY --from=builder /app/mypage/package.json ./mypage/

# 2-3. 실행
EXPOSE 3006
CMD ["node", "mypage/dist/main.js"]
