# AlphaCar Kubernetes 배포 가이드

## 🎯 목표

192.168.56.161 서버의 쿠버네티스 환경에 AlphaCar 3티어 서비스를 완전히 이관합니다.

## 📋 사전 요구사항

### 1. 쿠버네티스 클러스터
- **버전**: Kubernetes 1.24 이상
- **노드 구성**:
  - Master Node: 2 CPU, 4GB RAM 최소
  - Worker Node: 4 CPU, 8GB RAM 최소 (2-3개 권장)

### 2. 네트워크 접근성
다음 외부 서버들에 접근 가능해야 합니다:
- **MongoDB**: 192.168.0.201:27017
- **Redis**: 192.168.0.175:6379
- **MariaDB**: 211.46.52.151:15432
- **Harbor Registry**: 192.168.0.169
- **Tempo (Monitoring)**: 192.168.0.175:4317

### 3. Ingress Controller
- **Nginx Ingress Controller** 설치 필요
- 설치 명령어:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

### 4. 필수 도구
- `kubectl`: Kubernetes CLI
- `bash`: 배포 스크립트 실행
- `curl`: API 테스트

## 🚀 배포 절차

### Step 0: 패키지 압축 해제
```bash
# 192.168.56.161 서버에 파일 전송 후
cd /home/kevin
tar -xzf alphacar-k8s-migration-package.tar.gz
cd alphacar-k8s-migration-package
```

### Step 1: Secret 생성

**방법 1: 명령어 복사 (권장)**
```bash
cd scripts
# create-secrets-commands.txt 파일을 열고 명령어를 하나씩 복사하여 실행
vi create-secrets-commands.txt

# 또는 한 번에 실행 (환경변수 값 확인 필수!)
bash -c "$(cat create-secrets-commands.txt)"
```

**방법 2: 인터랙티브 스크립트**
```bash
chmod +x create-secrets.sh
./create-secrets.sh
```

**중요**: 다음 Secret 값은 반드시 실제 값으로 변경해야 합니다:
- ✅ MongoDB: 이미 설정됨 (192.168.0.201)
- ✅ Redis: 이미 설정됨 (192.168.0.175)
- ✅ MariaDB: 이미 설정됨 (211.46.52.151)
- ⚠️ **JWT_SECRET**: 반드시 변경 필요
- ⚠️ **AWS_ACCESS_KEY_ID**: 실제 AWS 키 필요
- ⚠️ **AWS_SECRET_ACCESS_KEY**: 실제 AWS 키 필요
- ⚠️ **Harbor Username/Password**: 실제 Harbor 인증 정보 필요

### Step 2: 전체 배포 실행

```bash
cd scripts
chmod +x deploy-all.sh
./deploy-all.sh
```

배포 스크립트는 다음 순서로 진행됩니다:
1. Namespace 생성
2. Secrets 확인
3. ConfigMaps 배포
4. PersistentVolume 배포
5. Backend Deployments 배포 (순차적)
6. Frontend Deployment 배포
7. Services 배포
8. Ingress 배포

**예상 소요 시간**: 약 5-10분

### Step 3: 배포 검증

```bash
chmod +x verify.sh
./verify.sh
```

검증 항목:
- ✅ Namespace 존재 여부
- ✅ 7개 Secrets 확인
- ✅ 9개 ConfigMaps 확인
- ✅ PersistentVolume Bound 상태
- ✅ 8개 Deployments Ready 상태
- ✅ 8개 Services 확인
- ✅ Ingress 확인

### Step 4: Pod 상태 모니터링

```bash
# 실시간 Pod 상태 확인
kubectl get pods -n alphacar-production -w

# 모든 Pod가 Running 상태가 될 때까지 대기
# 예상 시간: 2-5분
```

### Step 5: 로그 확인

```bash
# Frontend 로그
kubectl logs -n alphacar-production deployment/frontend

# Main Backend 로그
kubectl logs -n alphacar-production deployment/main-backend

# Quote Backend 로그 (3개 Pod 중 하나)
kubectl logs -n alphacar-production deployment/quote-backend

# AI Chat Backend 로그
kubectl logs -n alphacar-production deployment/aichat-backend
```

### Step 6: 서비스 테스트

**내부 테스트 (클러스터 내부)**
```bash
# 테스트 Pod 실행
kubectl run test-pod --image=curlimages/curl -it --rm -n alphacar-production -- sh

# Pod 내부에서 테스트
curl http://main-service/health
curl http://quote-service/api/vehicles
curl http://frontend-service/
exit
```

**외부 테스트 (브라우저)**
1. 브라우저에서 접속: http://alphacar.192.168.56.161.nip.io
2. API 테스트: http://alphacar.192.168.56.161.nip.io/api/main/health

### Step 7: Ingress IP 확인

```bash
kubectl get ingress -n alphacar-production

# NAME                CLASS   HOSTS                            ADDRESS         PORTS   AGE
# alphacar-ingress    nginx   alphacar.192.168.56.161.nip.io  192.168.56.161  80      5m
```

## 🔧 트러블슈팅

### 1. Pod가 ImagePullBackOff 상태

**원인**: Harbor Registry 인증 실패

**해결**:
```bash
# Harbor Secret 재생성
kubectl delete secret harbor-registry-secret -n alphacar-production

kubectl create secret docker-registry harbor-registry-secret \
  --docker-server=192.168.0.169 \
  --docker-username=YOUR-USERNAME \
  --docker-password=YOUR-PASSWORD \
  --docker-email=YOUR-EMAIL \
  --namespace=alphacar-production

# Deployment 재시작
kubectl rollout restart deployment/main-backend -n alphacar-production
```

### 2. Pod가 CrashLoopBackOff 상태

**원인**: 데이터베이스 연결 실패 또는 환경변수 오류

**확인**:
```bash
# Pod 로그 확인
kubectl logs -n alphacar-production <pod-name>

# Pod 상세 정보 확인
kubectl describe pod -n alphacar-production <pod-name>

# Secret 값 확인
kubectl get secret mongodb-secret -n alphacar-production -o yaml
```

**해결**:
```bash
# Secret 값이 틀렸다면 재생성
kubectl delete secret mongodb-secret -n alphacar-production
# 그리고 Step 1부터 다시 실행
```

### 3. PersistentVolume이 Pending 상태

**원인**: 스토리지 경로 문제

**해결**:
```bash
# 192.168.56.161 서버에서 디렉토리 생성
sudo mkdir -p /data/alphacar/vector_store
sudo chmod 777 /data/alphacar/vector_store

# PVC 재생성
kubectl delete pvc aichat-vector-store-pvc -n alphacar-production
kubectl apply -f 03-pv-aichat-vector-store.yaml
```

### 4. Ingress가 작동하지 않음

**원인**: Nginx Ingress Controller 미설치

**해결**:
```bash
# Nginx Ingress Controller 설치
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Ingress 재배포
kubectl delete ingress alphacar-ingress -n alphacar-production
kubectl apply -f 30-ingress-nginx.yaml
```

### 5. 외부 서비스 연결 실패

**원인**: 네트워크 접근 불가

**확인**:
```bash
# 클러스터 내부에서 테스트
kubectl run test-net --image=busybox -it --rm -- sh
ping 192.168.0.201
telnet 192.168.0.201 27017
exit
```

**해결**: 방화벽 설정 확인 및 네트워크 정책 조정

## 🔄 롤백

### 전체 롤백
```bash
cd scripts
chmod +x rollback.sh
./rollback.sh
```

### 특정 서비스만 롤백
```bash
./rollback.sh main-backend
```

## 📊 모니터링

### Pod 리소스 사용량 확인
```bash
kubectl top pods -n alphacar-production
```

### 이벤트 확인
```bash
kubectl get events -n alphacar-production --sort-by='.lastTimestamp'
```

### 로그 스트리밍
```bash
# 실시간 로그 확인
kubectl logs -f -n alphacar-production deployment/main-backend
```

## 🎯 배포 완료 체크리스트

- [ ] Namespace 생성 완료
- [ ] 7개 Secrets 생성 완료
- [ ] 9개 ConfigMaps 배포 완료
- [ ] PersistentVolume Bound 상태
- [ ] 8개 Deployments Running 상태
- [ ] 8개 Services 생성 완료
- [ ] Ingress 생성 완료
- [ ] Frontend 접속 가능 (http://alphacar.192.168.56.161.nip.io)
- [ ] API 테스트 성공
- [ ] 로그 정상 출력

## 🌟 성공 기준

✅ **모든 Pod가 Running 상태**
✅ **브라우저에서 Frontend 접속 가능**
✅ **API 응답 정상**
✅ **데이터베이스 연결 성공**
✅ **로그에 에러 없음**

---

**작성일**: 2025-12-16  
**대상 클러스터**: 192.168.56.161  
**네임스페이스**: alphacar-production  
**도메인**: alphacar.192.168.56.161.nip.io

