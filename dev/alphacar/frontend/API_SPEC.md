# ALPHACAR API 명세서

## 목차
1. [개요](#개요)
2. [기본 정보](#기본-정보)
3. [인증](#인증)
4. [공통 응답 형식](#공통-응답-형식)
5. [에러 코드](#에러-코드)
6. [API 엔드포인트 상세](#api-엔드포인트-상세)

---

## 개요

ALPHACAR API는 마이크로서비스 아키텍처로 구성되어 있으며, 각 서비스는 독립적인 포트에서 운영됩니다. 프론트엔드는 Next.js의 rewrites 기능을 통해 `/api/*` 경로로 요청을 프록시합니다.

### 서비스 포트 매핑

| 서비스 | 포트 | 설명 |
|--------|------|------|
| Main Service | 3002 | 차량 정보, 브랜드, 판매 순위, 찜하기, 최근 본 차량 |
| Quote Service | 3003 | 견적 관리, 차량 상세, 히스토리 |
| News Service | 3004 | 뉴스, 드라이브 코스 |
| Community Service | 3005 | 커뮤니티 게시판 |
| Mypage Service | 3006 | 마이페이지, 사용자 정보 |
| Search Service | 3007 | 검색 기능 |
| Auth Service | 8000 | 인증 (카카오/구글 로그인) |

---

## 기본 정보

### Base URL
- **프론트엔드 프록시**: `http://localhost:3000/api/*`
- **백엔드 직접 접근**: `http://192.168.0.160:{PORT}/*`

### Content-Type
- **요청**: `application/json`
- **응답**: `application/json`

### 인코딩
- 모든 요청은 UTF-8 인코딩을 사용합니다.
- URL 파라미터는 `encodeURIComponent()`로 인코딩해야 합니다.

---

## 인증

### 인증 방식

ALPHACAR는 두 가지 인증 방식을 지원합니다:

1. **JWT 토큰 인증**
   - 헤더: `Authorization: Bearer {token}`
   - 토큰 저장 위치: `localStorage.getItem('accessToken')`

2. **소셜 ID 인증**
   - 헤더: `Authorization: Bearer {socialId}`
   - 소셜 ID 저장 위치: `localStorage.getItem('user_social_id')`

### 인증이 필요한 API
- 마이페이지 관련 API
- 견적 저장 API
- 찜하기 API
- 커뮤니티 글쓰기 API

### 인증이 불필요한 API
- 차량 목록 조회
- 브랜드 목록 조회
- 검색 API
- 커뮤니티 목록 조회

---

## 공통 응답 형식

### 성공 응답

```json
{
  "success": true,
  "message": "성공 메시지",
  "data": { ... }
}
```

### 에러 응답

```json
{
  "success": false,
  "message": "에러 메시지",
  "error": {
    "code": "ERROR_CODE",
    "details": "상세 에러 정보"
  }
}
```

---

## 에러 코드

| HTTP 상태 코드 | 설명 |
|---------------|------|
| 200 | 성공 |
| 400 | 잘못된 요청 (Bad Request) |
| 401 | 인증 실패 (Unauthorized) |
| 403 | 권한 없음 (Forbidden) |
| 404 | 리소스를 찾을 수 없음 (Not Found) |
| 500 | 서버 내부 오류 (Internal Server Error) |

---

## API 엔드포인트 상세

## 1. 메인 서비스 (Port 3002)

### 1.1 차량 목록 조회
**GET** `/api/main`

차량 목록을 조회합니다. 브랜드 필터링을 지원합니다.

#### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| brand | string | 선택 | 브랜드명 (예: "현대", "기아") |

#### Request Example
```http
GET /api/main?brand=현대
```

#### Response Example
```json
{
  "welcomeMessage": "ALPHACAR에 오신 것을 환영합니다",
  "searchBar": {
    "isShow": true,
    "placeholder": "어떤 차를 찾으세요?"
  },
  "banners": [
    {
      "id": 1,
      "text": "배너 텍스트",
      "color": "#0070f3"
    }
  ],
  "shortcuts": ["견적비교", "소식", "커뮤니티"],
  "carList": [
    {
      "_id": "vehicle_id",
      "name": "[현대] 그랜저",
      "manufacturer": "현대",
      "minPrice": 30000000,
      "maxPrice": 50000000,
      "imageUrl": "https://example.com/image.jpg",
      "vehicleId": "vehicle_id"
    }
  ]
}
```

---

### 1.2 브랜드 목록 조회
**GET** `/api/brands`

브랜드 목록을 조회합니다. 로고 URL을 포함합니다.

#### Request Example
```http
GET /api/brands
```

#### Response Example
```json
[
  {
    "name": "현대",
    "logo_url": "https://example.com/hyundai.png"
  },
  {
    "name": "기아",
    "logo_url": "https://example.com/kia.png"
  }
]
```

---

### 1.3 판매 순위 조회
**GET** `/api/sales/rankings`

국내/외제 차량 판매 순위를 조회합니다.

#### Request Example
```http
GET /api/sales/rankings
```

#### Response Example
```json
{
  "domestic": [
    {
      "rank": 1,
      "model_name": "그랜저",
      "sales_volume": 15000,
      "market_share": 12.5,
      "previous_month": {
        "sales": 14000
      },
      "previous_year": {
        "sales": 12000
      }
    }
  ],
  "foreign": [
    {
      "rank": 1,
      "model_name": "벤츠 E클래스",
      "sales_volume": 5000,
      "market_share": 8.3
    }
  ]
}
```

---

### 1.4 찜 목록 조회
**GET** `/api/favorites/list`

사용자가 찜한 차량 목록을 조회합니다.

#### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| userId | string | 필수 | 사용자 ID (social_id 또는 alphacar_user_id) |

#### Request Example
```http
GET /api/favorites/list?userId=user_12345
```

#### Response Example
```json
[
  {
    "_id": "favorite_id",
    "userId": "user_12345",
    "vehicleId": {
      "_id": "vehicle_id",
      "lineup_id": "lineup_123",
      "name": "[현대] 그랜저",
      "imageUrl": "https://example.com/image.jpg",
      "minPrice": 30000000,
      "maxPrice": 50000000
    },
    "createdAt": "2025-01-15T10:30:00Z"
  }
]
```

---

### 1.5 찜하기 토글
**POST** `/api/favorites/toggle`

차량을 찜하기 목록에 추가하거나 제거합니다.

#### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body
```json
{
  "userId": "user_12345",
  "vehicleId": "vehicle_id"
}
```

#### Response Example
```json
{
  "success": true,
  "message": "찜하기가 완료되었습니다",
  "isFavorite": true
}
```

---

### 1.6 최근 본 차량 조회
**GET** `/api/recent-views`

사용자가 최근에 본 차량 목록을 조회합니다.

#### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| userId | string | 필수 | 사용자 ID |

#### Request Example
```http
GET /api/recent-views?userId=user_12345
```

#### Response Example
```json
[
  {
    "_id": "history_id",
    "userId": "user_12345",
    "name": "[현대] 그랜저",
    "brand": "현대",
    "image": "https://example.com/image.jpg",
    "price": 35000000,
    "viewedAt": "2025-01-15T10:30:00Z"
  }
]
```

---

### 1.7 차량 상세 정보 조회
**GET** `/api/vehicles/detail`

차량의 상세 정보를 조회합니다.

#### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| vehicleId | string | 필수 | 차량 ID |
| trimId | string | 선택 | 트림 ID |

#### Request Example
```http
GET /api/vehicles/detail?vehicleId=vehicle_123&trimId=trim_456
```

#### Response Example
```json
{
  "_id": "vehicle_id",
  "name": "[현대] 그랜저",
  "trim_name": "그랜저 IG 2.5 가솔린",
  "manufacturer": "현대",
  "base_price": 35000000,
  "image_url": "https://example.com/image.jpg",
  "specifications": {
    "engine": {
      "type": "가솔린",
      "displacement": "2500cc",
      "max_power": "198hp"
    },
    "fuel_efficiency": {
      "combined": "12.5km/L"
    }
  },
  "options": [
    {
      "id": "opt_1",
      "name": "선루프",
      "price": 500000
    }
  ]
}
```

---

## 2. 견적 서비스 (Port 3003)

### 2.1 견적 초기 데이터 조회
**GET** `/api/quote`

견적 작성을 위한 초기 데이터(모델 목록, 트림 목록)를 조회합니다.

#### Request Example
```http
GET /api/quote
```

#### Response Example
```json
{
  "message": "견적 초기 데이터",
  "models": ["그랜저", "쏘나타", "아반떼"],
  "trims": ["IG 2.5 가솔린", "IG 3.0 가솔린"]
}
```

---

### 2.2 견적 저장
**POST** `/api/quote/save`

견적 정보를 저장합니다.

#### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body
```json
{
  "userId": "user_12345",
  "vehicleId": "vehicle_123",
  "trimId": "trim_456",
  "options": ["opt_1", "opt_2"],
  "totalPrice": 38000000,
  "dealerInfo": {
    "name": "강남지점",
    "phone": "02-1234-5678"
  }
}
```

#### Response Example
```json
{
  "success": true,
  "message": "견적이 저장되었습니다",
  "id": "quote_id_123"
}
```

---

### 2.3 견적 목록 조회
**GET** `/api/estimate/list`

사용자의 견적 목록을 조회합니다.

#### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| userId | string | 필수 | 사용자 ID |

#### Headers
```
Authorization: Bearer {token}
```

#### Request Example
```http
GET /api/estimate/list?userId=user_12345
```

#### Response Example
```json
[
  {
    "_id": "quote_id",
    "userId": "user_12345",
    "vehicleName": "[현대] 그랜저",
    "trimName": "IG 2.5 가솔린",
    "totalPrice": 38000000,
    "createdAt": "2025-01-15T10:30:00Z",
    "status": "pending"
  }
]
```

---

### 2.4 견적 개수 조회
**GET** `/api/estimate/count`

사용자의 견적 개수를 조회합니다.

#### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| userId | string | 필수 | 사용자 ID |

#### Request Example
```http
GET /api/estimate/count?userId=user_12345
```

#### Response Example
```json
5
```

---

### 2.5 차량 목록 조회 (견적 서비스)
**GET** `/api/vehicles`

견적 서비스를 통한 차량 목록 조회입니다.

#### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| maker | string | 선택 | 제조사 ID |
| model | string | 선택 | 모델 ID |
| baseTrim | string | 선택 | 베이스 트림 ID |

#### Request Example
```http
GET /api/vehicles?maker=maker_123&model=model_456
```

#### Response Example
```json
[
  {
    "_id": "vehicle_id",
    "name": "[현대] 그랜저",
    "trim_name": "IG 2.5 가솔린",
    "base_price": 35000000,
    "image_url": "https://example.com/image.jpg"
  }
]
```

---

### 2.6 최근 본 차량 히스토리 저장
**POST** `/api/history`

차량 조회 히스토리를 저장합니다.

#### Request Body
```json
{
  "userId": "user_12345",
  "vehicleId": "vehicle_123",
  "vehicleName": "[현대] 그랜저",
  "image": "https://example.com/image.jpg",
  "price": 35000000
}
```

#### Response Example
```json
{
  "success": true,
  "message": "히스토리가 저장되었습니다"
}
```

---

## 3. 뉴스 서비스 (Port 3004)

### 3.1 뉴스 목록 조회
**GET** `/api/news`

뉴스 목록을 조회합니다.

#### Request Example
```http
GET /api/news
```

#### Response Example
```json
{
  "message": "뉴스 목록",
  "articles": [
    {
      "id": 1,
      "title": "전기차 배터리 리콜 이슈",
      "summary": "국내외 완성차 업체들의 대응",
      "source": "ALPHACAR 뉴스",
      "date": "2025.12.05",
      "imageUrl": "https://example.com/news1.jpg"
    }
  ]
}
```

---

### 3.2 드라이브 코스 상세 조회
**GET** `/api/drive/{id}`

드라이브 코스 상세 정보를 조회합니다.

#### Path Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| id | string | 필수 | 코스 ID |

#### Request Example
```http
GET /api/drive/course_123
```

#### Response Example
```json
{
  "id": "course_123",
  "title": "한강 드라이브 코스",
  "description": "한강을 따라가는 아름다운 드라이브 코스",
  "mapUrl": "https://maps.example.com/course_123",
  "distance": "50km",
  "time": "1시간 30분"
}
```

---

## 4. 커뮤니티 서비스 (Port 3005)

### 4.1 게시글 목록 조회
**GET** `/api/community`

커뮤니티 게시글 목록을 조회합니다.

#### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| category | string | 선택 | 카테고리 (구매고민, 오너리뷰) |
| page | number | 선택 | 페이지 번호 (기본값: 1) |
| limit | number | 선택 | 페이지당 개수 (기본값: 10) |

#### Request Example
```http
GET /api/community?category=구매고민&page=1&limit=10
```

#### Response Example
```json
{
  "message": "게시글 목록",
  "posts": [
    {
      "id": 1,
      "category": "구매고민",
      "title": "그랜저 vs 쏘나타 고민",
      "content": "어떤 차를 사야 할까요?",
      "author": "사용자1",
      "date": "2025-01-15",
      "views": 150,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

---

### 4.2 게시글 상세 조회
**GET** `/api/community/{id}`

게시글 상세 정보를 조회합니다.

#### Path Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| id | string | 필수 | 게시글 ID |

#### Request Example
```http
GET /api/community/1
```

#### Response Example
```json
{
  "id": 1,
  "category": "구매고민",
  "title": "그랜저 vs 쏘나타 고민",
  "content": "어떤 차를 사야 할까요?",
  "author": "사용자1",
  "date": "2025-01-15",
  "views": 151,
  "createdAt": "2025-01-15T10:30:00Z",
  "comments": [
    {
      "id": 1,
      "author": "사용자2",
      "content": "그랜저 추천합니다",
      "createdAt": "2025-01-15T11:00:00Z"
    }
  ]
}
```

---

### 4.3 게시글 작성
**POST** `/api/community/write`

새 게시글을 작성합니다.

#### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body
```json
{
  "category": "구매고민",
  "title": "그랜저 vs 쏘나타 고민",
  "content": "어떤 차를 사야 할까요?",
  "author": "사용자1"
}
```

#### Response Example
```json
{
  "success": true,
  "message": "게시글이 등록되었습니다",
  "id": 123
}
```

---

## 5. 마이페이지 서비스 (Port 3006)

### 5.1 마이페이지 정보 조회
**GET** `/api/mypage`

사용자의 마이페이지 정보를 조회합니다.

#### Headers
```
Authorization: Bearer {token}
```

#### Request Example
```http
GET /api/mypage
```

#### Response Example
```json
{
  "isLoggedIn": true,
  "message": "마이페이지 정보",
  "user": {
    "nickname": "홍길동",
    "name": "홍길동",
    "email": "hong@example.com",
    "provider": "kakao",
    "point": 10000,
    "socialId": "social_12345"
  }
}
```

---

### 5.2 비회원 견적 조회
**POST** `/api/mypage/check`

비회원 견적 조회를 확인합니다.

#### Request Body
```json
{
  "quoteId": "quote_123"
}
```

#### Response Example
```json
{
  "success": true,
  "status": "pending",
  "model": "그랜저",
  "message": "견적 조회 성공"
}
```

---

## 6. 검색 서비스 (Port 3007)

### 6.1 차량 검색
**GET** `/api/search`

키워드로 차량을 검색합니다.

#### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| keyword | string | 필수 | 검색어 |

#### Request Example
```http
GET /api/search?keyword=그랜저
```

#### Response Example
```json
{
  "success": true,
  "keyword": "그랜저",
  "result": {
    "cars": [
      {
        "id": "vehicle_123",
        "name": "[현대] 그랜저",
        "trimName": "IG 2.5 가솔린",
        "image": "https://example.com/image.jpg",
        "priceRange": "3,500만원 ~ 5,000만원",
        "brandName": "현대",
        "logoUrl": "https://example.com/hyundai.png",
        "releaseDate": "2024-01-01",
        "displacement": "2500cc",
        "fuelEfficiency": "12.5km/L",
        "trims": [
          {
            "id": 1,
            "name": "IG 2.5 가솔린",
            "price": 35000000
          }
        ]
      }
    ],
    "community": []
  }
}
```

---

## 7. 인증 서비스 (Port 8000)

### 7.1 카카오 로그인
**POST** `/auth/kakao-login`

카카오 OAuth 인증 코드로 로그인합니다.

#### Request Body
```json
{
  "code": "kakao_oauth_code"
}
```

#### Response Example
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "nickname": "홍길동",
    "email": "hong@example.com",
    "provider": "kakao",
    "socialId": "kakao_12345"
  }
}
```

---

### 7.2 구글 로그인
**POST** `/auth/google-login`

구글 OAuth 인증 코드로 로그인합니다.

#### Request Body
```json
{
  "code": "google_oauth_code"
}
```

#### Response Example
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "nickname": "홍길동",
    "email": "hong@example.com",
    "provider": "google",
    "socialId": "google_12345"
  }
}
```

---

## 8. AI 채팅 서비스 (Port 4000)

### 8.1 AI 채팅
**POST** `/api/chat`

AI 챗봇과 대화합니다.

#### Request Body
```json
{
  "message": "그랜저에 대해 알려주세요",
  "userId": "user_12345",
  "conversationId": "conv_123"
}
```

#### Response Example
```json
{
  "success": true,
  "message": "그랜저는 현대자동차의 대형 세단입니다...",
  "conversationId": "conv_123"
}
```

---

## 데이터 타입 정의

### Vehicle (차량)
```typescript
interface Vehicle {
  _id?: string;
  id?: string;
  name?: string;
  vehicle_name?: string;
  trim_name?: string;
  model_name?: string;
  brand_name?: string;
  manufacturer?: string;
  base_price?: number;
  minPrice?: number;
  maxPrice?: number;
  imageUrl?: string;
  main_image?: string;
  image_url?: string;
  vehicleId?: string;
  specifications?: {
    engine?: {
      type?: string;
      displacement?: string;
      max_power?: string;
    };
    fuel_efficiency?: {
      combined?: string;
    };
  };
  options?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}
```

### User (사용자)
```typescript
interface User {
  nickname?: string;
  name?: string;
  email?: string;
  provider?: string;
  point?: number;
  socialId?: string;
  [key: string]: any;
}
```

### Quote (견적)
```typescript
interface Quote {
  _id?: string;
  id?: string;
  userId?: string;
  vehicleId?: string;
  vehicleName?: string;
  trimId?: string;
  trimName?: string;
  options?: string[];
  totalPrice?: number;
  dealerInfo?: {
    name?: string;
    phone?: string;
  };
  status?: string;
  createdAt?: string;
}
```

### CommunityPost (커뮤니티 게시글)
```typescript
interface CommunityPost {
  id?: number;
  category?: string;
  title?: string;
  content?: string;
  author?: string;
  date?: string;
  views?: number;
  createdAt?: string;
  comments?: Array<{
    id: number;
    author: string;
    content: string;
    createdAt: string;
  }>;
}
```

---

## 주의사항

### 1. CORS 설정
- 프론트엔드에서 직접 백엔드로 요청할 경우 CORS 설정이 필요합니다.
- Next.js rewrites를 통해 프록시하는 경우 CORS 문제가 발생하지 않습니다.

### 2. 인증 토큰
- JWT 토큰은 만료 시간이 있습니다.
- 토큰 만료 시 401 에러가 발생하며, 재로그인이 필요합니다.

### 3. 에러 처리
- 모든 API는 에러 발생 시 적절한 HTTP 상태 코드와 에러 메시지를 반환합니다.
- 프론트엔드에서는 에러 응답을 처리하여 사용자에게 적절한 메시지를 표시해야 합니다.

### 4. 요청 제한
- API 호출 빈도 제한이 있을 수 있습니다.
- 과도한 요청은 429 (Too Many Requests) 에러를 반환할 수 있습니다.

### 5. 데이터 형식
- 날짜는 ISO 8601 형식 (예: `2025-01-15T10:30:00Z`)을 사용합니다.
- 가격은 원 단위 정수로 전달됩니다 (예: 35000000 = 3,500만원).

---

## 버전 정보

- **API 버전**: 1.0.0
- **최종 업데이트**: 2025년 1월
- **작성자**: ALPHACAR 개발팀

---

## 참고 문서

- [프론트엔드 기능명세서](./FRONTEND_FUNCTIONAL_SPEC.md)
- [사이트맵](./SITEMAP.md)

