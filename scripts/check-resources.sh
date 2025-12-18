#!/bin/bash

echo "=========================================="
echo "🔍 Kubernetes 리소스 상태 확인"
echo "=========================================="
echo ""

# 1. 노드 리소스 상태
echo "📊 노드별 리소스 할당 상태:"
echo "----------------------------------------"
for node in $(kubectl get nodes -o name | cut -d/ -f2); do
    echo ""
    echo "🖥️  $node:"
    kubectl describe node $node 2>/dev/null | grep -A 5 "Allocated resources:" | tail -4 | sed 's/^/   /'
done

echo ""
echo "=========================================="
echo "⚠️  리소스 제한이 없는 Pod (위험):"
echo "----------------------------------------"
kubectl get pods -A -o json | jq -r '.items[] | select(.spec.containers[0].resources.requests == null or .spec.containers[0].resources.limits == null) | "\(.metadata.namespace)/\(.metadata.name): CPU(\(.spec.containers[0].resources.requests.cpu // "none")/\(.spec.containers[0].resources.limits.cpu // "none")), MEM(\(.spec.containers[0].resources.requests.memory // "none")/\(.spec.containers[0].resources.limits.memory // "none"))"' 2>/dev/null | head -20 || echo "jq not available"

echo ""
echo "=========================================="
echo "🔄 과도한 재시작 Pod (10회 이상):"
echo "----------------------------------------"
kubectl get pods -A -o json | jq -r '[.items[] | select(.status.containerStatuses[0].restartCount > 10)] | .[] | "\(.metadata.namespace)/\(.metadata.name): \(.status.containerStatuses[0].restartCount) restarts"' 2>/dev/null | head -10 || echo "jq not available"

echo ""
echo "=========================================="
echo "💥 OOMKilled Pod:"
echo "----------------------------------------"
kubectl get pods -A -o json | jq -r '.items[] | select(.status.containerStatuses[0].lastState.terminated.reason=="OOMKilled") | "\(.metadata.namespace)/\(.metadata.name): OOMKilled"' 2>/dev/null || echo "No OOMKilled pods found"

echo ""
echo "=========================================="
echo "📈 노드별 메모리 사용률:"
echo "----------------------------------------"
for node in $(kubectl get nodes -o name | cut -d/ -f2); do
    mem_info=$(kubectl describe node $node 2>/dev/null | grep -A 5 "Allocated resources:" | grep memory | awk '{print $2, $3}')
    if [ ! -z "$mem_info" ]; then
        echo "🖥️  $node: $mem_info"
    fi
done

echo ""
echo "=========================================="
echo "⚠️  리소스 부족 경고:"
echo "----------------------------------------"
# 메모리 사용률이 80% 이상인 노드 확인
for node in $(kubectl get nodes -o name | cut -d/ -f2); do
    mem_usage=$(kubectl describe node $node 2>/dev/null | grep -A 5 "Allocated resources:" | grep memory | grep -oE '[0-9]+%' | sed 's/%//')
    if [ ! -z "$mem_usage" ] && [ "$mem_usage" -gt 80 ]; then
        echo "🔴 $node: 메모리 사용률 ${mem_usage}% (위험!)"
    fi
done

echo ""
echo "=========================================="
echo "✅ 리소스 제한이 설정된 Pod:"
echo "----------------------------------------"
kubectl get pods -A -o json | jq -r '.items[] | select(.spec.containers[0].resources.requests != null and .spec.containers[0].resources.limits != null) | "\(.metadata.namespace)/\(.metadata.name): CPU(\(.spec.containers[0].resources.requests.cpu)/\(.spec.containers[0].resources.limits.cpu)), MEM(\(.spec.containers[0].resources.requests.memory)/\(.spec.containers[0].resources.limits.memory))"' 2>/dev/null | head -10 || echo "jq not available"

echo ""
echo "=========================================="

