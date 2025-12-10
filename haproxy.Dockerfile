# haproxy.Dockerfile (Alpine 기반, 보안패치 적용)
FROM haproxy:2.4-alpine

# 1) apk 실행은 root 권한 필요 -> root로 전환
USER root

# 2) Alpine 패키지 보안 패치 적용 (업데이트 + 업그레이드)
RUN apk update && apk upgrade --no-cache

# 3) 구성파일 복사 (원래 하던 작업)
COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg

# 4) 파일 권한 / 유저 보안(선택) - haproxy 유저가 존재하면 그 유저로 실행되게 함
#    (많은 haproxy 이미지에 haproxy 유저가 있으므로 안전하게 다시 변경)
#    만약 빌드 중 에러나면 이 줄을 주석 처리해보고 테스트 해주세요.
USER haproxy

EXPOSE 80 443

# 기본 이미지가 ENTRYPOINT/CMD를 제공하므로 별도 CMD는 필요 없음.

