#!/bin/bash

# AlphaCar Kubernetes 배포 검증 스크립트
# 사용법: ./verify.sh

NAMESPACE="alphacar-production"

echo "=========================================="
echo "AlphaCar Kubernetes 배포 검증"
echo "=========================================="

# 1. Namespace 확인
echo ""
echo "1️⃣  Namespace 확인..."
if kubectl get namespace ${NAMESPACE} &> /dev/null; then
    echo "   ✅ Namespace '${NAMESPACE}' 존재"
else
    echo "   ❌ Namespace '${NAMESPACE}' 없음"
    exit 1
fi

# 2. Secrets 확인
echo ""
echo "2️⃣  Secrets 확인..."
SECRETS=(
    "mongodb-secret"
    "mongodb-aichat-secret"
    "redis-secret"
    "mariadb-secret"
    "jwt-secret"
    "aws-bedrock-secret"
    "harbor-registry-secret"
)

SECRET_OK=0
for secret in "${SECRETS[@]}"; do
    if kubectl get secret ${secret} -n ${NAMESPACE} &> /dev/null; then
        echo "   ✅ ${secret}"
        ((SECRET_OK++))
    else
        echo "   ❌ ${secret}"
    fi
done
echo "   결과: ${SECRET_OK}/${#SECRETS[@]} Secrets"

# 3. ConfigMaps 확인
echo ""
echo "3️⃣  ConfigMaps 확인..."
CONFIGMAPS=(
    "common-config"
    "frontend-config"
    "main-backend-config"
    "quote-backend-config"
    "search-backend-config"
    "mypage-backend-config"
    "community-backend-config"
    "aichat-backend-config"
    "drive-backend-config"
)

CM_OK=0
for cm in "${CONFIGMAPS[@]}"; do
    if kubectl get configmap ${cm} -n ${NAMESPACE} &> /dev/null; then
        echo "   ✅ ${cm}"
        ((CM_OK++))
    else
        echo "   ❌ ${cm}"
    fi
done
echo "   결과: ${CM_OK}/${#CONFIGMAPS[@]} ConfigMaps"

# 4. PersistentVolume 확인
echo ""
echo "4️⃣  PersistentVolume 확인..."
if kubectl get pvc aichat-vector-store-pvc -n ${NAMESPACE} &> /dev/null; then
    PVC_STATUS=$(kubectl get pvc aichat-vector-store-pvc -n ${NAMESPACE} -o jsonpath='{.status.phase}')
    if [ "$PVC_STATUS" = "Bound" ]; then
        echo "   ✅ aichat-vector-store-pvc (Bound)"
    else
        echo "   ⚠️  aichat-vector-store-pvc (${PVC_STATUS})"
    fi
else
    echo "   ❌ aichat-vector-store-pvc 없음"
fi

# 5. Deployments 확인
echo ""
echo "5️⃣  Deployments 확인..."
DEPLOYMENTS=(
    "frontend"
    "main-backend"
    "quote-backend"
    "search-backend"
    "mypage-backend"
    "community-backend"
    "aichat-backend"
    "drive-backend"
)

DEPLOY_OK=0
for deploy in "${DEPLOYMENTS[@]}"; do
    if kubectl get deployment ${deploy} -n ${NAMESPACE} &> /dev/null; then
        READY=$(kubectl get deployment ${deploy} -n ${NAMESPACE} -o jsonpath='{.status.readyReplicas}')
        DESIRED=$(kubectl get deployment ${deploy} -n ${NAMESPACE} -o jsonpath='{.spec.replicas}')
        if [ "$READY" = "$DESIRED" ]; then
            echo "   ✅ ${deploy} (${READY}/${DESIRED})"
            ((DEPLOY_OK++))
        else
            echo "   ⚠️  ${deploy} (${READY:-0}/${DESIRED})"
        fi
    else
        echo "   ❌ ${deploy}"
    fi
done
echo "   결과: ${DEPLOY_OK}/${#DEPLOYMENTS[@]} Deployments Ready"

# 6. Services 확인
echo ""
echo "6️⃣  Services 확인..."
SERVICES=(
    "frontend-service"
    "main-service"
    "quote-service"
    "search-service"
    "mypage-service"
    "community-service"
    "aichat-service"
    "drive-service"
)

SVC_OK=0
for svc in "${SERVICES[@]}"; do
    if kubectl get svc ${svc} -n ${NAMESPACE} &> /dev/null; then
        echo "   ✅ ${svc}"
        ((SVC_OK++))
    else
        echo "   ❌ ${svc}"
    fi
done
echo "   결과: ${SVC_OK}/${#SERVICES[@]} Services"

# 7. Ingress 확인
echo ""
echo "7️⃣  Ingress 확인..."
if kubectl get ingress alphacar-ingress -n ${NAMESPACE} &> /dev/null; then
    ADDRESS=$(kubectl get ingress alphacar-ingress -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    if [ -n "$ADDRESS" ]; then
        echo "   ✅ alphacar-ingress (Address: ${ADDRESS})"
    else
        echo "   ⚠️  alphacar-ingress (Address 대기 중)"
    fi
else
    echo "   ❌ alphacar-ingress 없음"
fi

# 8. Pods 상태 확인
echo ""
echo "8️⃣  Pods 상태..."
echo ""
kubectl get pods -n ${NAMESPACE}

# 9. 이벤트 확인 (최근 10개)
echo ""
echo "9️⃣  최근 이벤트..."
echo ""
kubectl get events -n ${NAMESPACE} --sort-by='.lastTimestamp' | tail -10

# 종합 결과
echo ""
echo "=========================================="
echo "검증 결과 요약"
echo "=========================================="
echo "Secrets:      ${SECRET_OK}/${#SECRETS[@]}"
echo "ConfigMaps:   ${CM_OK}/${#CONFIGMAPS[@]}"
echo "Deployments:  ${DEPLOY_OK}/${#DEPLOYMENTS[@]}"
echo "Services:     ${SVC_OK}/${#SERVICES[@]}"

TOTAL_CHECKS=$((${#SECRETS[@]} + ${#CONFIGMAPS[@]} + ${#DEPLOYMENTS[@]} + ${#SERVICES[@]}))
TOTAL_OK=$((SECRET_OK + CM_OK + DEPLOY_OK + SVC_OK))

if [ "$TOTAL_OK" -eq "$TOTAL_CHECKS" ]; then
    echo ""
    echo "✅ 모든 검증 통과! (${TOTAL_OK}/${TOTAL_CHECKS})"
else
    echo ""
    echo "⚠️  일부 검증 실패 (${TOTAL_OK}/${TOTAL_CHECKS})"
    echo ""
    echo "문제 해결:"
    echo "1. Pod 로그 확인: kubectl logs -n ${NAMESPACE} <pod-name>"
    echo "2. Pod 상세 정보: kubectl describe pod -n ${NAMESPACE} <pod-name>"
    echo "3. 이벤트 확인: kubectl get events -n ${NAMESPACE}"
fi
echo "=========================================="

