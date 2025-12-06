"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

// ✅ [추가] 공통: 견고한 HTTP 응답 처리 헬퍼 함수
const handleApiResponse = async (res) => {
  if (!res.ok) {
    let errorData = {};
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { message: res.statusText || '서버 응답 오류', status: res.status };
    }
    throw new Error(errorData.message || `API 요청 실패 (Status: ${res.status})`);
  }
  return res.json();
};

function CompareVsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터 읽기
  const idsParam = searchParams.get("ids");
  const opts1Param = searchParams.get("opts1"); // 차량 1 선택 옵션
  const opts2Param = searchParams.get("opts2"); // 차량 2 선택 옵션

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // 가격 포맷팅
  const formatPrice = (price) => {
    return Number(price).toLocaleString() + "원";
  };

  useEffect(() => {
    if (!idsParam) {
      setLoading(false);
      return;
    }

    const fetchCompareData = async () => {
      try {
        setLoading(true);
        const baseUrl = "/api";

        // ✅ [수정] 백엔드 경로 변경: /compare-data -> /vehicles/compare-data
        const res = await fetch(`${baseUrl}/vehicles/compare-data?ids=${idsParam}`);
        
        // ✅ [수정] 견고한 에러 핸들링 적용
        const data = await handleApiResponse(res);
        
        setCars(data);
      } catch (err) {
        console.error("에러 발생:", err.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompareData();
  }, [idsParam]);

  if (loading) {
    return (
      <main style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", padding: "100px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", fontWeight: "bold", color: "#555" }}>결과를 불러오는 중입니다...</p>
      </main>
    );
  }

  if (cars.length < 2) {
    return (
      <main style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", padding: "100px", textAlign: "center" }}>
        <div style={{ marginBottom: "20px" }}>데이터가 부족합니다.</div>
        <button onClick={() => router.push('/quote/compare')} style={{ padding: "10px 20px", cursor: "pointer" }}>돌아가기</button>
      </main>
    );
  }

  // --- 데이터 가공 로직 ---

  const selectedOpts1 = new Set(opts1Param ? opts1Param.split(",") : []);
  const selectedOpts2 = new Set(opts2Param ? opts2Param.split(",") : []);

  const processCarData = (carData, selectedSet) => {
    const basePrice = Number(carData.base_price || 0);
    const allOptions = carData.options || [];

    // ✅ [수정됨] 옵션 필터링 시 ID 타입을 문자열로 변환하여 비교
    const selectedOptions = allOptions.filter(opt => {
        const optIdString = String(opt._id); // ObjectId를 문자열로 변환
        return selectedSet.has(optIdString);
    });

    // 옵션 가격 합계
    const optionTotal = selectedOptions.reduce((sum, opt) => sum + (opt.price || 0), 0);
    const totalPrice = basePrice + optionTotal;

    const discountPrice = Math.floor(totalPrice * 0.95);
    const monthly = Math.floor(discountPrice / 60 / 10000); 

    return {
      ...carData,
      manufacturer: carData.manufacturer || "제조사",
      model_name: carData.model_name || "모델명",
      trim_name: carData.name || carData.trim_name || "트림",
      image: carData.image_url || "/car/sample-left.png",
      basePrice,
      selectedOptions, // 필터링된 옵션 목록
      optionTotal,
      totalPrice,
      discountPrice,
      monthly,
    };
  };

  const car1 = processCarData(cars[0], selectedOpts1);
  const car2 = processCarData(cars[1], selectedOpts2);

  // 가격 비교 데이터 구조
  const priceRows = [
    {
      label: "출고가 (옵션포함)",
      leftText: formatPrice(car1.totalPrice),
      rightText: formatPrice(car2.totalPrice),
      leftVal: car1.totalPrice,
      rightVal: car2.totalPrice
    },
    {
      label: "할인가 (예상)",
      leftText: formatPrice(car1.discountPrice),
      rightText: formatPrice(car2.discountPrice),
      leftVal: car1.discountPrice,
      rightVal: car2.discountPrice
    },
    {
      label: "월 납입금 (60개월)",
      leftText: `월 ${car1.monthly}만원`,
      rightText: `월 ${car2.monthly}만원`,
      leftVal: car1.monthly,
      rightVal: car2.monthly
    },
  ];

  // 비교 견적 저장 핸들러
  const handleSaveCompareQuote = async () => {
    const userSocialId = localStorage.getItem("user_social_id");

    if (!userSocialId) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }

    const payload = {
      userId: userSocialId,
      type: "compare",
      totalPrice: car1.totalPrice + car2.totalPrice,
      cars: [
        {
          manufacturer: car1.manufacturer,
          model: car1.model_name,
          trim: car1.trim_name,
          price: car1.totalPrice,
          image: car1.image,
          options: car1.selectedOptions.map(o => o.name)
        },
        {
          manufacturer: car2.manufacturer,
          model: car2.model_name,
          trim: car2.trim_name,
          price: car2.totalPrice,
          image: car2.image,
          options: car2.selectedOptions.map(o => o.name)
        }
      ]
    };

    try {
      const baseUrl = "/api";
      // /estimate 경로는 next.config.mjs에서 별도로 처리되므로 유지해도 되지만
      // 일관성을 위해 여기도 체크 필요 (현재는 /api/estimate 로 가정)
      const res = await fetch(`${baseUrl}/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("비교 견적이 견적함에 저장되었습니다!");
        router.push("/mypage/quotes");
      } else {
        alert("저장 실패");
      }
    } catch (e) {
      console.error(e);
      alert("에러 발생: " + e.message);
    }
  };

  return (
    <main style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px 60px" }}>

        {/* 상단 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <button onClick={() => router.back()} style={{ border: "none", background: "none", fontSize: "16px", cursor: "pointer", color: "#555" }}>← 다시 선택하기</button>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#333" }}>비교 견적 결과</h1>
          <div style={{ width: "100px" }}></div>
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>

          {/* 1. 차량 기본 정보 비교 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px" }}>
            {[car1, car2].map((car, idx) => (
              <div key={idx} style={{ textAlign: "center" }}>
                {/* 차량 이미지 */}
                <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", backgroundColor: "#f9f9f9", borderRadius: "16px" }}>
                  <img src={car.image} alt={car.trim_name} style={{ maxWidth: "80%", maxHeight: "140px", objectFit: "contain" }} />
                </div>

                {/* 모델명 */}
                <div style={{ fontSize: "22px", fontWeight: "800", marginBottom: "6px", color: "#222" }}>
                  {car.model_name}
                </div>

                {/* 트림명 | 제조사 */}
                <div style={{ fontSize: "15px", color: "#666", marginBottom: "12px", fontWeight: "500" }}>
                  {car.trim_name} <span style={{ color: "#ddd", margin: "0 4px" }}>|</span> {car.manufacturer}
                </div>

                {/* 가격 */}
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#1d4ed8" }}>
                  {formatPrice(car.totalPrice)}
                </div>
              </div>
            ))}
          </div>

          {/* 2. 선택 옵션 내역 (✅ 여기가 이제 정상 출력됩니다) */}
          <div style={{ marginBottom: "40px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "16px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>선택 옵션 내역</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
              {[car1, car2].map((car, idx) => (
                <div key={idx} style={{ backgroundColor: "#f8f9fa", borderRadius: "12px", padding: "16px", minHeight: "100px" }}>
                  {car.selectedOptions.length > 0 ? (
                    car.selectedOptions.map((opt, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", borderBottom: "1px dashed #eee", paddingBottom: "4px" }}>
                        <span>{opt.name}</span>
                        <span style={{ fontWeight: "bold", color: "#555" }}>+{formatPrice(opt.price)}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", color: "#999", fontSize: "13px", padding: "20px" }}>선택된 옵션 없음</div>
                  )}
                  {car.selectedOptions.length > 0 && (
                    <div style={{ marginTop: "12px", textAlign: "right", fontSize: "14px", fontWeight: "bold", color: "#0052ff" }}>
                      옵션 합계: +{formatPrice(car.optionTotal)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. 가격 비교 테이블 */}
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px", textAlign: "center" }}>가격 비교</h3>
            <div style={{ border: "1px solid #eee", borderRadius: "12px", overflow: "hidden" }}>
              {priceRows.map((row, idx) => {
                const isLeftHigher = row.leftVal > row.rightVal;
                const isRightHigher = row.rightVal > row.leftVal;

                return (
                  <div key={idx} style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 140px 1fr",
                    alignItems: "center",
                    padding: "16px 20px",
                    borderBottom: idx === priceRows.length - 1 ? "none" : "1px solid #f0f0f0",
                    backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa",
                    fontSize: "14px"
                  }}>
                    <div style={{ textAlign: "center", fontWeight: "700", fontSize: "15px", color: isLeftHigher ? "#d32f2f" : "#333" }}>
                      {row.leftText}
                    </div>
                    <div style={{ textAlign: "center", color: "#777", fontSize: "13px", fontWeight: "normal" }}>
                      {row.label}
                    </div>
                    <div style={{ textAlign: "center", fontWeight: "700", fontSize: "15px", color: isRightHigher ? "#d32f2f" : "#333" }}>
                      {row.rightText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div style={{ marginTop: "30px" }}>
            <button 
              style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "none", background: "#111", color: "#fff", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }} 
              onClick={handleSaveCompareQuote}
            >
              견적 저장
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function CompareVsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompareVsContent />
    </Suspense>
  );
}
