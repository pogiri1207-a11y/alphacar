// lib/api.ts

// [공통] JWT/SocialID 토큰 가져오기
function getAuthToken() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('alphacarToken') : null;
    const socialId = typeof window !== 'undefined' ? localStorage.getItem('user_social_id') : null;
    return token || socialId;
}

// --------------------
// 1. 메인 페이지 (Main Service -> Port 3002)
// --------------------
export type MainData = {
  welcomeMessage: string;
  searchBar?: { isShow: boolean; placeholder: string; };
  banners: { id: number; text: string; color: string }[];
  shortcuts: string[];
};

export async function fetchMainData(brand?: string): Promise<MainData> {
  // /api/main -> 3002번 포트의 /main 으로 연결됨
  // 브랜드 필터링 지원
  const url = brand && brand !== '전체' && brand !== 'all' 
    ? `/api/main?brand=${encodeURIComponent(brand)}`
    : `/api/main`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error("메인 데이터 불러오기 실패");
  return res.json();
}

// --------------------
// 2. 견적 페이지 (Quote Service -> Port 3003)
// --------------------
export type QuoteInitData = { message: string; models: string[]; trims: string[]; };
export type QuoteSaveResponse = { success: boolean; message: string; id: string; };

export async function fetchQuoteInitData(): Promise<QuoteInitData> {
  const res = await fetch(`/api/quote`, { method: "GET" });
  if (!res.ok) throw new Error("견적 초기 데이터 불러오기 실패");
  return res.json();
}

export async function saveQuote(data: any): Promise<QuoteSaveResponse> {
  const res = await fetch(`/api/quote/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("견적 저장 실패");
  return res.json();
}

// --------------------
// 3. 드라이브 코스 (Drive Service -> Port 설정 필요)
// --------------------
// ※ 주의: 보내주신 next.config.mjs에 'news'(3004)는 있지만 'drive'가 없어서
// 일단 3002번(Main)이나 별도 포트로 연결되도록 설정이 필요합니다.
// 여기서는 /api/drive 로 요청하도록 작성했습니다.
export type DriveCoursesData = {
  message: string;
  courses: { id: number; title: string; distance: string; time: string; }[];
};
export type DriveCourseDetail = { id: string; title: string; description: string; mapUrl: string; };

export async function fetchDriveCourses(): Promise<DriveCoursesData> {
  const res = await fetch(`/api/news`, { method: "GET" });
  if (!res.ok) throw new Error("드라이브 코스 목록 불러오기 실패");
  return res.json();
}

export async function fetchDriveCourseDetail(id: number | string): Promise<DriveCourseDetail> {
  const res = await fetch(`/api/drive/${id}`, { method: "GET" });
  if (!res.ok) throw new Error("드라이브 코스 상세 불러오기 실패");
  return res.json();
}

// --------------------
// 4. 커뮤니티 (Community Service -> Port 3005)
// --------------------
export type CommunityPost = { id: number; category: string; title: string; content: string; author: string; date: string; views: number; };
export type CommunityListResponse = { message: string; posts: CommunityPost[]; };
export type CommunityWriteResponse = { success: boolean; message: string; };

export async function fetchCommunityPosts(): Promise<CommunityListResponse> {
  const res = await fetch(`/api/community`, {
    method: "GET",
    cache: "no-store"
  });
  if (!res.ok) throw new Error("커뮤니티 목록 불러오기 실패");
  return res.json();
}

export async function createCommunityPost(data: Partial<CommunityPost>): Promise<CommunityWriteResponse> {
  const res = await fetch(`/api/community/write`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("커뮤니티 글 등록 실패");
  return res.json();
}

// --------------------
// 5. 마이페이지 (Mypage Service -> Port 3006)
// --------------------
export type MypageInfoResponse = { isLoggedIn: boolean; message: string; user: any | null; };
export type NonMemberQuoteCheckResponse = { success: boolean; status?: string; model?: string; message?: string; };

export async function fetchMypageInfo(): Promise<MypageInfoResponse> {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`[FE LOG] Token sent: ${token}`);
  }

  const res = await fetch(`/api/mypage`, {
    method: "GET",
    headers: headers,
  });

  if (!res.ok) throw new Error("마이페이지 정보 불러오기 실패");
  return res.json();
}

export async function checkNonMemberQuote(quoteId: string): Promise<NonMemberQuoteCheckResponse> {
  const res = await fetch(`/api/mypage/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quoteId }),
  });
  if (!res.ok) throw new Error("비회원 견적 조회 실패");
  return res.json();
}

// --------------------
// 6. 검색 (Search Service -> Port 3007)
// --------------------
export type SearchCarTrim = { id: number; name: string; price: number; };
export type SearchCar = { id: number; name: string; image: string; priceRange: string; trims: SearchCarTrim[]; };
export type SearchResult = { success: boolean; keyword: string; result: { cars: SearchCar[]; community: any[]; }; };

export async function fetchSearch(keyword: string): Promise<SearchResult> {
  const res = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`, { method: "GET" });
  if (!res.ok) throw new Error("검색 API 호출 실패");
  return res.json();
}

// --------------------
// 7. 브랜드 목록 (Main Service -> Port 3002)
// --------------------
export type Brand = {
  name: string;
  logo_url?: string;
};

export async function fetchBrands(): Promise<Brand[]> {
  const res = await fetch(`/api/brands`, { method: "GET" });
  if (!res.ok) throw new Error("브랜드 목록 불러오기 실패");
  return res.json();
}

// ✅ [추가] 브랜드 목록 (로고 포함) 가져오기
export type BrandWithLogo = { name: string; logo_url: string; };
export async function fetchBrandsWithLogo(): Promise<BrandWithLogo[]> {
  // /api/brands 엔드포인트 사용 (makers-with-logo도 지원하지만 brands가 더 안정적)
  const res = await fetch(`/api/brands`, { method: "GET" });
  if (!res.ok) throw new Error("브랜드 목록 불러오기 실패");
  return res.json();
}
