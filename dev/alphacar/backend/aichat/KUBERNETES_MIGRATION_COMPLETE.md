# AlphaCar Kubernetes 이관 패키지 완료

## 📦 패키지 정보

- **패키지 이름**: alphacar-k8s-migration-package.tar.gz
- **위치**: `/home/kevin/alphacar/backend/aichat/`
- **크기**: 약 14KB (압축)
- **생성일**: 2025-12-16

## 📋 패키지 내용

### 1. 설정 파일 (YAML)
- ✅ `00-namespace.yaml`: Namespace 정의
- ✅ `02-configmap-*.yaml`: 10개 ConfigMap (공통 + 서비스별)
- ✅ `03-pv-aichat-vector-store.yaml`: PersistentVolume
- ✅ `10-deployment-*.yaml`: 8개 Deployment (Frontend + 7개 Backend)
- ✅ `20-services-all.yaml`: 8개 Service 정의
- ✅ `30-ingress-nginx.yaml`: Nginx Ingress 설정

### 2. 스크립트 파일
- ✅ `scripts/create-secrets-commands.txt`: Secret 생성 명령어
- ✅ `scripts/deploy-all.sh`: 전체 배포 스크립트
- ✅ `scripts/rollback.sh`: 롤백 스크립트
- ✅ `scripts/verify.sh`: 배포 검증 스크립트

### 3. 문서 파일
- ✅ `README.md`: 패키지 개요
- ✅ `DEPLOYMENT_GUIDE.md`: 상세 배포 가이드
- ✅ `ENVIRONMENT_VARIABLES.md`: 환경변수 가이드
- ✅ `QUICK_START.md`: 빠른 시작 가이드

## 🎯 포함된 서비스

### Frontend (1개)
1. **frontend**: Next.js (1 replica)

### Backend (7개)
1. **main-backend**: 메인 API (1 replica)
2. **quote-backend**: 견적 서비스 (3 replicas)
3. **search-backend**: 검색 서비스 (1 replica)
4. **mypage-backend**: 마이페이지 (1 replica)
5. **community-backend**: 커뮤니티 (1 replica)
6. **aichat-backend**: AI 채팅 (1 replica, PV 포함)
7. **drive-backend**: 드라이브 (1 replica)

**총 Replica 수**: 10개 (Frontend 1 + Backend 9)

## 🔌 외부 서비스 연결

패키지는 다음 외부 서비스에 연결됩니다:

### 데이터베이스
- **MongoDB**: 192.168.0.201:27017
  - 메인 계정: admin / 123
  - AI Chat 계정: proj / 1234
  
- **Redis**: 192.168.0.175:6379
  - Password: k8spass#
  
- **MariaDB**: 211.46.52.151:15432
  - 계정: team1 / Gkrtod1@

### 인프라
- **Harbor Registry**: 192.168.0.169
- **Tempo (Tracing)**: 192.168.0.175:4317

## 🌐 환경변수 설정

### 이미 설정된 값 (그대로 사용 가능)
- ✅ MongoDB 연결 정보
- ✅ Redis 연결 정보
- ✅ MariaDB 연결 정보
- ✅ OpenTelemetry 엔드포인트
- ✅ 서비스 포트 및 이름

### 사용자 입력 필요 (⚠️ 필수 변경)
- ⚠️ **JWT_SECRET**: JWT 서명 키
- ⚠️ **AWS_ACCESS_KEY_ID**: AWS Access Key
- ⚠️ **AWS_SECRET_ACCESS_KEY**: AWS Secret Key
- ⚠️ **HARBOR_USERNAME**: Harbor 사용자명
- ⚠️ **HARBOR_PASSWORD**: Harbor 비밀번호

자세한 내용은 `ENVIRONMENT_VARIABLES.md` 참고

## 🚀 사용 방법

### 1단계: 파일 전송
```bash
# 로컬에서 192.168.56.161로 전송
scp alphacar-k8s-migration-package.tar.gz kevin@192.168.56.161:/home/kevin/
```

### 2단계: 압축 해제
```bash
# 192.168.56.161 서버에서
cd /home/kevin
tar -xzf alphacar-k8s-migration-package.tar.gz
cd k8s-migration-package
```

### 3단계: Secret 생성
```bash
cd scripts
# create-secrets-commands.txt의 명령어를 복사하여 실행
```

### 4단계: 배포 실행
```bash
./deploy-all.sh
```

### 5단계: 검증
```bash
./verify.sh
```

자세한 내용은 `QUICK_START.md` 또는 `DEPLOYMENT_GUIDE.md` 참고

## 📊 리소스 요구사항

### 최소 클러스터 구성
- **Master Node**: 2 CPU, 4GB RAM
- **Worker Node**: 4 CPU, 8GB RAM (2-3개)

### 총 리소스 요구량
- **CPU Requests**: ~2.5 cores
- **Memory Requests**: ~5GB
- **CPU Limits**: ~10 cores
- **Memory Limits**: ~15GB
- **Storage**: 10GB (AI Chat Vector Store)

## ✅ 배포 체크리스트

- [ ] 192.168.56.161에 Kubernetes 클러스터 구축 완료
- [ ] Nginx Ingress Controller 설치 완료
- [ ] 외부 서비스 접근 가능 (MongoDB, Redis, MariaDB)
- [ ] Harbor 레지스트리 접근 가능
- [ ] 패키지 파일 전송 완료
- [ ] Secret 값 준비 (JWT, AWS, Harbor)
- [ ] 스토리지 경로 생성 (/data/alphacar/vector_store)

## 🔧 트러블슈팅

### 주요 문제 및 해결 방법

1. **ImagePullBackOff**
   - Harbor 인증 정보 확인
   - Secret 재생성

2. **CrashLoopBackOff**
   - 로그 확인: `kubectl logs -n alphacar-production <pod-name>`
   - 데이터베이스 연결 확인
   - Secret 값 검증

3. **PersistentVolume Pending**
   - 스토리지 경로 생성
   - PVC 재생성

4. **Ingress 작동 안 함**
   - Nginx Ingress Controller 설치 확인
   - Ingress 재배포

자세한 내용은 `DEPLOYMENT_GUIDE.md`의 트러블슈팅 섹션 참고

## 📞 지원

### 로그 확인
```bash
# 특정 서비스 로그
kubectl logs -n alphacar-production deployment/main-backend

# 실시간 로그
kubectl logs -f -n alphacar-production deployment/main-backend

# Pod 상세 정보
kubectl describe pod -n alphacar-production <pod-name>
```

### 상태 확인
```bash
# Pod 상태
kubectl get pods -n alphacar-production

# Service 상태
kubectl get svc -n alphacar-production

# Ingress 상태
kubectl get ingress -n alphacar-production

# 이벤트 확인
kubectl get events -n alphacar-production
```

## 🎉 배포 성공 기준

✅ 모든 Pod가 Running 상태  
✅ Frontend 접속 가능 (http://alphacar.192.168.56.161.nip.io)  
✅ API 응답 정상  
✅ 데이터베이스 연결 성공  
✅ 로그에 에러 없음

## 📝 추가 정보

- **Docker Compose → Kubernetes 변환 완료**
- **환경변수 모두 Secret/ConfigMap으로 관리**
- **외부 서비스 연결 설정 완료**
- **Ingress 라우팅 설정 완료**
- **PersistentVolume 설정 완료 (AI Chat)**
- **Health Check 설정 완료 (Liveness/Readiness Probe)**
- **리소스 제한 설정 완료 (Requests/Limits)**

---

**생성일**: 2025-12-16  
**대상 클러스터**: 192.168.56.161 (master password: 123)  
**네임스페이스**: alphacar-production  
**도메인**: alphacar.192.168.56.161.nip.io  
**압축 파일**: alphacar-k8s-migration-package.tar.gz (14KB)

## 🚀 다음 단계

1. 192.168.56.161 서버에 파일 전송
2. 압축 해제 및 Secret 생성
3. 배포 실행
4. 검증 및 테스트
5. 모니터링 설정 (선택 사항)

**축하합니다! 모든 준비가 완료되었습니다!** 🎉

