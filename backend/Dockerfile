# 1. 빌드 단계
FROM node:18-alpine AS builder
ARG APP_NAME

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# [수정됨] npm이 아니라 npx 입니다! (x에 주의하세요)
RUN npx nest build ${APP_NAME}

# 2. 실행 단계
FROM node:18-alpine
ARG APP_NAME

WORKDIR /app
COPY package*.json ./
RUN npm install --production

# 빌드된 결과물 중 '선택된 앱'만 가져오기
COPY --from=builder /app/dist/apps/${APP_NAME} ./dist

EXPOSE 3000-4000
CMD ["node", "dist/main"]
