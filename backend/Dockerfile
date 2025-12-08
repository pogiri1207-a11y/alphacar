# 1. 빌드 단계 (Node 20)
FROM node:20-alpine AS builder
ARG APP_NAME

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g @nestjs/cli

# 소스 코드 복사
COPY . .

# 1. 각 앱이 상위 node_modules를 찾도록 심볼릭 링크를 생성
RUN ln -s /app/node_modules /app/${APP_NAME}/node_modules

# [제거됨] RUN npm install -g @types/node 명령어 제거! (모듈 경로 혼란 방지)

# 앱 폴더로 이동 후 빌드
RUN cd ${APP_NAME} && nest build

# 2. 실행 단계
FROM node:20-alpine
ARG APP_NAME

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/${APP_NAME}/dist ./dist

EXPOSE 3000-4000
CMD ["node", "dist/main"]
