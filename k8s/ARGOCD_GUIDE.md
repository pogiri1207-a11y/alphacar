# ArgoCD 완전 초보자 가이드

ArgoCD를 처음 사용하는 분을 위한 단계별 가이드입니다.

## 목차
1. [ArgoCD란?](#argocd란)
2. [ArgoCD 접속 방법](#argocd-접속-방법)
3. [Repository 연결](#repository-연결)
4. [Application 생성 방법](#application-생성-방법)
5. [서비스별 관리](#서비스별-관리)

---

## ArgoCD란?

**ArgoCD**는 Kubernetes용 GitOps 도구입니다. Git 저장소의 Kubernetes 매니페스트를 자동으로 클러스터에 배포하고 동기화합니다.

### 주요 개념

- **Repository**: Git 저장소 (코드와 매니페스트가 있는 곳)
- **Application**: 배포할 애플리케이션 단위
- **Sync**: Git의 변경사항을 클러스터에 반영하는 과정

---

## ArgoCD 접속 방법

### 1. ArgoCD 서버 주소 확인

```bash
kubectl get svc -n argocd argocd-server
```

일반적으로:
- NodePort: `https://192.168.56.200:30001` (HTTPS)
- 또는: `http://192.168.56.200:30954` (HTTP)

### 2. 관리자 비밀번호 확인

```bash
kubectl get secret -n argocd argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d && echo
```

### 3. 웹 UI 접속

1. 브라우저에서 ArgoCD 주소 접속
2. 사용자명: `admin`
3. 비밀번호: 위 명령어로 확인한 값 입력

---

## Repository 연결

ArgoCD가 Git 저장소에서 매니페스트를 가져오려면 Repository를 연결해야 합니다.

### 방법 1: 웹 UI에서 연결

1. **Settings** → **Repositories** 메뉴 클릭
2. **+ CONNECT REPO** 버튼 클릭
3. 다음 정보 입력:
   - **Type**: `git`
   - **Project**: `default`
   - **Repository URL**: `https://github.com/pogiri1207-a11y/alphacar.git`
   - **Branch/Revision**: `release`
   - **Username**: (필요시) GitHub 사용자명
   - **Password**: (필요시) Personal Access Token 또는 비밀번호

4. **CONNECT** 버튼 클릭

### 방법 2: CLI로 연결

```bash
# ArgoCD CLI 로그인
argocd login 192.168.56.200:30001 --username admin --password <비밀번호>

# Repository 추가
argocd repo add https://github.com/pogiri1207-a11y/alphacar.git \
  --name alphacar \
  --type git \
  --branch release
```

### 방법 3: kubectl로 연결

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: alphacar-repo
  namespace: argocd
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  type: git
  url: https://github.com/pogiri1207-a11y/alphacar.git
  password: # GitHub Personal Access Token (필요시)
  username: # GitHub 사용자명 (필요시)
EOF
```

**참고**: Public 저장소는 인증이 필요 없습니다. Private 저장소만 인증이 필요합니다.

---

## Application 생성 방법

### 방법 1: 웹 UI에서 생성

1. **Applications** 메뉴 클릭
2. **+ NEW APP** 버튼 클릭
3. 다음 정보 입력:

   **GENERAL:**
   - **Application Name**: `alphacar-main-backend`
   - **Project Name**: `default`
   - **Sync Policy**: `Automatic` 선택 (자동 동기화)

   **SOURCE:**
   - **Repository URL**: `https://github.com/pogiri1207-a11y/alphacar.git`
   - **Revision**: `release`
   - **Path**: `k8s/services/main-backend` (매니페스트가 있는 경로)

   **DESTINATION:**
   - **Cluster URL**: `https://kubernetes.default.svc`
   - **Namespace**: `alphacar`

4. **CREATE** 버튼 클릭

### 방법 2: YAML 파일로 생성

```bash
kubectl apply -f - <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: alphacar-main-backend
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/pogiri1207-a11y/alphacar.git
    targetRevision: release
    path: k8s/services/main-backend
  destination:
    server: https://kubernetes.default.svc
    namespace: alphacar
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
EOF
```

---

## 서비스별 관리

각 서비스를 독립적인 Application으로 관리하려면:

### 1. 서비스별 매니페스트 준비

각 서비스마다 별도의 디렉토리에 매니페스트 파일을 준비합니다:

```
k8s/
└── services/
    ├── main-backend/
    │   └── deployment.yaml
    ├── aichat-backend/
    │   └── deployment.yaml
    └── frontend/
        └── deployment.yaml
```

### 2. 각 서비스별 Application 생성

각 서비스마다 위의 "Application 생성 방법"을 반복합니다.

또는 한번에 여러 개 생성:

```bash
# 모든 Application 파일이 있다면
kubectl apply -f k8s/applications/
```

---

## 기본적인 매니페스트 예시

### Deployment 예시 (main-backend)

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

이 파일을 `k8s/services/main-backend/deployment.yaml`에 저장합니다.

---

## 단계별 체크리스트

### ✅ 1단계: ArgoCD 접속
- [ ] ArgoCD 웹 UI 접속 확인
- [ ] 관리자 계정으로 로그인

### ✅ 2단계: Repository 연결
- [ ] Settings → Repositories 메뉴 접속
- [ ] Git 저장소 연결 확인

### ✅ 3단계: 네임스페이스 준비
- [ ] alphacar 네임스페이스가 존재하는지 확인
  ```bash
  kubectl get namespace alphacar
  ```
- [ ] 없으면 생성
  ```bash
  kubectl create namespace alphacar
  ```

### ✅ 4단계: 매니페스트 준비
- [ ] 서비스별 매니페스트 파일 준비
- [ ] Git에 커밋 및 푸시

### ✅ 5단계: Application 생성
- [ ] 첫 번째 Application 생성 (예: main-backend)
- [ ] Sync 상태 확인
- [ ] Pod가 정상 실행되는지 확인

### ✅ 6단계: 나머지 서비스 추가
- [ ] 각 서비스별로 Application 생성
- [ ] 모든 Application의 Sync 상태 확인

---

## 유용한 명령어

```bash
# Application 목록 확인
kubectl get application -n argocd

# Application 상세 정보
kubectl get application <app-name> -n argocd -o yaml

# Application 상태 확인
kubectl describe application <app-name> -n argocd

# 수동 동기화 (CLI 사용)
argocd app sync <app-name>

# Repository 목록 확인
argocd repo list

# Repository 테스트
argocd repo get <repo-url>
```

---

## 문제 해결

### Repository 연결 실패
- Public 저장소인지 확인
- Private 저장소라면 인증 정보 확인
- 네트워크 연결 확인

### Application이 Sync되지 않음
- Repository가 제대로 연결되었는지 확인
- 매니페스트 경로가 올바른지 확인
- Git 브랜치/태그가 존재하는지 확인

### Pod가 생성되지 않음
- 네임스페이스가 존재하는지 확인
- 이미지가 존재하는지 확인
- 리소스 제한 확인

---

## 다음 단계

기본적인 설정이 완료되면:
1. 각 서비스별 Application 생성
2. 자동 동기화 설정
3. 헬스 체크 및 모니터링 설정

