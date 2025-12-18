#!/bin/bash

# AlphaCar Kubernetes 롤백 스크립트
# 사용법: 
#   ./rollback.sh                # 전체 삭제
#   ./rollback.sh main-backend   # 특정 서비스만 롤백

set -e

NAMESPACE="alphacar-production"
SERVICE_NAME=$1

if [ -z "$SERVICE_NAME" ]; then
    echo "=========================================="
    echo "AlphaCar Kubernetes 전체 삭제"
    echo "=========================================="
    echo ""
    echo "⚠️  경고: 모든 리소스가 삭제됩니다!"
    echo "   계속하시겠습니까? (yes/no)"
    read -r CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        echo "취소되었습니다."
        exit 0
    fi
    
    echo ""
    echo "1️⃣  Ingress 삭제..."
    kubectl delete ingress --all -n ${NAMESPACE} 2>/dev/null || true
    
    echo "2️⃣  Services 삭제..."
    kubectl delete svc --all -n ${NAMESPACE} 2>/dev/null || true
    
    echo "3️⃣  Deployments 삭제..."
    kubectl delete deployment --all -n ${NAMESPACE} 2>/dev/null || true
    
    echo "4️⃣  PersistentVolumeClaims 삭제..."
    kubectl delete pvc --all -n ${NAMESPACE} 2>/dev/null || true
    
    echo "5️⃣  ConfigMaps 삭제..."
    kubectl delete configmap --all -n ${NAMESPACE} 2>/dev/null || true
    
    echo "6️⃣  Secrets 삭제..."
    kubectl delete secret --all -n ${NAMESPACE} 2>/dev/null || true
    
    echo ""
    echo "❓ Namespace도 삭제하시겠습니까? (yes/no)"
    read -r DELETE_NS
    
    if [ "$DELETE_NS" = "yes" ]; then
        echo "7️⃣  Namespace 삭제..."
        kubectl delete namespace ${NAMESPACE} 2>/dev/null || true
    fi
    
    echo ""
    echo "=========================================="
    echo "✅ 롤백 완료!"
    echo "=========================================="
    
else
    echo "=========================================="
    echo "AlphaCar Kubernetes 서비스 롤백"
    echo "Service: ${SERVICE_NAME}"
    echo "=========================================="
    
    echo ""
    echo "1️⃣  ${SERVICE_NAME} Deployment 롤백..."
    kubectl rollout undo deployment/${SERVICE_NAME} -n ${NAMESPACE}
    
    echo "2️⃣  롤백 상태 확인..."
    kubectl rollout status deployment/${SERVICE_NAME} -n ${NAMESPACE}
    
    echo ""
    echo "=========================================="
    echo "✅ ${SERVICE_NAME} 롤백 완료!"
    echo "=========================================="
    echo ""
    echo "현재 상태:"
    kubectl get pods -n ${NAMESPACE} -l app=${SERVICE_NAME}
fi

