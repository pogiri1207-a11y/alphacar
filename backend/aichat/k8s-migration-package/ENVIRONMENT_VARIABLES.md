# AlphaCar 환경변수 가이드

## 📋 개요

이 문서는 AlphaCar Kubernetes 환경에서 사용되는 모든 환경변수를 정리합니다.

## 🗂️ 환경변수 분류

### 1. MongoDB (메인 데이터베이스)

**사용 서비스**: main, quote, search, drive, aichat, mypage

| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `DATABASE_HOST` | `192.168.0.201` | MongoDB 호스트 |
| `DATABASE_PORT` | `27017` | MongoDB 포트 |
| `DATABASE_USER` | `admin` | MongoDB 사용자 (메인) |
| `DATABASE_PASSWORD` | `123` | MongoDB 비밀번호 (메인) |
| `DATABASE_NAME` | `alphacar` | 데이터베이스 이름 |

**AI Chat 전용 계정**:
| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `DATABASE_USER` | `proj` | MongoDB 사용자 (AI Chat) |
| `DATABASE_PASSWORD` | `1234` | MongoDB 비밀번호 (AI Chat) |

**Kubernetes Secret**: `mongodb-secret`, `mongodb-aichat-secret`

---

### 2. Redis (캐시)

**사용 서비스**: main

| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `REDIS_HOST` | `192.168.0.175` | Redis 호스트 |
| `REDIS_PORT` | `6379` | Redis 포트 |
| `REDIS_PASSWORD` | `k8spass#` | Redis 비밀번호 |

**Kubernetes Secret**: `redis-secret`

---

### 3. MariaDB (관계형 데이터베이스)

**사용 서비스**: mypage, community

| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `MARIADB_HOST` | `211.46.52.151` | MariaDB 호스트 |
| `MARIADB_PORT` | `15432` | MariaDB 포트 |
| `MARIADB_USERNAME` | `team1` | MariaDB 사용자 |
| `MARIADB_PASSWORD` | `Gkrtod1@` | MariaDB 비밀번호 |
| `MARIADB_DATABASE` | `team1` | 데이터베이스 이름 |
| `MARIADB_TYPE` | `mariadb` | 데이터베이스 타입 |

**Kubernetes Secret**: `mariadb-secret`

---

### 4. JWT (인증)

**사용 서비스**: main, quote, mypage

| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `JWT_SECRET` | `(사용자 지정 필요)` | JWT 서명 키 |

**⚠️ 주의**: 실제 환경에서는 강력한 랜덤 키를 사용해야 합니다.

**Kubernetes Secret**: `jwt-secret`

---

### 5. AWS Bedrock (AI 서비스)

**사용 서비스**: aichat

| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `AWS_REGION` | `us-east-1` | AWS 리전 |
| `AWS_ACCESS_KEY_ID` | `(사용자 지정 필요)` | AWS Access Key |
| `AWS_SECRET_ACCESS_KEY` | `(사용자 지정 필요)` | AWS Secret Key |
| `BEDROCK_GUARDRAIL_ID` | `(사용자 지정 필요)` | Bedrock Guardrail ID |
| `BEDROCK_GUARDRAIL_VERSION` | `DRAFT` | Guardrail 버전 |
| `BEDROCK_EMBEDDING_MODEL_ID` | `amazon.titan-embed-text-v1` | 임베딩 모델 |
| `BEDROCK_MODEL_ID` | `amazon.titan-embed-text-v1` | 임베딩 모델 (동일) |
| `BEDROCK_LLM_MODEL_ID` | `anthropic.claude-3-sonnet-20240229-v1:0` | LLM 모델 |

**Kubernetes Secret**: `aws-bedrock-secret`

---

### 6. OpenTelemetry (모니터링)

**사용 서비스**: 모든 백엔드

| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://192.168.0.175:4317` | Tempo 엔드포인트 |
| `OTEL_LOG_LEVEL` | `debug` | 로그 레벨 |
| `OTEL_DIAG_LEVEL` | `debug` | 진단 레벨 |

**Kubernetes ConfigMap**: `common-config`

---

### 7. 서비스별 설정

#### Frontend
| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `PORT` | `8000` | 서비스 포트 |
| `API_URL` | `https://alphacar.192.168.56.161.nip.io/api` | API 베이스 URL |
| `NEXT_PUBLIC_BASE_URL` | `https://alphacar.192.168.56.161.nip.io` | 퍼블릭 베이스 URL |
| `NEXT_PUBLIC_DOMAIN` | `https://alphacar.192.168.56.161.nip.io` | 도메인 |
| `NODE_ENV` | `production` | Node 환경 |

**Kubernetes ConfigMap**: `frontend-config`

#### Main Backend
| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `PORT` | `3002` | 서비스 포트 |
| `SERVICE_NAME` | `main-backend` | 서비스 이름 |

**Kubernetes ConfigMap**: `main-backend-config`

#### Quote Backend
| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `PORT` | `3003` | 서비스 포트 |
| `SERVICE_NAME` | `quote-backend` | 서비스 이름 |

**Kubernetes ConfigMap**: `quote-backend-config`

#### Search Backend
| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `PORT` | `3007` | 서비스 포트 |
| `SERVICE_NAME` | `search-backend` | 서비스 이름 |

**Kubernetes ConfigMap**: `search-backend-config`

#### MyPage Backend
| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `PORT` | `3006` | 서비스 포트 |
| `SERVICE_NAME` | `mypage-backend` | 서비스 이름 |

**Kubernetes ConfigMap**: `mypage-backend-config`

#### Community Backend
| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `PORT` | `3005` | 서비스 포트 |
| `SERVICE_NAME` | `community-backend` | 서비스 이름 |

**Kubernetes ConfigMap**: `community-backend-config`

#### AI Chat Backend
| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `PORT` | `4000` | 서비스 포트 |
| `SERVICE_NAME` | `aichat-backend` | 서비스 이름 |

**Kubernetes ConfigMap**: `aichat-backend-config`

#### Drive Backend
| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `PORT` | `3008` | 서비스 포트 |
| `SERVICE_NAME` | `drive-backend` | 서비스 이름 |

**Kubernetes ConfigMap**: `drive-backend-config`

---

### 8. MongoDB 호스트 매핑

**사용 서비스**: 모든 MongoDB 사용 서비스

Docker Compose에서는 `extra_hosts`로 관리했던 호스트명을 환경변수로 대체:

| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `MONGODB_PRIMARY` | `192.168.0.201` | Primary 노드 |
| `MONGODB_SECONDARY_1` | `192.168.0.201` | Secondary 노드 1 |
| `MONGODB_SECONDARY_2` | `192.168.0.201` | Secondary 노드 2 |

**Kubernetes ConfigMap**: 각 서비스별 ConfigMap

---

### 9. Harbor Registry (이미지 저장소)

| 환경변수 | 값 | 설명 |
|---------|-----|------|
| `DOCKER_SERVER` | `192.168.0.169` | Harbor 서버 |
| `DOCKER_USERNAME` | `(사용자 지정 필요)` | Harbor 사용자명 |
| `DOCKER_PASSWORD` | `(사용자 지정 필요)` | Harbor 비밀번호 |
| `DOCKER_EMAIL` | `(사용자 지정 필요)` | Harbor 이메일 |

**Kubernetes Secret**: `harbor-registry-secret`

---

## 🔒 Secret 관리

### Secret 생성 방법

1. **터미널 명령어 사용**:
   ```bash
   cd scripts
   vi create-secrets-commands.txt
   # 명령어를 복사하여 실행
   ```

2. **YAML 파일 적용** (값 수정 필요):
   ```bash
   # secrets-templates/ 폴더의 파일을 복사하고 값 변경
   cp secrets-templates/mongodb-secret.yaml.template secrets/mongodb-secret.yaml
   vi secrets/mongodb-secret.yaml
   kubectl apply -f secrets/mongodb-secret.yaml
   ```

### Secret 확인

```bash
# 모든 Secret 목록
kubectl get secrets -n alphacar-production

# 특정 Secret 내용 확인 (Base64 디코딩)
kubectl get secret mongodb-secret -n alphacar-production -o jsonpath='{.data.password}' | base64 -d
```

### Secret 업데이트

```bash
# Secret 삭제 후 재생성
kubectl delete secret mongodb-secret -n alphacar-production
# 그리고 create-secrets-commands.txt의 명령어 다시 실행
```

---

## 🗄️ ConfigMap 관리

### ConfigMap 확인

```bash
# 모든 ConfigMap 목록
kubectl get configmaps -n alphacar-production

# 특정 ConfigMap 내용 확인
kubectl get configmap common-config -n alphacar-production -o yaml
```

### ConfigMap 업데이트

```bash
# YAML 파일 수정 후 적용
vi 02-configmap-common.yaml
kubectl apply -f 02-configmap-common.yaml

# Deployment 재시작 (변경사항 적용)
kubectl rollout restart deployment/main-backend -n alphacar-production
```

---

## ⚠️ 보안 주의사항

1. **Secret 값 변경 필수**:
   - `JWT_SECRET`: 강력한 랜덤 문자열 사용
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: 실제 AWS 키
   - `HARBOR_USERNAME`, `HARBOR_PASSWORD`: 실제 Harbor 인증 정보

2. **Secret 파일 관리**:
   - Git에 Secret 파일 커밋 금지
   - `.gitignore`에 `secrets/` 추가
   - Secret 값을 텍스트 파일로 저장 금지

3. **권한 관리**:
   - Kubernetes RBAC로 Secret 접근 제한
   - 필요한 ServiceAccount만 Secret 접근 허용

---

## 📝 환경변수 우선순위

Kubernetes에서 환경변수 설정 우선순위:

1. **Deployment의 `env`** (가장 높음)
   - Secret에서 참조: `valueFrom.secretKeyRef`
   - ConfigMap에서 참조: `valueFrom.configMapKeyRef`

2. **Deployment의 `envFrom`**
   - ConfigMap 전체: `configMapRef`
   - Secret 전체: `secretRef`

3. **Container 이미지의 기본값** (가장 낮음)

---

**작성일**: 2025-12-16  
**대상 환경**: Kubernetes (192.168.56.161)  
**네임스페이스**: alphacar-production

