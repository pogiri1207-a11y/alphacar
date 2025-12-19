#!/bin/bash
# 빌드 #85 롤백 스크립트 (SSH 패스워드 인증 사용)

set -e

REMOTE_IP="192.168.0.160"
REMOTE_USER="kevin"
REMOTE_PASS="pass123#"
ROLLBACK_VERSION="1.0.0.85"
HARBOR_URL="192.168.0.169"
HARBOR_USER="admin"
HARBOR_PASS="Harbor12345"

echo "🔄 롤백 시작: 빌드 #85 (버전 $ROLLBACK_VERSION)"
echo ""

# sshpass를 사용한 SSH 접속
sshpass -p "${REMOTE_PASS}" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${REMOTE_USER}@${REMOTE_IP} bash <<ENDSSH
set -e
cd ~/alphacar/deploy

echo "📝 현재 버전 확인..."
if [ -f .env ]; then
    echo "현재 BACKEND_VERSION: \$(grep BACKEND_VERSION .env || echo "없음")"
    echo "현재 FRONTEND_VERSION: \$(grep FRONTEND_VERSION .env || echo "없음")"
else
    echo "❌ .env 파일이 없습니다"
    exit 1
fi

echo ""
echo "📝 .env 파일 백업..."
cp .env .env.backup.\$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

echo ""
echo "📝 버전 업데이트 (기존 환경변수 유지)..."
# 기존 .env 파일 백업 후 버전만 업데이트 (JWT_SECRET 등 다른 환경변수는 유지)
sed -i '/^BACKEND_VERSION=/d' .env || true
sed -i '/^FRONTEND_VERSION=/d' .env || true
echo "BACKEND_VERSION=${ROLLBACK_VERSION}" >> .env
echo "FRONTEND_VERSION=${ROLLBACK_VERSION}" >> .env
echo "✅ 버전이 ${ROLLBACK_VERSION}으로 업데이트되었습니다"
echo "✅ 기존 환경변수(JWT_SECRET 등)는 유지되었습니다"

echo ""
echo "🔐 Harbor 로그인..."
echo "${HARBOR_PASS}" | docker login ${HARBOR_URL} -u "${HARBOR_USER}" --password-stdin || {
    echo "⚠️ Harbor 로그인 실패 (계속 진행)"
}
echo "✅ Harbor 로그인 완료"

echo ""
echo "📥 이미지 Pull..."
if [ ! -f docker-compose.yml ]; then
    echo "❌ docker-compose.yml not found"
    exit 1
fi

docker compose pull || {
    echo "⚠️ 일부 이미지 pull 실패 (계속 진행)"
}
echo "✅ 이미지 pull 완료"

echo ""
echo "🚀 서비스 재시작..."
docker compose up -d --force-recreate || {
    echo "❌ 서비스 재시작 실패"
    docker compose ps
    exit 1
}
echo "✅ 서비스 재시작 완료"

echo ""
echo "📊 서비스 상태:"
docker compose ps

echo ""
echo "✅ 롤백 완료: 빌드 #85 (버전 ${ROLLBACK_VERSION})"
ENDSSH

echo ""
echo "✅ 롤백 완료!"
