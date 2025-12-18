# AlphaCar Kubernetes 빠른 시작 가이드

## 🚀 5분 안에 배포하기

### 1. 파일 전송 및 압축 해제

```bash
# 192.168.56.161 서버에 파일 업로드 후
cd /home/kevin
tar -xzf alphacar-k8s-migration-package.tar.gz
cd k8s-migration-package
```

### 2. Secret 생성 (가장 중요!)

```bash
# 방법 1: 명령어 파일 참고하여 실행 (권장)
cd scripts
cat create-secrets-commands.txt

# 아래 명령어들을 복사하여 하나씩 실행:
# 1. Namespace 생성
kubectl apply -f ../00-namespace.yaml

# 2. MongoDB, Redis, MariaDB Secrets (이미 설정된 값)
kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-secret
  namespace: alphacar-production
type: Opaque
stringData:
  host: "192.168.0.201"
  port: "27017"
  user: "admin"
  password: "123"
  database: "alphacar"
  uri: "mongodb://admin:123@192.168.0.201:27017/alphacar?authSource=admin"
EOF

kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-aichat-secret
  namespace: alphacar-production
type: Opaque
stringData:
  user: "proj"
  password: "1234"
  uri: "mongodb://proj:1234@192.168.0.201:27017/alphacar?authSource=admin"
EOF

kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: redis-secret
  namespace: alphacar-production
type: Opaque
stringData:
  host: "192.168.0.175"
  port: "6379"
  password: "k8spass#"
EOF

kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: mariadb-secret
  namespace: alphacar-production
type: Opaque
stringData:
  host: "211.46.52.151"
  port: "15432"
  username: "team1"
  password: "Gkrtod1@"
  database: "team1"
  type: "mariadb"
EOF

# 3. JWT Secret (⚠️ 값 변경 필요!)
kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: jwt-secret
  namespace: alphacar-production
type: Opaque
stringData:
  secret: "alphacar-jwt-secret-2025-prod"
EOF

# 4. AWS Bedrock Secret (⚠️ 실제 값으로 변경!)
kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: aws-bedrock-secret
  namespace: alphacar-production
type: Opaque
stringData:
  region: "us-east-1"
  access_key_id: "YOUR-AWS-ACCESS-KEY-ID"
  secret_access_key: "YOUR-AWS-SECRET-ACCESS-KEY"
  guardrail_id: "your-guardrail-id"
  guardrail_version: "DRAFT"
  embedding_model_id: "amazon.titan-embed-text-v1"
  llm_model_id: "anthropic.claude-3-sonnet-20240229-v1:0"
EOF

# 5. Harbor Registry Secret (⚠️ 실제 값으로 변경!)
kubectl create secret docker-registry harbor-registry-secret \
  --docker-server=192.168.0.169 \
  --docker-username=admin \
  --docker-password=your-harbor-password \
  --docker-email=admin@example.com \
  --namespace=alphacar-production
```

### 3. 전체 배포 실행

```bash
cd scripts
./deploy-all.sh
```

### 4. 배포 확인

```bash
# Pod 상태 확인
kubectl get pods -n alphacar-production

# 모두 Running이 될 때까지 대기 (약 2-5분)
kubectl get pods -n alphacar-production -w
```

### 5. 접속 테스트

```bash
# 내부 테스트
kubectl run test --image=curlimages/curl -it --rm -n alphacar-production -- curl http://main-service/health

# 외부 접속 (브라우저)
# http://alphacar.192.168.56.161.nip.io
```

## ✅ 성공 확인

```bash
cd scripts
./verify.sh
```

모든 항목이 ✅ 이면 배포 성공!

## 🔧 문제 발생 시

### ImagePullBackOff
```bash
# Harbor 인증 정보 다시 확인 후 Secret 재생성
kubectl delete secret harbor-registry-secret -n alphacar-production
# 위 Step 2의 Harbor Secret 명령어 다시 실행
```

### CrashLoopBackOff
```bash
# 로그 확인
kubectl logs -n alphacar-production deployment/main-backend

# Secret 값 확인
kubectl get secret mongodb-secret -n alphacar-production -o yaml
```

### PersistentVolume Pending
```bash
# 스토리지 경로 생성
sudo mkdir -p /data/alphacar/vector_store
sudo chmod 777 /data/alphacar/vector_store

# PVC 재생성
kubectl delete pvc aichat-vector-store-pvc -n alphacar-production
kubectl apply -f ../03-pv-aichat-vector-store.yaml
```

## 🔄 롤백

```bash
cd scripts
./rollback.sh
```

---

**더 자세한 내용은 DEPLOYMENT_GUIDE.md를 참고하세요.**

