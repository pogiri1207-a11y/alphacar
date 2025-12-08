# 1. 빌드 단계 (Node 20)
FROM node:20-alpine AS builder
ARG APP_NAME

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g @nestjs/cli

# 👇👇👇 [핵심 수정] 환경 변수 설정 👇👇👇
# Node.js에게 node_modules가 있는 상위 폴더를 모듈 검색 경로에 추가하도록 지시합니다.
ENV NODE_PATH=./node_modules/:../node_modules

COPY . .

# 기존 cd 명령어 유지
RUN cd ${APP_NAME} && nest build

# 2. 실행 단계
FROM node:20-alpine
ARG APP_NAME

WORKDIR /app
COPY package*.json ./
RUN npm install --production

# 런타임 환경에도 NODE_PATH 설정 유지
ENV NODE_PATH=./node_modules/:../node_modules

COPY --from=builder /app/${APP_NAME}/dist ./dist

EXPOSE 3000-4000
CMD ["node", "dist/main"]
