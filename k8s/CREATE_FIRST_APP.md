# 첫 번째 Application 생성 가이드

Repository 연결이 완료되었으니, 이제 첫 번째 Application을 만들어봅시다!

## 현재 상태
- ✅ Repository 연결 완료
- ✅ Applications 화면 (비어있음)

## 다음 단계: Application 생성

### 1단계: CREATE APPLICATION 버튼 클릭

화면 중앙에 있는 큰 **"CREATE APPLICATION"** 버튼을 클릭하세요.

### 2단계: Application 정보 입력

새 창이나 폼이 나타나면 다음 정보를 입력합니다:

#### GENERAL (일반 정보)

1. **Application Name**:
   ```
   alphacar-main-backend
   ```
   (또는 원하는 이름)

2. **Project Name**:
   - 드롭다운에서 **"default"** 선택

3. **Sync Policy**:
   - **"Automatic"** 선택 (자동 동기화)
   - 또는 **"Manual"** (수동 동기화) 선택 가능

#### SOURCE (소스 정보)

1. **Repository URL**:
   - 드롭다운을 클릭하면 연결한 저장소가 보입니다
   - **"https://github.com/pogiri1207-a11y/alphacar.git"** 선택

2. **Revision** (브랜치/태그):
   ```
   release
   ```
   (또는 `main`, `HEAD` 등)

3. **Path** (매니페스트 경로):
   ```
   k8s/services/main-backend
   ```
   ⚠️ 중요: 이 경로는 Git 저장소 내에서 Kubernetes 매니페스트 파일이 있는 위치입니다!

#### DESTINATION (대상 정보)

1. **Cluster URL**:
   - 드롭다운에서 **"https://kubernetes.default.svc"** 선택
   (또는 기본값으로 이미 선택되어 있을 수 있음)

2. **Namespace**:
   ```
   alphacar
   ```
   (없으면 자동 생성됨)

### 3단계: CREATE 버튼 클릭

모든 정보를 입력한 후 **"CREATE"** 또는 **"CREATE APPLICATION"** 버튼을 클릭합니다.

---

## 매니페스트 파일이 먼저 필요합니다!

⚠️ **중요**: Application을 만들기 전에 Git 저장소에 매니페스트 파일이 있어야 합니다!

### 매니페스트 파일 준비

`k8s/services/main-backend/deployment.yaml` 파일이 필요합니다.

예시:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: main-backend
  namespace: alphacar
spec:
  replicas: 1
  selector:
    matchLabels:
      app: main-backend
  template:
    metadata:
      labels:
        app: main-backend
    spec:
      containers:
      - name: main-backend
        image: 192.168.56.200:30002/alphacar/main:latest
        ports:
        - containerPort: 3002
---
apiVersion: v1
kind: Service
metadata:
  name: main-backend
  namespace: alphacar
spec:
  selector:
    app: main-backend
  ports:
  - port: 3002
    targetPort: 3002
  type: ClusterIP
```

이 파일을 Git 저장소에 커밋하고 푸시해야 합니다.

---

## 화면에서 보이는 필드 설명

### 필수 필드
- **Application Name**: Application의 이름
- **Repository URL**: 연결한 Git 저장소
- **Path**: 매니페스트 파일이 있는 경로
- **Namespace**: 배포할 Kubernetes 네임스페이스

### 선택 필드
- **Sync Policy**: 자동/수동 동기화 설정
- **Revision**: Git 브랜치/태그 (기본값: HEAD)

---

## Application 생성 후

1. Applications 목록에 새 Application이 나타납니다
2. 상태를 확인할 수 있습니다:
   - **Sync Status**: Synced / OutOfSync
   - **Health Status**: Healthy / Progressing / Degraded
3. 클릭하면 상세 정보를 볼 수 있습니다

---

## 문제 해결

### Path를 찾을 수 없다는 에러
- Git 저장소에 해당 경로에 매니페스트 파일이 있는지 확인
- 파일이 있다면 커밋하고 푸시했는지 확인
- 브랜치/태그가 올바른지 확인

### Namespace가 없다는 에러
- ArgoCD 설정에서 `CreateNamespace=true` 옵션 확인
- 또는 수동으로 네임스페이스 생성:
  ```bash
  kubectl create namespace alphacar
  ```

### 이미지 Pull 실패
- 이미지가 Harbor에 있는지 확인
- 이미지 경로가 올바른지 확인
- Harbor 인증 정보 확인

