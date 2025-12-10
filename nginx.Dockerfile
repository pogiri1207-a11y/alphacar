FROM nginx:alpine
# 🔐 Alpine 패키지(libpng, busybox, ssl_client 등) 최신으로 업그레이드
RUN apk update && apk upgrade --no-cache
COPY nginx.conf /etc/nginx/conf.d/default.conf
