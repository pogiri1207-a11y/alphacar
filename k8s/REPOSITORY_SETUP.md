# ArgoCD Repository 연결 가이드

## 현재 상황
"+ CONNECT REPO" 버튼을 클릭했는데 SSH 방법이 표시되고 있습니다.

## 해결 방법

### 1단계: 연결 방법 변경

현재 화면에서:
1. **"VIA SSH"** 드롭다운 메뉴를 클릭
2. 드롭다운에서 **"VIA HTTPS"** 또는 **"VIA HTTPS (WITH CREDENTIALS)"** 선택

### 2단계: HTTPS 연결 정보 입력

드롭다운을 HTTPS로 변경하면 다음 필드들이 나타납니다:

**입력할 정보:**

1. **Connection method**: `VIA HTTPS` (또는 필요한 경우 `VIA HTTPS (WITH CREDENTIALS)`)

2. **Repository URL**: 
   ```
   https://github.com/pogiri1207-a11y/alphacar.git
   ```

3. **Project**: 
   ```
   default
   ```

4. **Username** (Private 저장소인 경우만):
   - GitHub 사용자명

5. **Password** (Private 저장소인 경우만):
   - GitHub Personal Access Token
   - 일반 비밀번호가 아닌 **Personal Access Token**을 사용해야 합니다

### 3단계: Public 저장소인 경우

만약 저장소가 Public이라면:
- Username과 Password는 **비워두거나 입력하지 않아도 됩니다**
- Repository URL만 입력하고 CONNECT 버튼 클릭

### 4단계: Private 저장소인 경우

Private 저장소라면 GitHub Personal Access Token이 필요합니다:

1. **GitHub Personal Access Token 생성**:
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - "Generate new token" 클릭
   - `repo` 권한 선택
   - 생성된 토큰 복사 (한 번만 보여집니다!)

2. **ArgoCD에 입력**:
   - Username: GitHub 사용자명
   - Password: 생성한 Personal Access Token

### 5단계: 연결 확인

1. **CONNECT** 버튼 클릭
2. Settings → Repositories 메뉴로 돌아가서
3. 연결된 저장소가 목록에 나타나는지 확인

## 연결 방법 선택 가이드

### VIA HTTPS (권장)
- **장점**: 설정이 간단, Public 저장소는 인증 불필요
- **단점**: Private 저장소는 Personal Access Token 필요
- **사용 시기**: 대부분의 경우 이 방법 사용

### VIA HTTPS (WITH CREDENTIALS)
- **장점**: 저장된 인증 정보 재사용 가능
- **단점**: 추가 설정 필요
- **사용 시기**: 여러 Application에서 같은 저장소를 사용할 때

### VIA SSH
- **장점**: 키 기반 인증, 보안성 높음
- **단점**: SSH 키 설정 필요, 더 복잡
- **사용 시기**: SSH 키가 이미 설정되어 있을 때

## 현재 저장소 확인

저장소가 Public인지 Private인지 확인:
```bash
# GitHub 저장소 URL로 직접 접속해서 확인
# https://github.com/pogiri1207-a11y/alphacar
```

## 문제 해결

### "VIA HTTPS" 옵션이 보이지 않는 경우
- 드롭다운 메뉴를 다시 클릭
- 페이지를 새로고침

### 연결 실패 시
1. Repository URL이 정확한지 확인
2. Private 저장소인 경우 인증 정보 확인
3. 네트워크 연결 확인

### 인증 실패 시
- GitHub Personal Access Token이 올바른지 확인
- Token에 `repo` 권한이 있는지 확인
- Token이 만료되지 않았는지 확인

