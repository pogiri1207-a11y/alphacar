# ALPHACAR 프론트엔드 기능명세서

## 목차
1. [개요](#개요)
2. [기술 스택](#기술-스택)
3. [전체 페이지 구조](#전체-페이지-구조)
4. [공통 컴포넌트](#공통-컴포넌트)
5. [페이지별 상세 기능](#페이지별-상세-기능)
6. [API 연동](#api-연동)
7. [상태 관리](#상태-관리)
8. [인증 및 권한](#인증-및-권한)

---

## 개요

ALPHACAR는 자동차 견적 비교 및 구매 플랫폼으로, 사용자가 차량을 검색하고 비교하며 견적을 받을 수 있는 서비스입니다.

### 주요 기능
- 차량 검색 및 비교
- 견적 요청 및 관리
- 커뮤니티 게시판
- 이벤트 및 혜택 안내
- 마이페이지 (견적함, 포인트 관리)
- 소셜 로그인 (카카오, 구글)

---

## 기술 스택

- **Framework**: Next.js 16.0.5
- **Language**: TypeScript / JavaScript
- **UI Library**: React 19.2.0
- **Styling**: Inline Styles (CSS-in-JS)
- **HTTP Client**: Axios, Fetch API
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Next.js App Router

---

## 전체 페이지 구조

```
app/
├── page.tsx                    # 메인 홈페이지
├── layout.js                   # 루트 레이아웃
├── globals.css                 # 전역 스타일
│
├── quote/                      # 견적 비교
│   ├── page.tsx               # 견적 메인 (비교/개별 선택)
│   ├── compare/               # 비교견적
│   │   ├── page.tsx
│   │   ├── result/
│   │   └── vs/
│   └── personal/              # 개별견적
│       ├── page.tsx
│       └── result/
│
├── news/                       # 소식
│   ├── page.tsx              # 소식 메인
│   ├── [id]/                 # 뉴스 상세
│   └── test-drive/           # 시승신청
│
├── community/                  # 커뮤니티
│   ├── page.tsx              # 커뮤니티 메인
│   ├── [id]/                 # 게시글 상세
│   └── write/                # 글쓰기
│
├── event/                      # 이벤트
│   ├── page.tsx              # 이벤트 메인
│   ├── end/                  # 종료된 이벤트
│   ├── blog-review/          # 블로그 리뷰 이벤트
│   ├── discount/             # 할인 이벤트
│   └── recommend/           # 추천 이벤트
│
├── mypage/                     # 마이페이지
│   ├── page.tsx              # 마이페이지 메인
│   ├── login/                # 로그인
│   ├── quotes/               # 견적함
│   └── points/               # 포인트
│
├── consult/                    # 상담
│   └── page.tsx              # 1:1 상담신청
│
├── benefit/                    # 혜택
│   └── page.tsx              # ALPHACAR 가이드
│
├── cashback/                   # 캐시백
│   └── page.tsx
│
├── customer-center/           # 고객센터
│   └── page.tsx
│
├── recent-views/               # 최근본차량
│   └── page.tsx
│
├── favorite/                   # 찜한 차량
│   └── page.tsx
│
├── search/                     # 검색 ⭐
│   └── page.tsx
│
├── space-game/                 # 우주 게임 ⭐
│   └── page.tsx
│
└── components/                 # 공통 컴포넌트
    ├── GlobalHeader.tsx       # 전역 헤더
    ├── Footer.tsx            # 푸터
    ├── CarDetailModal.tsx     # 차량 상세 모달
    ├── SimpleModal.tsx        # 간단한 모달
    ├── MidBanner.tsx          # 중간 배너
    ├── YouTubeSection.tsx      # 유튜브 섹션
    └── BrandTestDriveSection.tsx # 브랜드 시승 섹션
```

---

## 공통 컴포넌트

### 1. GlobalHeader.tsx
**위치**: `app/components/GlobalHeader.tsx`

**기능**:
- 전역 네비게이션 헤더
- 로그인 상태 표시
- 전체메뉴 드롭다운
- 로그아웃 기능

**주요 상태**:
- `isMenuOpen`: 전체메뉴 열림/닫힘
- `userName`: 로그인한 사용자 이름
- `showLogoutModal`: 로그아웃 확인 모달 표시 여부

**메뉴 구조**:
- 견적비교, 소식, 커뮤니티 (GNB)
- 전체메뉴: 견적비교, 소식, 커뮤니티, 이벤트, 마이페이지, 상담, 혜택, 고객센터

### 2. CarDetailModal.tsx
**기능**:
- 차량 상세 정보 모달
- 찜하기 기능
- 견적 요청 버튼

### 3. SimpleModal.tsx
**기능**:
- 확인/취소 모달
- 로그아웃 확인 등에 사용

---

## 페이지별 상세 기능

### 1. 홈페이지 (`/`)
**파일**: `app/page.tsx`

**주요 기능**:
- 배너 캐러셀 (3개 배너 자동 전환)
- 차량 검색 바
- 판매 순위 TOP 10 (국내/외제)
- 브랜드별 필터링
- 차량 목록 그리드 (페이지네이션)
- 찜하기 기능 (하트 아이콘)
- 차량 상세 모달

**상태 관리**:
- `carList`: 차량 목록
- `selectedBrand`: 선택된 브랜드
- `currentPage`: 현재 페이지
- `likedVehicleIds`: 찜한 차량 ID Set
- `selectedCar`: 모달에 표시할 차량

**API 호출**:
- `/api/main`: 차량 목록 조회
- `/api/brands`: 브랜드 목록 조회
- `/api/sales/rankings`: 판매 순위 조회
- `/api/favorites/list`: 찜 목록 조회
- `/api/favorites/toggle`: 찜하기 토글

---

### 2. 견적 비교 (`/quote`)

#### 2-1. 견적 메인 (`/quote`)
**기능**:
- 비교견적/개별견적 선택 화면
- 이미지 버튼으로 각 페이지 이동

#### 2-2. 비교견적 (`/quote/compare`)
**기능**:
- 여러 차량 동시 비교
- 비교 결과 페이지
- 차량 대 차량 상세 비교

#### 2-3. 개별견적 (`/quote/personal`)
**기능**:
- 단일 차량 견적 요청
- 트림/옵션 선택
- 견적 결과 표시
- 견적 저장 기능

**API 호출**:
- `/api/quote`: 견적 초기 데이터
- `/api/quote/save`: 견적 저장

---

### 3. 소식 (`/news`)

**주요 기능**:
- 핫이슈 목록 표시
- 내차와의 데이트 카드 섹션
- 시승기 유튜브 영상 목록
- 유튜브 모달 재생
- 시승신청하기 CTA 버튼

**상태 관리**:
- `activeVideoId`: 재생 중인 유튜브 영상 ID

**하위 페이지**:
- `/news/test-drive`: 시승 신청 페이지
- `/news/[id]`: 뉴스 상세 페이지

---

### 4. 커뮤니티 (`/community`)

**주요 기능**:
- 게시글 목록 표시
- 탭 필터링 (전체/구매고민/오너리뷰)
- 검색 기능
- 페이지네이션
- 글쓰기 버튼
- 고정 공지 표시

**상태 관리**:
- `activeTab`: 활성 탭
- `searchText`: 검색어
- `posts`: 게시글 목록
- `currentPage`: 현재 페이지

**하위 페이지**:
- `/community/write`: 글쓰기 페이지
- `/community/[id]`: 게시글 상세 페이지

**API 호출**:
- `/api/community`: 게시글 목록 조회
- `/api/community/write`: 게시글 작성

---

### 5. 이벤트 (`/event`)

**주요 기능**:
- 진행중/종료된 이벤트 탭 전환
- 이벤트 카드 그리드 표시
- 종료된 이벤트 블러 처리
- 이벤트 상세 페이지 링크

**상태 관리**:
- `activeTab`: 진행중/종료된 탭

**하위 페이지**:
- `/event/blog-review`: 블로그 리뷰 이벤트
- `/event/recommend`: 추천 이벤트
- `/event/discount`: 할인 이벤트
- `/event/end`: 종료된 이벤트 목록

---

### 6. 마이페이지 (`/mypage`)

**주요 기능**:
- 로그인 상태 확인
- 소셜 로그인 처리 (카카오/구글)
- 사용자 프로필 표시
- 견적함/포인트 카드
- 로그아웃 기능
- 환영 모달

**상태 관리**:
- `user`: 사용자 정보
- `checkedAuth`: 인증 확인 완료 여부
- `estimateCount`: 견적 개수
- `showWelcomeModal`: 환영 모달 표시
- `showLogoutModal`: 로그아웃 확인 모달

**하위 페이지**:
- `/mypage/login`: 로그인 페이지
- `/mypage/quotes`: 견적함
- `/mypage/points`: 포인트 관리

**API 호출**:
- `/api/mypage`: 마이페이지 정보 조회
- `/api/estimate/count`: 견적 개수 조회
- `/auth/kakao-login`: 카카오 로그인
- `/auth/google-login`: 구글 로그인

---

### 7. 상담 (`/consult`)

**주요 기능**:
- 1:1 상담신청 폼
- 폼 유효성 검사
- 상담 신청 제출

**폼 필드**:
- 이름 (필수)
- 연락처 (필수)
- 이메일
- 관심 차종
- 예산
- 상담 유형
- 희망 상담 날짜/시간
- 상담 내용 (필수)
- 개인정보 동의 (필수)

---

### 8. 혜택 (`/benefit`)

**주요 기능**:
- ALPHACAR 가이드 안내
- 혜택 설명 섹션
- 비교견적 CTA 버튼

---

### 9. 캐시백 (`/cashback`)

**주요 기능**:
- 카드별 캐시백 정보 표시
- 결제금액별 혜택 테이블
- 오늘 날짜 자동 표시
- 유의사항 안내

**카드 종류**:
- A 카드
- T 카드
- H 카드
- W 카드
- B 카드

---

### 10. 고객센터 (`/customer-center`)

**기능**: 고객센터 안내 페이지

---

### 11. 최근본차량 (`/recent-views`)

**주요 기능**:
- 최근 본 차량 목록 표시
- 차량 클릭 시 개별견적 페이지로 이동
- 빈 목록 안내

**API 호출**:
- `/api/recent-views`: 최근 본 차량 목록 조회

---

### 12. 찜한 차량 (`/favorite`)

**주요 기능**:
- 찜한 차량 목록 표시
- 차량 상세 모달
- 빈 목록 안내
- 로그인 체크

**API 호출**:
- `/api/favorites/list`: 찜 목록 조회

---

### 13. 검색 (`/search`) ⭐ 신규

**주요 기능**:
- 검색어로 차량 검색
- 검색 결과 목록 표시
- 차량 상세 정보 표시 (가격, 출시일, 배기량, 복합연비)
- 개별견적 페이지로 이동

**상태 관리**:
- `cars`: 검색 결과 차량 목록
- `loading`: 로딩 상태

**API 호출**:
- `/api/search`: 차량 검색

**URL 파라미터**:
- `keyword`: 검색어

---

### 14. 우주 게임 (`/space-game`) ⭐ 신규

**주요 기능**:
- 별잡기 게임
- 제한 시간 20초
- 점수 카운트
- 게임 진행도 표시
- 다시하기 기능
- 메인으로 돌아가기 버튼

**상태 관리**:
- `status`: 게임 상태 (ready/playing/end)
- `timeLeft`: 남은 시간
- `score`: 점수
- `starPos`: 별 위치

**게임 규칙**:
- 20초 동안 움직이는 별을 클릭
- 별은 0.6초마다 랜덤 위치로 이동
- 클릭할 때마다 점수 +1

---

## API 연동

### API 구조
모든 API는 `/api` 프리픽스를 통해 프록시됩니다.

### 주요 API 엔드포인트

#### 1. 메인 서비스 (Port 3002)
- `GET /api/main`: 차량 목록 조회
- `GET /api/brands`: 브랜드 목록 조회
- `GET /api/sales/rankings`: 판매 순위 조회

#### 2. 견적 서비스 (Port 3003)
- `GET /api/quote`: 견적 초기 데이터
- `POST /api/quote/save`: 견적 저장

#### 3. 뉴스 서비스 (Port 3004)
- `GET /api/news`: 뉴스 목록 조회

#### 4. 커뮤니티 서비스 (Port 3005)
- `GET /api/community`: 게시글 목록 조회
- `POST /api/community/write`: 게시글 작성

#### 5. 마이페이지 서비스 (Port 3006)
- `GET /api/mypage`: 마이페이지 정보 조회
- `GET /api/estimate/count`: 견적 개수 조회

#### 6. 검색 서비스 (Port 3007)
- `GET /api/search`: 차량 검색

#### 7. 기타
- `GET /api/favorites/list`: 찜 목록 조회
- `POST /api/favorites/toggle`: 찜하기 토글
- `GET /api/recent-views`: 최근 본 차량 조회

### 인증
- JWT 토큰: `localStorage.getItem('accessToken')`
- 소셜 ID: `localStorage.getItem('user_social_id')`
- Authorization 헤더: `Bearer {token}`

---

## 상태 관리

### 로컬 스토리지 사용
- `alphacarUser`: 사용자 정보 (JSON)
- `accessToken`: JWT 토큰
- `user_social_id`: 소셜 로그인 ID
- `alphacar_user_id`: 비회원 ID
- `alphacarWelcomeName`: 환영 메시지용 이름

### React Hooks 사용
- `useState`: 컴포넌트 내부 상태 관리
- `useEffect`: 사이드 이펙트 처리
- `useRouter`: Next.js 라우팅
- `useSearchParams`: URL 파라미터 읽기

---

## 인증 및 권한

### 로그인 방식
1. **카카오 로그인**
   - OAuth 인증 코드 받기
   - `/auth/kakao-login` API 호출
   - 토큰 및 사용자 정보 저장

2. **구글 로그인**
   - OAuth 인증 코드 받기
   - `/auth/google-login` API 호출
   - 토큰 및 사용자 정보 저장

### 인증 체크
- 마이페이지 접근 시 자동 인증 확인
- 찜하기 기능은 로그인 필수
- 로그인하지 않은 경우 로그인 페이지로 리다이렉트

### 로그아웃
- 로컬 스토리지 모든 인증 정보 삭제
- 메인 페이지 또는 로그인 페이지로 이동

---

## 주요 기능 상세

### 1. 차량 검색
- 메인 페이지 검색 바
- 검색 결과 페이지 (`/search`)
- 브랜드 필터링
- 키워드 검색

### 2. 찜하기 기능
- 차량 카드 하트 아이콘 클릭
- 로그인 필수
- 찜 목록 페이지에서 확인 가능

### 3. 견적 관리
- 견적 요청 및 저장
- 마이페이지에서 견적함 확인
- 견적 개수 표시

### 4. 커뮤니티
- 게시글 작성/조회
- 카테고리별 필터링
- 검색 기능
- 페이지네이션

### 5. 이벤트
- 진행중/종료된 이벤트 구분
- 이벤트 상세 페이지 링크

---

## UI/UX 특징

### 반응형 디자인
- 모바일/태블릿/데스크톱 대응
- 그리드 레이아웃 사용

### 인터랙션
- 호버 효과
- 모달 팝업
- 로딩 상태 표시
- 에러 처리

### 스타일링
- Inline Styles 사용
- 일관된 색상 팔레트
- 그라데이션 효과
- 그림자 및 보더 스타일

---

## 향후 개선 사항

1. **성능 최적화**
   - 이미지 최적화
   - 코드 스플리팅
   - 캐싱 전략

2. **접근성**
   - ARIA 속성 추가
   - 키보드 네비게이션
   - 스크린 리더 지원

3. **에러 처리**
   - 전역 에러 핸들러
   - 사용자 친화적 에러 메시지
   - 재시도 로직

4. **테스트**
   - 단위 테스트
   - 통합 테스트
   - E2E 테스트

---

## 참고 문서

- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev)
- [API 명세서](./API_SPEC.md) (별도 문서)

---

**작성일**: 2025년
**버전**: 1.0.0
**작성자**: ALPHACAR 개발팀
