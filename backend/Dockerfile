# 1. 빌드 단계 (Node 20)
FROM node:20-alpine AS builder
ARG APP_NAME

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g @nestjs/cli

COPY . .

# 1. 심볼릭 링크 생성 (파일 시스템 경로 해결)
RUN ln -s /app/node_modules /app/${APP_NAME}/node_modules
# 2. 전역 타입 설치 (Buffer, process 에러 해결)
RUN npm install -g @types/node

# 👇👇👇 [최종 수정] 모듈 검색 경로 문제 해결 👇👇👇
# 3. 해당 앱의 tsconfig.json을 복사 (사실상 COPY . .에 포함됨)
# 4. tsconfig.json 내부에 baseUrl 설정을 주입하여 모듈 검색 경로를 상위로 변경
RUN sed -i 's/"rootDir": "src",/"rootDir": "src",\n    "baseUrl": "..",/g' ${APP_NAME}/tsconfig.json

# 앱 폴더로 이동 후 빌드
RUN cd ${APP_NAME} && nest build

# 2. 실행 단계
FROM node:20-alpine
ARG APP_NAME

WORKDIR /app
COPY package*.json ./
RUN npm install --production

# 빌드 결과물 가져오기
COPY --from=builder /app/${APP_NAME}/dist ./dist

EXPOSE 3000-4000
CMD ["node", "dist/main"]
