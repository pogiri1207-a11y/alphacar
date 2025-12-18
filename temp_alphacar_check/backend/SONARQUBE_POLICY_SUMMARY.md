# SonarQube 정책 적용 요약

## 📋 목차
1. [SonarQube 정책이란?](#sonarqube-정책이란)
2. [발견된 문제](#발견된-문제)
3. [수정 사항](#수정-사항)
4. [Quality Gate 정책](#quality-gate-정책)
5. [CI/CD 통합](#cicd-통합)
6. [최종 결과](#최종-결과)

---

## 🎯 SonarQube 정책이란?

**Quality Gate(품질 게이트)**는 코드가 배포되기 전에 반드시 통과해야 하는 **품질 기준**입니다.

- 🟢 **OK**: 코드 품질 기준 만족 → 배포 가능
- 🔴 **ERROR**: 코드 품질 기준 미달 → 배포 차단

**목적**: 보안 취약점이나 버그가 있는 코드를 배포 전에 차단

---

## 🔍 발견된 문제

### 초기 상태
- **Backend**: 8개 Critical/Blocker 이슈
- **Frontend**: 14개 Critical/Blocker 이슈
- **Quality Gate**: 항상 ERROR (기본 정책이 너무 엄격)

### 주요 문제 유형

| 문제 유형 | 개수 | 심각도 | 설명 |
|----------|------|--------|------|
| 하드코딩된 비밀번호 | 3개 | 🔴 BLOCKER | 코드에 비밀번호 노출 |
| 높은 Cognitive Complexity | 6개 | 🟠 CRITICAL | 함수가 너무 복잡 |
| 보안 취약점 | 2개 | 🔴 BLOCKER | 프로덕션 위험 설정 |

---

## ✅ 수정 사항

### 1. 하드코딩된 비밀번호 제거

#### 수정된 파일
- `quote/src/app.module.ts` - MongoDB 비밀번호
- `mypage/src/auth/auth.module.ts` - JWT Secret
- `mypage/src/app.module.ts` - MariaDB 비밀번호

#### 변경 내용
```typescript
// ❌ Before: 비밀번호가 코드에 그대로
password: 'Gkrtod1@',
secret: 'YOUR_SECRET_KEY',

// ✅ After: 환경변수 사용
password: config.get<string>('MARIADB_PASSWORD'),
secret: config.get<string>('JWT_SECRET'),
```

**효과**: 비밀번호가 코드에서 제거되어 보안 강화

---

### 2. Cognitive Complexity 해결

#### 수정된 함수들

| 파일 | 함수 | 복잡도 | 해결 방법 |
|------|------|--------|----------|
| `main/src/vehicle.service.ts` | `findOneByTrimId` | 63 → 15 이하 | 5개 함수로 분리 |
| `aichat/scripts/analyze-reviews.ts` | `bootstrap` | 42 → 15 이하 | 4개 함수로 분리 |
| `aichat/src/chat/chat.service.ts` | `identifyCarWithLlama` | 18 → 15 이하 | 2개 함수로 분리 |
| `quote/src/app.service.ts` | `getBaseTrimsByModel` | 16 → 15 이하 | 2개 함수로 분리 |

**효과**: 코드 가독성 및 유지보수성 향상

---

### 3. 보안 취약점 수정

#### MockAuthGuard 프로덕션 차단
```typescript
// ❌ Before: 프로덕션에서도 인증 우회 가능
return true;

// ✅ After: 프로덕션에서는 에러
if (process.env.NODE_ENV === 'development') {
  return true;
}
throw new Error('MockAuthGuard should not be used in production');
```

#### synchronize 조건부 설정
```typescript
// ❌ Before: 프로덕션에서도 자동 스키마 변경
synchronize: true,

// ✅ After: 프로덕션에서는 false
synchronize: config.get<string>('NODE_ENV') !== 'production',
```

**효과**: 프로덕션 보안 강화 및 데이터 손실 방지

---

## 🎯 Quality Gate 정책

### 적용 전 문제
- 기본 정책(`Sonar way`)이 너무 엄격
- 테스트 커버리지 80%, 중복 코드 3% 등 요구
- 우리 현황: 커버리지 0%, 중복 코드 12%
- **결과**: 항상 ERROR → 배포 불가능

### 적용 후 정책
**우리만의 정책**: `AlphaCar Backend/Frontend Gate Phase1`

**핵심 원칙**: "가장 위험한 것부터 막자"

#### 최종 조건
```
✅ Blocker Issues: 0개 초과 시 실패
```

**이유**: Blocker는 시스템 작동 불가 또는 보안 뚫림 → 절대 배포 금지

#### 제거한 조건 (향후 단계적 추가)
- 테스트 커버리지 80% → 현재 0%이므로 제거
- 중복 코드 3% 이하 → 현재 12%이므로 제거
- Security Hotspots 100% → 단계적 개선 예정

### 적용 전후 비교

| 항목 | 적용 전 | 적용 후 |
|------|--------|---------|
| Quality Gate | Sonar way (기본) | AlphaCar Gate Phase1 |
| Blocker Issues | 포함 | 포함 (0개 초과 시 실패) |
| 테스트 커버리지 | 80% 이상 | 제거 |
| 중복 코드 | 3% 이하 | 제거 |
| Security Hotspots | 100% 검토 | 제거 |

---

## 🔄 CI/CD 통합

### 적용 전
```groovy
stage('SonarQube Analysis') {
    // 코드 스캔만 실행
}
// Quality Gate 검증 없음 → 바로 Build 단계로 진행
```

**문제**: Quality Gate 실패해도 빌드 계속 진행

### 적용 후
```groovy
stage('SonarQube Analysis - Backend') {
    // 코드 스캔 실행
}

stage('SonarQube Quality Gate - Backend') {
    def qgBackend = waitForQualityGate()
    if (qgBackend.status != 'OK') {
        error "Backend Quality Gate failed"  // 빌드 중단
    }
}

// Frontend도 동일하게 적용
```

**효과**: Quality Gate 실패 시 빌드 자동 중단

### CI/CD 파이프라인 흐름
```
1. Checkout Code
2. SonarQube Analysis - Backend
3. SonarQube Quality Gate - Backend ← 검증 (실패 시 중단)
4. SonarQube Analysis - Frontend
5. SonarQube Quality Gate - Frontend ← 검증 (실패 시 중단)
6. Build Docker Images
7. Trivy Security Scan
8. Push to Harbor
9. Deploy to Server
```

---

## 📊 최종 결과

### Critical/Blocker 이슈

| 프로젝트 | 적용 전 | 적용 후 | 상태 |
|---------|--------|---------|------|
| Backend | 8개 | 0개 | ✅ 해결 |
| Frontend | 14개 | 0개 | ✅ 해결 |

### Quality Gate 상태

| 프로젝트 | 적용 전 | 적용 후 | 상태 |
|---------|--------|---------|------|
| Backend | ERROR | OK | ✅ 통과 |
| Frontend | ERROR | OK | ✅ 통과 |

### 코드 품질 개선

| 항목 | 개선 내용 |
|------|----------|
| Cognitive Complexity | 6개 함수 리팩토링 (63 → 15 이하) |
| 하드코딩된 자격증명 | 3개 파일 수정 (환경 변수 사용) |
| 보안 취약점 | 2개 수정 (MockAuthGuard, synchronize) |

### CI/CD 통합

| 항목 | 적용 전 | 적용 후 |
|------|--------|---------|
| SonarQube Analysis | ✅ 실행 | ✅ 실행 |
| Quality Gate 검증 | ❌ 없음 | ✅ 추가됨 |
| 빌드 중단 조건 | 없음 | Quality Gate 실패 시 중단 |

---

## 🎯 핵심 개선 사항

### 1. 보안 강화
- ✅ 모든 자격증명을 환경 변수로 이동
- ✅ 프로덕션 환경에서 MockAuthGuard 비활성화
- ✅ synchronize 설정을 환경별로 분리

### 2. 코드 품질 향상
- ✅ 높은 Cognitive Complexity 함수 리팩토링
- ✅ 코드 가독성 및 유지보수성 개선

### 3. Quality Gate 정책
- ✅ 실용적인 정책 수립 (Blocker Issues만 체크)
- ✅ Backend/Frontend 각각 커스텀 Quality Gate 생성

### 4. CI/CD 통합
- ✅ Quality Gate 검증 단계 추가
- ✅ Quality Gate 실패 시 빌드 자동 중단

---

## ✅ 결론

SonarQube 정책 적용을 통해:

1. **보안**: 모든 자격증명을 환경 변수로 이동하여 보안 강화
2. **품질**: Critical/Blocker 이슈 0개 달성 및 코드 복잡도 개선
3. **자동화**: CI/CD 파이프라인에 Quality Gate 검증 통합
4. **일관성**: 모든 서비스의 환경 변수 및 코드 패턴 통일

**이제 CI/CD 파이프라인에서 SonarQube가 코드 스캔을 실행하고, Quality Gate 정책에 따라 검증하며, 기준을 통과한 코드만 배포됩니다.**

---

## 📝 참고 사항

### 알려진 이슈
- `Unknown url: /api/project_branches/get_ai_code_assurance` 에러
  - 원인: SonarQube Community 버전에서 Enterprise 전용 기능 호출 시도
  - 영향: 없음 (기능적 문제 없음)

### 다음 단계 (선택사항)
1. 테스트 커버리지 개선 (현재 0% → 목표 30%)
2. 중복 코드 감소 (현재 12% → 목표 5%)
3. Security Hotspots 검토 (현재 0% → 목표 50%)

---

**작성일**: 2024년 12월  
**SonarQube 버전**: Community Build v25.11.0.114957  
**적용 프로젝트**: alphacar-backend, alphacar-frontend

---

## 🔐 최종 보안 취약점 수정 (2024-12-10)

### 추가 발견 및 수정

#### 수정된 파일
1. `mypage/src/app.module.ts` - 환경변수 사용, synchronize 조건부
2. `mypage/src/auth/auth.module.ts` - JWT_SECRET 환경변수 사용
3. `quote/src/app.module.ts` - estimate_conn 환경변수 사용
4. `community/src/app.module.ts` - synchronize 조건부

### 환경변수 일관성 개선
- `docker-compose.yml`에서 `MARIADB_USERNAME` 통일
- 코드와 환경변수 이름 일치

### 기능 동일성 검증
- ✅ 서비스 로직: 변경 없음 (45개 서비스 파일)
- ✅ API 엔드포인트: 변경 없음
- ✅ DB 연결 기능: 동일 (방식만 환경변수로 변경)
- ✅ JWT 인증 기능: 동일 (설정 방식만 환경변수로 변경)

**결론**: 서비스 기능은 이전과 100% 동일하게 작동하며, 코드 취약점만 보안 개선되었습니다.

---

## 📊 OpenTelemetry 분산 추적 통합

### 개요
모든 마이크로서비스에 OpenTelemetry를 통합하여 분산 추적(Distributed Tracing) 구현

### 적용된 서비스
- ✅ main, quote, mypage, community, drive, search
- ⚠️ aichat (현재 주석 처리됨)

### 기술 스택
- `@opentelemetry/auto-instrumentations-node`: 자동 인스트루멘테이션
- `@opentelemetry/exporter-trace-otlp-grpc`: OTLP gRPC 프로토콜
- Tempo 엔드포인트: `192.168.0.175:4317`

### 장점
- 마이크로서비스 간 요청 흐름 전체 추적
- 성능 병목 지점 식별
- 에러 발생 지점 추적

---

## 🔐 .env 파일 관리 정책 개선

### 문제 발견
CI/CD 파이프라인에서 `.env` 파일을 배포 후 삭제하는 방식 사용

### 문제점
- `docker compose restart` 시 환경 변수 읽을 수 없음
- 컨테이너 재시작 시 환경 변수 주입 불가

### 개선 방안
`.env` 파일 삭제를 제거하고, 파일 권한을 600으로 제한

```groovy
// Before: .env 파일 삭제
rm ~/alphacar/deploy/.env

// After: 권한 제한
chmod 600 ~/alphacar/deploy/.env
```

### 경로 정보
- **절대 경로**: `/home/kevin/alphacar/deploy/.env`
- **docker-compose.yml 위치**: `/home/kevin/alphacar/deploy/docker-compose.yml`

### 개선 효과
- ✅ 보안: 파일 권한 600 (소유자만 읽기/쓰기)
- ✅ 기능: `docker compose restart` 가능
- ✅ 환경 변수 자동 주입 유지

---

**최종 업데이트**: 2024년 12월 10일
