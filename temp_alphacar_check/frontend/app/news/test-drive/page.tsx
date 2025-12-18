// app/news/test-drive/page.js
"use client";

import Link from "next/link";

const brandList = [
  // ===== 국산 브랜드 우선 배치 =====
  {
    id: 1,
    name: "현대",
    img: "https://carbar.co.kr/static/images/brand/hyundai.png",
    url: "https://www.hyundai.com/kr/ko/e/vehicles/test-driving",
  },
  {
    id: 2,
    name: "기아",
    img: "https://carbar.co.kr/static/images/brand/kia.png",
    url: "https://www.kia.com/kr/experience/book-a-test-drive/guide",
  },
  {
    id: 3,
    name: "제네시스",
    img: "https://carbar.co.kr/static/images/brand/genesis.png",
    url: "https://www.genesis.com/kr/ko/experience/genesis-drive.html",
  },
  {
    id: 4,
    name: "르노코리아",
    img: "https://carbar.co.kr/static/images/brand/renault.png",
    url: "https://www.kg-mobility.com/od/network/bridge",
  },
  {
    id: 5,
    name: "쉐보레",
    img: "https://carbar.co.kr/static/images/brand/chevrolet.png",
    url: "https://www.chevrolet.co.kr/request-test-drive",
  },

  // ===== 수입 브랜드 =====
  {
    id: 6,
    name: "메르세데스-벤츠",
    img: "https://carbar.co.kr/static/images/brand/benz.png",
    url: "https://www.mercedes-benz.co.kr/passengercars/test-drive.html",
  },
  {
    id: 7,
    name: "BMW",
    img: "https://carbar.co.kr/static/images/brand/bmw.png",
    url: "https://www.bmw.co.kr/ko/fastlane/tda-experience.html",
  },
  {
    id: 8,
    name: "아우디",
    img: "https://carbar.co.kr/static/images/brand/audi.png",
    url: "https://www.audi.co.kr/ko/aboutaudi/Auditoyou/",
  },
  {
    id: 9,
    name: "폭스바겐",
    img: "https://carbar.co.kr/static/images/brand/volkswagen.png",
    url: "https://www.volkswagen.co.kr/app/local/testdrive/requestform",
  },
  {
    id: 10,
    name: "볼보",
    img: "https://carbar.co.kr/static/images/brand/volvo.png",
    url: "https://www.volvocars.com/kr/",
  },
  {
    id: 11,
    name: "렉서스",
    img: "https://carbar.co.kr/static/images/brand/lexus.png",
    url: "https://www.lexus.co.kr/test-drive/?page_id=main",
  },
  {
    id: 12,
    name: "토요타",
    img: "https://carbar.co.kr/static/images/brand/toyota.png",
    url: "https://www.toyota.co.kr/test-drive/",
  },
  {
    id: 13,
    name: "테슬라",
    img: "https://carbar.co.kr/static/images/brand/tesla.png",
    url: "https://www.tesla.com/ko_KR/drive",
  },
  {
    id: 14,
    name: "랜드로버",
    img: "https://carbar.co.kr/static/images/brand/landrover.png",
    url: "https://www.landroverkorea.co.kr/book-a-test-drive/index.html",
  },
  {
    id: 15,
    name: "포르쉐",
    img: "https://carbar.co.kr/static/images/brand/porche.png",
    url: "https://dealer.porsche.com/kr/songpa/ko-KR/Request-a-Test-Drive",
  },
  {
    id: 16,
    name: "미니",
    img: "https://carbar.co.kr/static/images/brand/mini.png",
    url: "https://www.mini.co.kr/ko_KR/home/range/john-cooper-works.html?tl=sea-nave-jcwa-pro-mn-.-sear-.-.-.-5ee03c9cdd6e&n_media=27758&n_query=%EB%AF%B8%EB%8B%88%EC%8B%9C%EC%8A%B9%EC%8B%A0%EC%B2%AD&n_rank=1&n_ad_group=grp-a001-01-000000047726843&n_ad=nad-a001-01-000000422530272&n_campaign_type=1&n_ad_group_type=1&n_match=2",
  },
  {
    id: 17,
    name: "포드",
    img: "https://carbar.co.kr/static/images/brand/ford.png",
    url: "https://www.ford.co.kr/mustang-kmi/",
  },
  {
    id: 18,
    name: "링컨",
    img: "https://carbar.co.kr/static/images/brand/lincoln.png",
    url: "https://www.lincoln-korea.com/vehicles/nautilus/",
  },
  {
    id: 19,
    name: "지프",
    img: "https://carbar.co.kr/static/images/brand/jeep.png",
    url: "https://www.jeep.co.kr/shopping_tools/satd.html",
  },
  {
    id: 20,
    name: "푸조",
    img: "https://carbar.co.kr/static/images/brand/peugeot.png",
    url: "https://base.epeugeot.co.kr/Form?rsf=RSF200716180915",
  },
  {
    id: 21,
    name: "캐딜락",
    img: "https://carbar.co.kr/static/images/brand/cadillac.png",
    url: "https://www.cadillac.co.kr/request-test-drive",
  },
  {
    id: 22,
    name: "폴스타",
    img: "https://carbar.co.kr/static/images/brand/polestar.png",
    url: "https://www.polestar.com/kr/test-drive/booking",
  },
  {
    id: 23,
    name: "마세라티",
    img: "https://carbar.co.kr/static/images/brand/maserati.png",
    url: "https://www.maserati.com/kr/ko/shopping-tools/test-drive",
  },
  {
    id: 24,
    name: "혼다",
    img: "https://carbar.co.kr/static/images/brand/honda.png",
    url: "https://exp.hondakorea.co.kr/cafethego/",
  },
  {
    id: 25,
    name: "BYD",
    img: "https://carbar.co.kr/static/images/brand/byd.png",
    url: "https://www.bydauto.kr/purchase/test-drive/seal",
  },
];

export default function TestDrivePage() {
  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "40px auto 80px",
        padding: "0 24px",
      }}
    >
      {/* 상단 위치 표시 */}
      <div
        style={{
          fontSize: "13px",
          color: "#999",
          marginBottom: "12px",
        }}
      >
        <Link href="/news">ALPHACAR 소식</Link> &nbsp;&gt;&nbsp; 시승 신청
      </div>

      {/* 메인 카드 래퍼 */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "18px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          padding: "28px 32px 32px",
        }}
      >
        {/* 타이틀 */}
        <div style={{ marginBottom: "22px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              marginBottom: "6px",
            }}
          >
            시승 신청
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "#666",
            }}
          >
            시승을 원하는 브랜드를 선택하면 각 브랜드 공식 홈페이지의 시승 신청
            페이지로 이동합니다.
          </p>
        </div>

        {/* 브랜드 로고 그리드 (4열 고정) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "18px 20px",
          }}
        >
          {brandList.map((brand) => (
            <a
              key={brand.id}
              href={brand.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  borderRadius: "14px",
                  border: "1px solid #e5e7eb",
                  padding: "18px 12px 16px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition:
                    "transform 0.12s ease-out, box-shadow 0.12s ease-out, border-color 0.12s ease-out",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 20px rgba(15,23,42,0.10)";
                  e.currentTarget.style.borderColor = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(15,23,42,0.04)";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                {/* 로고 영역 */}
                <div
                  style={{
                    width: "100%",
                    height: "72px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={brand.img}
                    alt={brand.name}
                    style={{
                      maxWidth: "110px",
                      maxHeight: "60px",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>

                {/* 브랜드 이름 */}
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#111827",
                    textAlign: "center",
                  }}
                >
                  {brand.name}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 아래로 여백 + 뒤로가기 버튼 */}
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <Link href="/news">
          <button
            type="button"
            style={{
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              padding: "8px 22px",
              backgroundColor: "#ffffff",
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(15,23,42,0.04)",
            }}
          >
            ← 소식 페이지로 돌아가기
          </button>
        </Link>
      </div>
    </div>
  );
}
