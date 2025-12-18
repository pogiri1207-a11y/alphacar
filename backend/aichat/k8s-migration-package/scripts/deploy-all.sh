#!/bin/bash

# AlphaCar Kubernetes 전체 배포 스크립트
# 사용법: ./deploy-all.sh

set -e

NAMESPACE="alphacar-production"
PACKAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=========================================="
echo "AlphaCar Kubernetes 배포"
echo "Package Dir: ${PACKAGE_DIR}"
echo "=========================================="

cd "${PACKAGE_DIR}"

# Step 1: Namespace 생성
echo ""
echo "1️⃣  Namespace 생성..."
kubectl apply -f 00-namespace.yaml

# Step 2: Secrets 확인
echo ""
echo "2️⃣  Secrets 확인..."
SECRET_COUNT=$(kubectl get secrets -n ${NAMESPACE} 2>/dev/null | grep -E "(mongodb|redis|mariadb|jwt|aws|harbor)" | wc -l)
if [ "$SECRET_COUNT" -lt 6 ]; then
    echo "   ⚠️  Secret이 충분하지 않습니다. (현재: ${SECRET_COUNT}/6)"
    echo "   먼저 ./scripts/create-secrets.sh를 실행하세요."
    exit 1
fi
echo "   ✅ Secrets 확인 완료 (${SECRET_COUNT}개)"

# Step 3: ConfigMaps 배포
echo ""
echo "3️⃣  ConfigMaps 배포..."
kubectl apply -f 02-configmap-common.yaml
kubectl apply -f 02-configmap-frontend.yaml
kubectl apply -f 02-configmap-backend-main.yaml
kubectl apply -f 02-configmap-backend-quote.yaml
kubectl apply -f 02-configmap-backend-search.yaml
kubectl apply -f 02-configmap-backend-mypage.yaml
kubectl apply -f 02-configmap-backend-community.yaml
kubectl apply -f 02-configmap-backend-aichat.yaml
kubectl apply -f 02-configmap-backend-drive.yaml
echo "   ✅ ConfigMaps 배포 완료"

# Step 4: PersistentVolume 배포
echo ""
echo "4️⃣  PersistentVolume 배포..."
kubectl apply -f 03-pv-aichat-vector-store.yaml
echo "   ✅ PersistentVolume 배포 완료"

# Step 5: Backend Deployments 배포 (순서대로)
echo ""
echo "5️⃣  Backend Deployments 배포..."
echo "   - Search Backend..."
kubectl apply -f 10-deployment-search.yaml
sleep 5

echo "   - Drive Backend..."
kubectl apply -f 10-deployment-drive.yaml
sleep 5

echo "   - Community Backend..."
kubectl apply -f 10-deployment-community.yaml
sleep 5

echo "   - Main Backend..."
kubectl apply -f 10-deployment-main.yaml
sleep 5

echo "   - Quote Backend (3 replicas)..."
kubectl apply -f 10-deployment-quote.yaml
sleep 5

echo "   - MyPage Backend..."
kubectl apply -f 10-deployment-mypage.yaml
sleep 5

echo "   - AI Chat Backend..."
kubectl apply -f 10-deployment-aichat.yaml
sleep 10

echo "   ✅ Backend Deployments 배포 완료"

# Step 6: Frontend Deployment 배포
echo ""
echo "6️⃣  Frontend Deployment 배포..."
kubectl apply -f 10-deployment-frontend.yaml
sleep 5
echo "   ✅ Frontend Deployment 배포 완료"

# Step 7: Services 배포
echo ""
echo "7️⃣  Services 배포..."
kubectl apply -f 20-services-all.yaml
echo "   ✅ Services 배포 완료"

# Step 8: Ingress 배포
echo ""
echo "8️⃣  Ingress 배포..."
kubectl apply -f 30-ingress-nginx.yaml
echo "   ✅ Ingress 배포 완료"

# Step 9: 배포 상태 확인
echo ""
echo "=========================================="
echo "✅ 배포 완료!"
echo "=========================================="
echo ""
echo "📊 배포 상태 확인 중..."
echo ""

echo "▶ Pods:"
kubectl get pods -n ${NAMESPACE}
echo ""

echo "▶ Services:"
kubectl get svc -n ${NAMESPACE}
echo ""

echo "▶ Ingress:"
kubectl get ingress -n ${NAMESPACE}
echo ""

echo "=========================================="
echo "🎯 다음 단계:"
echo "=========================================="
echo "1. Pod 상태 확인:"
echo "   kubectl get pods -n ${NAMESPACE} -w"
echo ""
echo "2. 로그 확인:"
echo "   kubectl logs -n ${NAMESPACE} deployment/main-backend"
echo ""
echo "3. 서비스 테스트:"
echo "   kubectl run test-pod --image=curlimages/curl -it --rm -n ${NAMESPACE} -- sh"
echo "   curl http://main-service/health"
echo ""
echo "4. 외부 접속:"
echo "   http://alphacar.192.168.56.161.nip.io"
echo ""

