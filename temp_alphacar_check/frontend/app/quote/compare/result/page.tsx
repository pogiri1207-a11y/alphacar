// app/quote/compare/result/page.js
"use client";

import { useRouter } from "next/navigation";

function CarCompareCard({ title, name, subtitle, basePrice, options, totalPrice }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "16px",
        padding: "32px 32px 28px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      {/* 상단 차량 이미지 + 이름 */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        {/* 이미지 자리 (샘플 박스) */}
        <div
          style={{
            width: "180px",
            height: "110px",
            margin: "0 auto 16px",
            borderRadius: "12px",
            backgroundColor: "#f3f3f3",
          }}
        />
        <div
          style={{
            fontSize: "20px",
            fontWeight: 800,
            marginBottom: "4px",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#777",
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* 기본 가격 */}
      <div
        style={{
          backgroundColor: "#fafafa",
          borderRadius: "12px",
          padding: "14px 18px",
          fontSize: "14px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>기본 가격</span>
        <span style={{ fontWeight: 700, color: "#1d4ed8" }}>{basePrice}</span>
      </div>

      {/* 옵션 리스트 */}
      <div
        style={{
          fontSize: "14px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          옵션
        </div>

        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #eee",
            padding: "10px 0",
            maxHeight: "280px",
            overflowY: "auto",
          }}
        >
          {options.map((opt) => (
            <div
              key={opt.name}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 18px",
                borderBottom: "1px solid #f5f5f5",
              }}
            >
              <input type="checkbox" disabled style={{ marginRight: "12px" }} />
              <span style={{ flex: 1 }}>{opt.name}</span>
              <span style={{ fontSize: "13px", color: "#555" }}>{opt.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 최종 차량가 */}
      <div
        style={{
          backgroundColor: "#fff3ee",
          borderRadius: "12px",
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "15px",
          fontWeight: 700,
        }}
      >
        <span>최종 차량가</span>
        <span style={{ color: "#e11d48" }}>{totalPrice}</span>
      </div>
    </div>
  );
}

export default function CompareResultPage() {
  const router = useRouter();

  // 샘플 데이터 (나중에 백엔드 연동 시 실제 값으로 교체하면 됨)
  const car1Options = [
    { name: "트렁스윙도어", price: "400,000원" },
    { name: "윈도우 팩(5인승)", price: "200,000원" },
    { name: "멀티미디어 내비플러스", price: "1,450,000원" },
    { name: "익스테리어 디자인(5인승)", price: "850,000원" },
    { name: "데크", price: "1,000,000원" },
  ];

  const car2Options = [
    { name: "파노라마 선루프", price: "1,200,000원" },
    { name: "스마트 센스 패키지", price: "900,000원" },
    { name: "프리미엄 사운드", price: "700,000원" },
    { name: "통풍/열선 시트", price: "600,000원" },
    { name: "빌트인 캠", price: "550,000원" },
  ];

  return (
    <main
      style={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px 40px 60px",
        }}
      >
        {/* 뒤로가기 */}
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            marginBottom: "12px",
            cursor: "pointer",
            fontSize: "14px",
            color: "#555",
          }}
        >
          ← 뒤로 가기
        </button>

        {/* 상단 타이틀 */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            padding: "24px 32px",
            marginBottom: "24px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
              marginBottom: "4px",
            }}
          >
            비교 견적 결과
          </div>
          <div style={{ fontSize: "14px", color: "#777" }}>
            선택한 두 차량의 옵션과 최종 금액을 한 눈에 비교해 보세요.
          </div>
        </div>

        {/* 비교 카드 2개 나란히 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: "24px",
          }}
        >
          <CarCompareCard
            title="차량 1"
            name="5인승 모던"
            subtitle="스타리아 5인승 모던 트림"
            basePrice="35,130,000원"
            options={car1Options}
            totalPrice="37,130,000원"
          />
          <CarCompareCard
            title="차량 2"
            name="라운지 프레스티지"
            subtitle="스타리아 라운지 프레스티지"
            basePrice="45,000,000원"
            options={car2Options}
            totalPrice="47,350,000원"
          />
        </div>
      </div>
    </main>
  );
}
