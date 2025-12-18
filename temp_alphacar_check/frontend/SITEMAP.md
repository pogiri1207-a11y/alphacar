# ALPHACAR 사이트맵

## 홈 (Home)
- **URL**: `/`

### 1. 견적 비교 (Quote Comparison)
- **URL**: `/quote`
  - 비교견적 (Compare Estimate)
    - **URL**: `/quote/compare`
    - 비교견적 결과: `/quote/compare/result`
    - 차량 비교: `/quote/compare/vs`
  - 개별견적 (Individual Estimate)
    - **URL**: `/quote/personal`
    - 개별견적 결과: `/quote/personal/result`

### 2. 소식 (News)
- **URL**: `/news`
  - 핫이슈 (Hot Issue)
    - **URL**: `/news` (핫이슈 섹션)
  - 내 차와의 데이터 (Data with My Car)
    - **URL**: `/news` (내차와의 데이트 섹션)
  - 시승기 (Test Drive Review)
    - **URL**: `/news` (시승기 섹션)
  - 시승신청하기 (Apply for Test Drive)
    - **URL**: `/news/test-drive`
  - 뉴스 상세: `/news/[id]`

### 3. 커뮤니티 (Community)
- **URL**: `/community`
  - 구매고민 (Purchase Concerns)
    - **URL**: `/community` (구매고민 탭)
  - 오너리뷰 (Owner Review)
    - **URL**: `/community` (오너리뷰 탭)
  - 글쓰기: `/community/write`
  - 게시글 상세: `/community/[id]`

### 4. 이벤트 (Event)
- **URL**: `/event`
  - 진행중인 이벤트 (Ongoing Events)
    - **URL**: `/event` (진행중 탭)
    - 블로그 리뷰 이벤트: `/event/blog-review`
    - 추천 이벤트: `/event/recommend`
    - 할인 이벤트: `/event/discount`
  - 종료된 이벤트 (Ended Events)
    - **URL**: `/event/end`

### 5. 마이페이지 (My Page)
- **URL**: `/mypage`
  - 견적함 (Estimate Box)
    - **URL**: `/mypage/quotes`
  - 포인트 (Points)
    - **URL**: `/mypage/points`
  - 로그인 (Login)
    - **URL**: `/mypage/login`
    - 카카오 로그인 (Kakao Login)
    - 구글 로그인 (Google Login)

### 6. 상담 (Consultation)
- **URL**: `/consult`
  - 1:1 상담신청 (1:1 Consultation Application)
    - **URL**: `/consult`

### 7. 혜택 (Benefits)
- **URL**: `/benefit`
  - 캐시백 (Cashback)
    - **URL**: `/cashback`
  - ALPHACAR 가이드 (ALPHACAR Guide)
    - **URL**: `/benefit`

### 8. 고객센터 (Customer Center)
- **URL**: `/customer-center`

### 9. 최근본차량 (Recently Viewed Cars)
- **URL**: `/recent-views`

### 10. 찜한 차량 (Liked Cars)
- **URL**: `/favorite`

### 11. 검색 (Search) ⭐ 추가
- **URL**: `/search`
  - 검색어 파라미터: `/search?keyword={검색어}`

### 12. 우주 게임 (Space Game) ⭐ 추가
- **URL**: `/space-game`
  - 별잡기 게임 페이지

---

## 사이트맵 구조도

```
홈 (/)
├── 견적 비교 (/quote)
│   ├── 비교견적 (/quote/compare)
│   └── 개별견적 (/quote/personal)
├── 소식 (/news)
│   ├── 핫이슈
│   ├── 내 차와의 데이터
│   ├── 시승기
│   └── 시승신청하기 (/news/test-drive)
├── 커뮤니티 (/community)
│   ├── 구매고민
│   └── 오너리뷰
├── 이벤트 (/event)
│   ├── 진행중인 이벤트
│   └── 종료된 이벤트
├── 마이페이지 (/mypage)
│   ├── 견적함 (/mypage/quotes)
│   ├── 포인트 (/mypage/points)
│   └── 로그인 (/mypage/login)
├── 상담 (/consult)
│   └── 1:1 상담신청
├── 혜택 (/benefit)
│   ├── 캐시백 (/cashback)
│   └── ALPHACAR 가이드
├── 고객센터 (/customer-center)
├── 최근본차량 (/recent-views)
├── 찜한 차량 (/favorite)
├── 검색 (/search) ⭐ 신규 추가
└── 우주 게임 (/space-game) ⭐ 신규 추가
```

