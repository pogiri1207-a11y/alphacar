#!/bin/bash
# containerd 메타데이터 DB 복구 스크립트

set -e

echo "🔧 containerd 메타데이터 DB 복구 시작..."

echo "1. Docker 중지..."
sudo systemctl stop docker

echo "2. containerd 중지..."
sudo systemctl stop containerd

echo "3. 손상된 메타데이터 디렉토리 삭제..."
sudo rm -rf /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/

echo "4. containerd 시작..."
sudo systemctl start containerd
sleep 2

echo "5. Docker 시작..."
sudo systemctl start docker
sleep 3

echo "6. Docker 상태 확인..."
docker ps

echo "✅ containerd 복구 완료!"
echo ""
echo "이제 롤백을 진행하세요:"
echo "  cd ~/alphacar/deploy"
echo "  docker compose pull"
echo "  docker compose up -d --force-recreate"

