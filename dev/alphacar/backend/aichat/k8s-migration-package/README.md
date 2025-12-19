# AlphaCar Kubernetes 이관 패키지

## 📦 패키지 개요
192.168.56.161 쿠버네티스 환경으로 AlphaCar 3티어 서비스를 이관하기 위한 완전한 매니페스트 패키지입니다.

## 📋 포함된 내용

### 1. Namespace & Base Configuration
- `00-namespace.yaml`: alphacar-production 네임스페이스
- `00-imagepull-secret.yaml`: Harbor 레지스트리 인증

### 2. Secrets (민감 정보)
- `01-secrets-mongodb.yaml`: MongoDB 연결 정보
- `01-secrets-redis.yaml`: Redis 연결 정보
- `01-secrets-mariadb.yaml`: MariaDB 연결 정보
- `01-secrets-jwt.yaml`: JWT Secret
- `01-secrets-aws.yaml`: AWS Bedrock 인증 정보

### 3. ConfigMaps (설정 정보)
- `02-configmap-common.yaml`: 공통 설정
- `02-configmap-frontend.yaml`: Frontend 설정
- `02-configmap-backend-*.yaml`: 각 백엔드 서비스별 설정

### 4. PersistentVolume (스토리지)
- `03-pv-aichat-vector-store.yaml`: AI Chat Vector Store

### 5. Deployments (서비스 배포)
- `10-deployment-frontend.yaml`: Frontend (Next.js)
- `10-deployment-main.yaml`: Main Backend
- `10-deployment-quote.yaml`: Quote Backend (3 replicas)
- `10-deployment-search.yaml`: Search Backend
- `10-deployment-mypage.yaml`: MyPage Backend
- `10-deployment-community.yaml`: Community Backend
- `10-deployment-aichat.yaml`: AI Chat Backend
- `10-deployment-drive.yaml`: Drive Backend

### 6. Services (네트워크)
- `20-service-*.yaml`: 각 서비스별 ClusterIP Service

### 7. Ingress (외부 노출)
- `30-ingress-nginx.yaml`: Nginx Ingress Controller 설정
- `30-ingress-traefik.yaml`: Traefik Ingress Controller 설정 (선택 사항)

### 8. Monitoring (모니터링)
- `40-alloy-config.yaml`: Grafana Alloy ConfigMap
- `40-alloy-deployment.yaml`: Alloy Agent

### 9. Scripts (배포 스크립트)
- `deploy.sh`: 전체 배포 스크립트
- `rollback.sh`: 롤백 스크립트
- `verify.sh`: 배포 검증 스크립트

## 🚀 배포 순서

### Step 1: 환경변수 설정 (필수)
```bash
# secrets.env 파일을 편집하여 실제 값으로 교체하세요
vi secrets.env
```

**반드시 변경해야 할 값:**
- MongoDB: HOST, USER, PASSWORD
- Redis: HOST, PASSWORD
- MariaDB: HOST, USER, PASSWORD
- AWS Bedrock: ACCESS_KEY_ID, SECRET_ACCESS_KEY
- JWT: JWT_SECRET

### Step 2: Secret 생성
```bash
# Base64 인코딩된 값으로 Secret 생성
./scripts/create-secrets.sh
```

### Step 3: 네임스페이스 및 기본 리소스 배포
```bash
kubectl apply -f 00-namespace.yaml
kubectl apply -f 00-imagepull-secret.yaml
kubectl apply -f 01-secrets-*.yaml
kubectl apply -f 02-configmap-*.yaml
kubectl apply -f 03-pv-*.yaml
```

### Step 4: 백엔드 서비스 배포
```bash
# 순서대로 배포 (의존성 고려)
kubectl apply -f 10-deployment-search.yaml
kubectl apply -f 10-deployment-drive.yaml
kubectl apply -f 10-deployment-community.yaml
kubectl apply -f 10-deployment-main.yaml
kubectl apply -f 10-deployment-quote.yaml
kubectl apply -f 10-deployment-mypage.yaml
kubectl apply -f 10-deployment-aichat.yaml

# Service 생성
kubectl apply -f 20-service-*.yaml
```

### Step 5: Frontend 배포
```bash
kubectl apply -f 10-deployment-frontend.yaml
```

### Step 6: Ingress 설정
```bash
# Nginx Ingress Controller 사용
kubectl apply -f 30-ingress-nginx.yaml
```

### Step 7: 모니터링 설정 (선택 사항)
```bash
kubectl apply -f 40-alloy-config.yaml
kubectl apply -f 40-alloy-deployment.yaml
```

## ✅ 배포 검증

### 1. Pod 상태 확인
```bash
kubectl get pods -n alphacar-production
```

모든 Pod가 `Running` 상태여야 합니다.

### 2. Service 확인
```bash
kubectl get svc -n alphacar-production
```

### 3. Ingress 확인
```bash
kubectl get ingress -n alphacar-production
```

### 4. 로그 확인
```bash
# Frontend 로그
kubectl logs -n alphacar-production deployment/frontend

# Main Backend 로그
kubectl logs -n alphacar-production deployment/main-backend
```

### 5. API 테스트
```bash
# 클러스터 내부에서 테스트
kubectl run test-pod --image=curlimages/curl -it --rm -- sh
curl http://main-service/api/health
```

## 🔧 트러블슈팅

### Pod가 시작되지 않는 경우
```bash
# Pod 상세 정보 확인
kubectl describe pod <pod-name> -n alphacar-production

# 이벤트 확인
kubectl get events -n alphacar-production --sort-by='.lastTimestamp'
```

### ImagePullBackOff 에러
Harbor 레지스트리 인증 확인:
```bash
kubectl get secret harbor-registry-secret -n alphacar-production -o yaml
```

### 데이터베이스 연결 실패
Secret 값 확인:
```bash
kubectl get secret mongodb-secret -n alphacar-production -o yaml
```

## 📊 리소스 요구사항

### 최소 클러스터 구성
- **Master Node**: 2 CPU, 4GB RAM
- **Worker Node (2-3개)**: 각 4 CPU, 8GB RAM

### 총 리소스 요구량
- **CPU Requests**: ~2.5 cores
- **Memory Requests**: ~5GB
- **CPU Limits**: ~10 cores
- **Memory Limits**: ~15GB

### 스토리지
- **AI Chat Vector Store**: 10GB (PersistentVolume)

## 🌐 외부 서비스 연결

이 패키지는 다음 외부 서비스에 연결됩니다:

- **MongoDB**: 192.168.0.201:27017
- **Redis**: 192.168.0.175:6379
- **MariaDB**: 211.46.52.151:15432
- **Tempo (Tracing)**: 192.168.0.175:4317
- **Harbor Registry**: 192.168.0.169

**중요**: 쿠버네티스 클러스터에서 이 IP들에 접근 가능한지 확인하세요.

## 🔄 롤백 방법

### 전체 롤백
```bash
./scripts/rollback.sh
```

### 개별 서비스 롤백
```bash
kubectl rollout undo deployment/main-backend -n alphacar-production
```

## 📝 주의사항

1. **Secret 값 변경 필수**: `secrets.env` 파일의 모든 값을 실제 환경에 맞게 변경하세요.
2. **네트워크 정책**: 외부 서비스(MongoDB, Redis 등)에 대한 네트워크 접근이 허용되어야 합니다.
3. **이미지 버전**: docker-compose.yml의 이미지 버전과 일치하는지 확인하세요.
4. **PersistentVolume**: AI Chat의 vector_store는 영구 스토리지가 필요합니다.

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. Pod 로그: `kubectl logs -n alphacar-production <pod-name>`
2. Pod 상태: `kubectl describe pod -n alphacar-production <pod-name>`
3. 이벤트: `kubectl get events -n alphacar-production`

---

**작성일**: 2025-12-16  
**대상 클러스터**: 192.168.56.161  
**네임스페이스**: alphacar-production

