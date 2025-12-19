# AlphaCar 쿠버네티스 마이그레이션 전략

## 📋 목차
1. [현재 구조 분석](#현재-구조-분석)
2. [쿠버네티스 아키텍처 설계](#쿠버네티스-아키텍처-설계)
3. [단계별 마이그레이션 전략](#단계별-마이그레이션-전략)
4. [주요 변경 사항](#주요-변경-사항)
5. [리소스 요구사항](#리소스-요구사항)
6. [마이그레이션 체크리스트](#마이그레이션-체크리스트)

---

## 🔍 현재 구조 분석

### 현재 인프라 구조 (Docker Compose)

```
┌─────────────────────────────────────────────────┐
│          개발 서버 (192.168.0.160)              │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Docker Compose Stack                    │  │
│  │                                          │  │
│  │  ┌──────────┐  ┌──────────┐            │  │
│  │  │  Nginx   │  │ Traefik  │            │  │
│  │  │  :80/443 │  │  :9090   │            │  │
│  │  └────┬─────┘  └────┬─────┘            │  │
│  │       │             │                   │  │
│  │  ┌────▼─────────────▼─────┐            │  │
│  │  │  Frontend (Next.js)     │            │  │
│  │  └─────────────────────────┘            │  │
│  │                                          │  │
│  │  ┌──────────────────────────────────┐   │  │
│  │  │  Backend Services (7개)          │   │  │
│  │  │  - main (3002)                   │   │  │
│  │  │  - quote (3003) - 3 replicas     │   │  │
│  │  │  - search (3007)                 │   │  │
│  │  │  - mypage (3006)                 │   │  │
│  │  │  - community (3005)              │   │  │
│  │  │  - aichat (4000)                 │   │  │
│  │  │  - drive (3008)                  │   │  │
│  │  └──────────────────────────────────┘   │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ MongoDB      │ │ Redis        │ │ MariaDB      │
│ 192.168.0.201│ │ 192.168.0.175│ │ 외부 서버    │
│ password:123 │ │ password:    │ │              │
│              │ │ k8spass#     │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
         │
         ▼
┌──────────────┐
│ Tempo        │
│ 192.168.0.175│
│ (모니터링)   │
└──────────────┘
```

### 서비스 의존성 구조

#### 데이터베이스 연결
- **MongoDB (192.168.0.201:27017)**
  - 사용 서비스: main, quote, search, aichat, drive
  - 용도: 차량 데이터, 견적 데이터, 검색 인덱스, AI 채팅 벡터 스토어
  - 연결 방식: 직접 연결 (extra_hosts로 호스트명 매핑)

- **Redis (192.168.0.175)**
  - 사용 서비스: main
  - 용도: 최근 본 차량 캐싱
  - 연결 방식: 직접 연결

- **MariaDB (외부 서버)**
  - 사용 서비스: mypage, community, aichat
  - 용도: 사용자 인증, 커뮤니티 게시글
  - 연결 방식: 직접 연결

#### 모니터링
- **OpenTelemetry → Tempo (192.168.0.175:4317)**
  - 모든 백엔드 서비스에서 트레이스 전송
  - OTLP gRPC 프로토콜 사용

#### 레지스트리
- **Harbor (192.168.0.169)**
  - 모든 이미지 저장
  - CI/CD에서 이미지 푸시

### 현재 구조의 특징

#### 장점
- ✅ 단순한 구조 (단일 서버)
- ✅ 빠른 배포 (docker compose up)
- ✅ 쉬운 디버깅
- ✅ 낮은 운영 복잡도

#### 단점
- ❌ 단일 장애점 (서버 하나)
- ❌ 수평 확장 어려움
- ❌ 자동 복구 없음
- ❌ 리소스 격리 부족
- ❌ 롤링 업데이트 어려움

---

## 🏗️ 쿠버네티스 아키텍처 설계

### 목표 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Ingress Controller (Nginx/Traefik)                 │  │
│  │  - HTTP/HTTPS 라우팅                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Namespace: alphacar-production                      │  │
│  │                                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │  Frontend    │  │  Backend     │                │  │
│  │  │  Deployment │  │  Deployments │                │  │
│  │  │  (1 replica)│  │  (1-3 replicas)               │  │
│  │  └──────────────┘  └──────────────┘                │  │
│  │                                                       │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  Services (ClusterIP)                       │   │  │
│  │  │  - frontend-service                         │   │  │
│  │  │  - main-service, quote-service, etc.        │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                       │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  ConfigMaps & Secrets                       │   │  │
│  │  │  - 환경변수 관리                             │   │  │
│  │  │  - 비밀번호 관리                             │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  External Services (외부 연결)                       │  │
│  │  - MongoDB: 192.168.0.201                            │  │
│  │  - Redis: 192.168.0.175                              │  │
│  │  - MariaDB: 외부 서버                                │  │
│  │  - Tempo: 192.168.0.175                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 네임스페이스 구조

```
alphacar-production/
├── frontend
│   ├── Deployment
│   ├── Service
│   └── ConfigMap
│
├── backend-main
│   ├── Deployment
│   ├── Service
│   ├── ConfigMap
│   └── Secret
│
├── backend-quote
│   ├── Deployment (replicas: 3)
│   ├── Service
│   ├── HorizontalPodAutoscaler
│   └── ConfigMap
│
├── backend-search
│   ├── Deployment
│   ├── Service
│   └── ConfigMap
│
├── backend-mypage
│   ├── Deployment
│   ├── Service
│   └── ConfigMap
│
├── backend-community
│   ├── Deployment
│   ├── Service
│   └── ConfigMap
│
├── backend-aichat
│   ├── Deployment
│   ├── Service
│   ├── PersistentVolumeClaim (vector_store)
│   └── ConfigMap
│
└── backend-drive
    ├── Deployment
    ├── Service
    └── ConfigMap
```

---

## 🚀 단계별 마이그레이션 전략

### Phase 1: 준비 단계 (1-2주)

#### 1.1 쿠버네티스 클러스터 구축
- **옵션 A: 온프레미스 Kubernetes**
  - kubeadm으로 클러스터 구축
  - 최소 3개 노드 (Master 1, Worker 2)
  - 리소스: 각 노드 최소 4CPU, 8GB RAM

- **옵션 B: 클라우드 Kubernetes**
  - AWS EKS, GKE, AKS 등
  - 관리형 서비스로 운영 부담 감소

#### 1.2 이미지 레지스트리 확인
- Harbor (192.168.0.169) 접근 가능 여부 확인
- Kubernetes에서 Harbor 인증 설정
- ImagePullSecrets 생성

#### 1.3 외부 서비스 연결 테스트
- MongoDB (192.168.0.201) 연결 테스트
- Redis (192.168.0.175) 연결 테스트
- MariaDB 연결 테스트
- Tempo (192.168.0.175) 연결 테스트

#### 1.4 네트워크 정책 수립
- 외부 서비스 접근을 위한 네트워크 정책
- 서비스 간 통신 정책

---

### Phase 2: 인프라 마이그레이션 (2-3주)

#### 2.1 Ingress Controller 설치
```yaml
# Nginx Ingress Controller 또는 Traefik
apiVersion: v1
kind: Namespace
metadata:
  name: ingress-nginx
---
# Nginx Ingress Controller 설치
# 또는 기존 Traefik을 Kubernetes용으로 마이그레이션
```

#### 2.2 ConfigMap 및 Secret 생성
```yaml
# 예시: MongoDB 연결 정보
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-secret
type: Opaque
stringData:
  host: "192.168.0.201"
  port: "27017"
  user: "admin"
  password: "123"
  database: "alphacar"
---
apiVersion: v1
kind: Secret
metadata:
  name: redis-secret
type: Opaque
stringData:
  host: "192.168.0.175"
  port: "6379"
  password: "k8spass#"
---
apiVersion: v1
kind: Secret
metadata:
  name: mariadb-secret
type: Opaque
stringData:
  host: "211.46.52.151"
  port: "15432"
  username: "team1"
  password: "Gkrtod1@"
  database: "team1"
```

#### 2.3 PersistentVolume 설정
- **aichat 서비스**: vector_store 디렉토리
  - PersistentVolumeClaim 필요
  - NFS 또는 로컬 스토리지 사용

---

### Phase 3: 서비스 마이그레이션 (3-4주)

#### 3.1 순서: Stateless 서비스부터

**1단계: Frontend (가장 단순)**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: alphacar-production
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: 192.168.0.169/alphacar-project/alphacar-frontend:1.0.0
        ports:
        - containerPort: 8000
        env:
        - name: API_URL
          value: "https://alphacar.example.com/api"
        - name: PORT
          value: "8000"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: alphacar-production
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
```

**2단계: Stateless Backend 서비스**
- search, drive, community (외부 DB만 사용)

**3단계: Stateful Backend 서비스**
- main (Redis 사용)
- quote (3 replicas)
- mypage (MariaDB 사용)

**4단계: 특수 서비스**
- aichat (PersistentVolume 필요, AWS Bedrock)

#### 3.2 각 서비스별 Deployment 템플릿

```yaml
# 공통 템플릿 구조
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {service-name}
  namespace: alphacar-production
spec:
  replicas: {replica-count}
  selector:
    matchLabels:
      app: {service-name}
  template:
    metadata:
      labels:
        app: {service-name}
    spec:
      containers:
      - name: {service-name}
        image: 192.168.0.169/alphacar-project/alphacar-{service-name}:{version}
        ports:
        - containerPort: {port}
        env:
        - name: PORT
          value: "{port}"
        - name: SERVICE_NAME
          value: "{service-name}-backend"
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: "http://192.168.0.175:4317"
        envFrom:
        - configMapRef:
            name: {service-name}-config
        - secretRef:
            name: {service-name}-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: {port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: {port}
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: {service-name}-service
  namespace: alphacar-production
spec:
  selector:
    app: {service-name}
  ports:
  - port: 80
    targetPort: {port}
  type: ClusterIP
```

---

### Phase 4: 트래픽 전환 (1주)

#### 4.1 Blue-Green 배포 전략
```
1. Kubernetes에 모든 서비스 배포 (Green)
2. 기존 Docker Compose 유지 (Blue)
3. DNS/Ingress를 점진적으로 전환
4. 모니터링 및 검증
5. 문제 없으면 Blue 종료
```

#### 4.2 Canary 배포 전략
```
1. 10% 트래픽을 Kubernetes로 전환
2. 모니터링 (에러율, 응답 시간)
3. 문제 없으면 50% → 100% 점진적 전환
```

---

## 🔄 주요 변경 사항

### 1. 네트워킹

#### Docker Compose → Kubernetes
- **Before**: `extra_hosts`로 호스트명 매핑
- **After**: ExternalName Service 또는 직접 IP 연결

```yaml
# MongoDB ExternalName Service
apiVersion: v1
kind: Service
metadata:
  name: mongodb-external
spec:
  type: ExternalName
  externalName: 192.168.0.201
  ports:
  - port: 27017
```

또는

```yaml
# 직접 IP 사용 (환경변수)
env:
- name: DATABASE_HOST
  value: "192.168.0.201"
```

### 2. 환경 변수 관리

#### Docker Compose → Kubernetes
- **Before**: `.env` 파일 또는 `docker-compose.yml`의 `environment`
- **After**: ConfigMap + Secret

```yaml
# ConfigMap 예시
apiVersion: v1
kind: ConfigMap
metadata:
  name: main-backend-config
data:
  PORT: "3002"
  SERVICE_NAME: "main-backend"
  OTEL_EXPORTER_OTLP_ENDPOINT: "http://192.168.0.175:4317"
  DATABASE_HOST: "192.168.0.201"
  DATABASE_PORT: "27017"
  DATABASE_NAME: "alphacar"
  REDIS_HOST: "192.168.0.175"
  REDIS_PORT: "6379"
---
# Secret 예시
apiVersion: v1
kind: Secret
metadata:
  name: main-backend-secrets
type: Opaque
stringData:
  DATABASE_USER: "admin"
  DATABASE_PASSWORD: "123"
  REDIS_PASSWORD: "k8spass#"
```

### 3. 볼륨 관리

#### aichat 서비스의 vector_store
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: aichat-vector-store
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
# Deployment에서 사용
volumes:
- name: vector-store
  persistentVolumeClaim:
    claimName: aichat-vector-store
volumeMounts:
- name: vector-store
  mountPath: /app/vector_store
```

### 4. 로드 밸런싱

#### quote 서비스 (3 replicas)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quote-backend
spec:
  replicas: 3  # Docker Compose의 deploy.replicas와 동일
---
apiVersion: v1
kind: Service
metadata:
  name: quote-service
spec:
  selector:
    app: quote-backend
  ports:
  - port: 80
    targetPort: 3003
  type: ClusterIP
  # Kubernetes가 자동으로 로드 밸런싱
```

### 5. Ingress 설정

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: alphacar-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
spec:
  ingressClassName: nginx
  rules:
  - host: alphacar.example.com
    http:
      paths:
      - path: /api/main(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: main-service
            port:
              number: 80
      - path: /api/quote(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: quote-service
            port:
              number: 80
      # ... 기타 경로
```

---

## 📊 리소스 요구사항

### 최소 클러스터 구성

#### Master Node (1개)
- CPU: 2 cores
- Memory: 4GB
- Disk: 20GB

#### Worker Node (2-3개)
- CPU: 4 cores (각)
- Memory: 8GB (각)
- Disk: 50GB (각)

### 서비스별 리소스 요구량

| 서비스 | Replicas | CPU Request | Memory Request | CPU Limit | Memory Limit |
|--------|----------|-------------|----------------|-----------|--------------|
| frontend | 1 | 100m | 256Mi | 500m | 512Mi |
| main | 1 | 200m | 512Mi | 1000m | 1Gi |
| quote | 3 | 200m | 512Mi | 1000m | 1Gi |
| search | 1 | 200m | 512Mi | 1000m | 1Gi |
| mypage | 1 | 200m | 512Mi | 1000m | 1Gi |
| community | 1 | 200m | 512Mi | 1000m | 1Gi |
| aichat | 1 | 500m | 1Gi | 2000m | 2Gi |
| drive | 1 | 200m | 512Mi | 1000m | 1Gi |

**총 리소스 요구량:**
- CPU: 약 2.5 cores (requests 기준)
- Memory: 약 5GB (requests 기준)

---

## ✅ 마이그레이션 체크리스트

### 준비 단계
- [ ] Kubernetes 클러스터 구축
- [ ] Harbor 레지스트리 접근 설정
- [ ] 외부 서비스 연결 테스트
- [ ] 네트워크 정책 수립

### 인프라 단계
- [ ] Ingress Controller 설치
- [ ] ConfigMap 생성 (모든 서비스)
- [ ] Secret 생성 (비밀번호 관리)
- [ ] PersistentVolume 설정 (aichat)

### 서비스 마이그레이션
- [ ] Frontend 배포 및 테스트
- [ ] search, drive, community 배포
- [ ] main, quote, mypage 배포
- [ ] aichat 배포 (PersistentVolume 포함)

### 트래픽 전환
- [ ] Blue-Green 또는 Canary 배포
- [ ] 모니터링 설정
- [ ] 점진적 트래픽 전환
- [ ] 기존 Docker Compose 종료

### 검증
- [ ] 모든 API 엔드포인트 테스트
- [ ] 데이터베이스 연결 확인
- [ ] OpenTelemetry 트레이싱 확인
- [ ] 로드 밸런싱 확인
- [ ] 자동 복구 테스트

---

## 🎯 마이그레이션 전략 요약

### 핵심 원칙
1. **점진적 마이그레이션**: 한 번에 모든 것을 옮기지 않음
2. **무중단 전환**: Blue-Green 또는 Canary 배포
3. **롤백 가능**: 문제 발생 시 즉시 되돌릴 수 있도록
4. **모니터링 강화**: 각 단계마다 철저한 검증

### 예상 소요 시간
- **준비 단계**: 1-2주
- **인프라 마이그레이션**: 2-3주
- **서비스 마이그레이션**: 3-4주
- **트래픽 전환**: 1주
- **총 예상 기간**: 7-10주

### 주요 이점
- ✅ 고가용성 (자동 복구, 다중 복제본)
- ✅ 수평 확장 용이
- ✅ 롤링 업데이트
- ✅ 리소스 격리
- ✅ 자동 스케일링 (HPA)

### 주의사항
- ⚠️ 외부 서비스 연결 (MongoDB, Redis, MariaDB) 유지 필요
- ⚠️ 네트워크 정책 설정 필요
- ⚠️ PersistentVolume 관리 필요 (aichat)
- ⚠️ 초기 학습 곡선 존재

---

**작성일**: 2024년 12월  
**대상 환경**: AlphaCar 프로젝트  
**현재 인프라**: Docker Compose  
**목표 인프라**: Kubernetes

