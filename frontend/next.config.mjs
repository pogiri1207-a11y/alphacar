/** @type {import('next').NextConfig} */
const nextConfig = {
  // 👇 여기에 추가했습니다!
  output: 'standalone',

  reactStrictMode: true,
  async rewrites() {
    return [
      // 1. 기존 AI 채팅 서버 설정 (유지)
      {
        source: '/api/chat/:path*',
        destination: 'http://127.0.0.1:4000/chat/:path*',
      },

      // ----------------------------------------------------
      // ★ [MAIN SERVICE - 3002 포트] (차량 상세 정보)
      // ----------------------------------------------------
      
      // 1. [차량 상세 정보] /api/vehicles/detail은 main 서비스(3002)로 보냅니다.
      // 쿼리 파라미터는 자동으로 전달되므로 별도 처리 불필요
      {
        source: '/api/vehicles/detail',
        destination: 'http://192.168.0.160:3002/vehicles/detail',
      },
      
      // ----------------------------------------------------
      // ★ [QUOTE SERVICE - 3003 포트] (유연성 확보)
      // ----------------------------------------------------
      
      // 2. [나머지 차량 관련] /api/vehicles/* 경로를 3003 포트로 보냅니다.
      {
        source: '/api/vehicles/:path*',
        destination: 'http://192.168.0.160:3003/api/vehicles/:path*',
      },

      // 2. [견적 저장 및 목록] /api/estimate/* (3003)
      {
        source: '/api/estimate/:path*',
        destination: 'http://192.168.0.160:3003/api/estimate/:path*',
      },

      // ✅ 3. [최근 본 차량 (History)] - 이 규칙이 꼭 있어야 합니다!
      {
        source: '/api/history/:path*',
        destination: 'http://192.168.0.160:3003/api/history/:path*',
      },

      // 3. [이전 API 호환성 확보] /api/quote/* (3003)
      {
        source: '/api/quote/:path*',
        destination: 'http://192.168.0.160:3003/api/quote/:path*',
      },
      
      // ----------------------------------------------------
      // [다른 서비스 규칙] (다른 포트 규칙은 유지)
      // ----------------------------------------------------
      
      // 4. [메인 데이터 처리] (3002)
      {
        source: '/api/main/:path*',
        destination: 'http://192.168.0.160:3002/main/:path*',
      },
      
      // 5. [찜하기 기능] (3002)
      {
        source: '/api/favorites/:path*',
        destination: 'http://192.168.0.160:3002/favorites/:path*',
      },
      
      // 5. [다른 서비스]
      {
        source: '/api/community/:path*',
        destination: 'http://192.168.0.160:3005/community/:path*',
      },
      {
        source: '/api/mypage/:path*',
        destination: 'http://192.168.0.160:3006/mypage/:path*',
      },
      {
        source: '/api/search/:path*',
        destination: 'http://192.168.0.160:3007/search/:path*',
      },
    ];
  },
};

export default nextConfig;
