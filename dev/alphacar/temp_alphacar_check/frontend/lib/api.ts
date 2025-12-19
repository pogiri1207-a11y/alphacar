// frontend/lib/api.ts
import axios from 'axios';
import Cookies from 'js-cookie';

// ----------------------------------------------------------------------
// 1. Axios 인스턴스 생성 및 인터셉터 설정 (핵심 ⭐)
// ----------------------------------------------------------------------
const api = axios.create({
  // Nginx Proxy를 통해 Traefik Gateway로 연결되는 주소
  baseURL: 'https://192.168.0.160.nip.io:8000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// [요청 인터셉터] 모든 요청 출발 직전에 실행됨
api.interceptors.request.use(
  (config) => {
    // 1. 쿠키에서 accessToken 가져오기 (가장 권장)
    let token = Cookies.get('accessToken');

    // 2. 쿠키에 없으면 로컬스토리지 확인 (이전 호환성 및 클라이언트용)
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('alphacarToken') || localStorage.getItem('user_social_id');
    }

    // 3. 토큰이 있으면 헤더에 심어주기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log(`[Axios Interceptor] Token injected: ${token.substring(0, 10)}...`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// [응답 인터셉터] (선택사항: 401 에러 시 로그인 페이지로 튕기기 등)
// api.interceptors.response.use(...)

export default api;


// ----------------------------------------------------------------------
// 2. API 함수들 (Axios 사용으로 간결해짐)
// ----------------------------------------------------------------------

// 1. 메인 페이지
export type MainData = {
  welcomeMessage: string;
  searchBar?: { isShow: boolean; placeholder: string };
  banners: { id: number; text: string; color: string }[];
  shortcuts: string[];
  carList?: any[];
  cars?: any[];
  [key: string]: any;
};

export async function fetchMainData(brand?: string): Promise<MainData> {
  const params = brand && brand !== '전체' && brand !== 'all' ? { brand } : {};
  const { data } = await api.get<MainData>('/main', { params });
  return data;
}

// 2. 견적 페이지
export type QuoteInitData = { message: string; models: string[]; trims: string[] };
export type QuoteSaveResponse = { success: boolean; message: string; id: string };

export async function fetchQuoteInitData(): Promise<QuoteInitData> {
  const { data } = await api.get<QuoteInitData>('/quote');
  return data;
}

export async function saveQuote(payload: any): Promise<QuoteSaveResponse> {
  const { data } = await api.post<QuoteSaveResponse>('/quote/save', payload);
  return data;
}

// 3. 드라이브 코스
export type DriveCoursesData = {
  message: string;
  courses: { id: number; title: string; distance: string; time: string }[];
};
export type DriveCourseDetail = { id: string; title: string; description: string; mapUrl: string };

export async function fetchDriveCourses(): Promise<DriveCoursesData> {
  // 기존 코드에 /api/news 로 되어있어 유지 (추후 /drive 로 변경 필요 시 수정)
  const { data } = await api.get<DriveCoursesData>('/news'); 
  return data;
}

export async function fetchDriveCourseDetail(id: number | string): Promise<DriveCourseDetail> {
  const { data } = await api.get<DriveCourseDetail>(`/drive/${id}`);
  return data;
}

// 4. 커뮤니티
export type CommunityPost = {
  id: number;
  category: string;
  title: string;
  content: string;
  author: string;
  userId?: string | number;
  date: string;
  views: number;
};
export type CommunityListResponse = { message: string; posts: CommunityPost[] };
export type CommunityWriteResponse = { success: boolean; message: string };

export async function fetchCommunityPosts(): Promise<CommunityListResponse> {
  const { data } = await api.get<CommunityListResponse>('/community');
  return data;
}

export async function createCommunityPost(postData: Partial<CommunityPost>): Promise<CommunityWriteResponse> {
  const { data } = await api.post<CommunityWriteResponse>('/community/write', postData);
  return data;
}

// 5. 마이페이지
export type MypageInfoResponse = { isLoggedIn: boolean; message: string; user: any | null };
export type NonMemberQuoteCheckResponse = { success: boolean; status?: string; model?: string; message?: string };

export async function fetchMypageInfo(): Promise<MypageInfoResponse> {
  // 인터셉터가 알아서 토큰을 넣어주므로 별도 헤더 설정 불필요! 👍
  const { data } = await api.get<MypageInfoResponse>('/mypage');
  return data;
}

export async function checkNonMemberQuote(quoteId: string): Promise<NonMemberQuoteCheckResponse> {
  const { data } = await api.post<NonMemberQuoteCheckResponse>('/mypage/check', { quoteId });
  return data;
}

// 6. 검색
export type SearchCarTrim = { id: number; name: string; price: number };
export type SearchCar = { id: number; name: string; image: string; priceRange: string; trims: SearchCarTrim[] };
export type SearchResult = { success: boolean; keyword: string; result: { cars: SearchCar[]; community: any[] } };

export async function fetchSearch(keyword: string): Promise<SearchResult> {
  const { data } = await api.get<SearchResult>('/search', { params: { keyword } });
  return data;
}

// 7. 브랜드 목록
export type Brand = { name: string; logo_url?: string };
export type BrandWithLogo = { name: string; logo_url: string };

export async function fetchBrands(): Promise<Brand[]> {
  const { data } = await api.get<Brand[]>('/brands');
  return data;
}

export async function fetchBrandsWithLogo(): Promise<BrandWithLogo[]> {
  const { data } = await api.get<BrandWithLogo[]>('/brands');
  return data;
}
