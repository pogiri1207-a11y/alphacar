/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  async rewrites() {
    return [
      // ----------------------------------------------------
      // [AI CHAT SERVICE] - Traefik을 통해 4000번 포트로 연결
      // ----------------------------------------------------
      {
        source: '/api/chat/:path*',
        // Traefik의 /api/chat 라우팅 규칙에 매칭되도록 보냄
        destination: 'http://traefik:9090/api/chat/:path*',
      },

      // ----------------------------------------------------
      // ★ [MAIN SERVICE] (차량 상세 정보)
      // ----------------------------------------------------
      
      {
        source: '/api/vehicles/makers',
        destination: 'http://traefik:9090/api/makers', // main-backend가 아는 주소로 변경
      },
      {
        source: '/api/vehicles/models',
        destination: 'http://traefik:9090/api/models',
      },
      {
        source: '/api/vehicles/trims',
        destination: 'http://traefik:9090/api/trims',
      },
      {
        source: '/api/vehicles/cars',
        destination: 'http://traefik:9090/api/cars',
      },

      // 1. [차량 상세 정보]
      {
        source: '/api/vehicles/detail',
        // Traefik의 /api/vehicles/detail 라우팅 규칙 매칭
        destination: 'http://traefik:9090/api/vehicles/detail',
      },

      // ----------------------------------------------------
      // ★ [QUOTE SERVICE] (견적 및 기타 차량 정보)
      // ----------------------------------------------------

      // 2. [나머지 차량 관련]
      {
        source: '/api/vehicles/:path*',
        destination: 'http://traefik:9090/api/vehicles/:path*',
      },

      // 2. [견적 저장 및 목록]
      {
        source: '/api/estimate/:path*',
        destination: 'http://traefik:9090/api/estimate/:path*',
      },

      // ✅ 3. [최근 본 차량 (History)]
      {
        source: '/api/history/:path*',
        destination: 'http://traefik:9090/api/history/:path*',
      },

      // 3. [이전 API 호환성 확보]
      {
        source: '/api/quote/:path*',
        destination: 'http://traefik:9090/api/quote/:path*',
      },

      // ----------------------------------------------------
      // [MAIN SERVICE - 일반 데이터]
      // ----------------------------------------------------

      // 4. [메인 데이터 처리]
      {
        source: '/api/main/:path*',
        destination: 'http://traefik:9090/api/main/:path*',
      },

      // 4-1. [브랜드 목록]
      {
        source: '/api/brands',
        destination: 'http://traefik:9090/api/brands',
      },

      // 4-2. [판매 순위]
      // Traefik의 PathPrefix('/api/sales') 규칙을 타도록 설정
      {
        source: '/api/ranking',
        destination: 'http://traefik:9090/api/sales/rankings',
      },
      {
        source: '/api/sales/:path*',
        destination: 'http://traefik:9090/api/sales/:path*',
      },

      // 5. [찜하기 기능]
      {
        source: '/api/favorites/:path*',
        destination: 'http://traefik:9090/api/favorites/:path*',
      },

      // 5-1. [최근 본 차량]
      {
        source: '/api/recent-views',
        destination: 'http://traefik:9090/api/recent-views',
      },

      // 5-2. [리뷰 분석]
      {
        source: '/api/review-analysis',
        destination: 'http://traefik:9090/api/review-analysis',
      },

      // ----------------------------------------------------
      // [OTHER SERVICES]
      // ----------------------------------------------------

      // 6. [커뮤니티]
      {
        source: '/api/community/:path*',
        destination: 'http://traefik:9090/api/community/:path*',
      },

      // 7. [마이페이지]
      {
        source: '/api/mypage/:path*',
        destination: 'http://traefik:9090/api/mypage/:path*',
      },
      
      // 8. [검색]
      {
        source: '/api/search/:path*',
        destination: 'http://traefik:9090/api/search/:path*',
      },
    ];
  },
};

export default nextConfig;
