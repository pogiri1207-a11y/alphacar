"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

// 백엔드 API 주소
const API_BASE = "/api";

// [유틸] 견고한 HTTP 응답 처리 헬퍼 함수
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

        // 백엔드에서 차량 정보(옵션 포함) 조회
        // idsParam은 현재 trimId1,trimId2 형태로 되어있음.
        const res = await fetch(`${baseUrl}/vehicles/compare-data?ids=${idsParam}`);
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

  // ✅ [핵심 수정 1] URL에서 개별 trimId/name 추출
  const [trimId1, trimId2] = idsParam.split(','); 

  const selectedOpts1 = new Set(opts1Param ? opts1Param.split(",") : []);
  const selectedOpts2 = new Set(opts2Param ? opts2Param.split(",") : []);

  // ✅ [핵심 수정 2] 데이터 추출 및 병합 로직
  const processCarData = (carData, selectedSet, originalTrimId) => {
    // 1. 선택된 트림 찾기
    let selectedTrim = null;
    const trims = carData.trims || [];

    if (trims.length > 0) {
        const decodedTrimId = decodeURIComponent(originalTrimId);
        
        // A. 이름으로 정확히 일치하는 트림 찾기 (시그니처 A/T 등)
        selectedTrim = trims.find(t => t.trim_name === decodedTrimId); 

        // B. ID로 찾기 (ObjectId)
        if (!selectedTrim) {
            selectedTrim = trims.find(t => t._id === originalTrimId || t.trim_id === originalTrimId);
        }
        
        // C. Fallback: 여전히 못 찾았다면 첫 번째 트림을 기본값으로 사용
        if (!selectedTrim) selectedTrim = trims[0];
    }

    // 2. UI에 사용할 가격 및 옵션 추출
    const basePrice = Number(selectedTrim ? selectedTrim.price || 0 : 0);
    const allOptions = selectedTrim ? selectedTrim.options || [] : [];
    
    // 3. 옵션 매칭 및 합계 계산 (기존 로직 유지)
    const selectedOptions = allOptions.filter((opt, index) => {
        // 1. 진짜 ID(_id)가 있고, 선택 목록에 있는지 확인
        if (opt._id && selectedSet.has(String(opt._id))) {
            return true;
        }

        // 2. ID가 없어서 'opt-순서'로 넘어온 경우 확인 (Fallback)
        const tempIndexId = `opt-${index}`;
        if (selectedSet.has(tempIndexId)) {
            return true;
        }

        return false;
    });

    // 옵션 가격 합계
    const optionTotal = selectedOptions.reduce((sum, opt) => sum + (opt.price || opt.option_price || 0), 0);
    const totalPrice = basePrice + optionTotal;

    const discountPrice = Math.floor(totalPrice * 0.95);
    const monthly = Math.floor(discountPrice / 60 / 10000);

    // 4. UI가 기대하는 flat 구조로 최종 병합
    return {
      ...carData, // Vehicle ID, Image, Brand Name 등 상위 정보 유지
      manufacturer: carData.manufacturer || carData.brand_name || "제조사",
      model_name: carData.model_name || carData.vehicle_name || "모델명",
      trim_name: selectedTrim ? selectedTrim.trim_name : (carData.name || carData.trim_name || "트림"),
      image: carData.main_image || carData.image_url || "/car/sample-left.png",
      basePrice, // ✅ 추출된 트림 기본 가격
      selectedOptions, // 필터링된 옵션 목록
      optionTotal,
      totalPrice,
      discountPrice,
      monthly,
    };
  };

  // ✅ [핵심 수정 3] processCarData 호출 시 원본 trimId 전달
  const car1 = processCarData(cars[0], selectedOpts1, trimId1);
  const car2 = processCarData(cars[1], selectedOpts2, trimId2);

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
          options: car1.selectedOptions.map(o => o.name || o.option_name)
        },
        {
          manufacturer: car2.manufacturer,
          model: car2.model_name,
          trim: car2.trim_name,
          price: car2.totalPrice,
          image: car2.image,
          options: car2.selectedOptions.map(o => o.name || o.option_name)
        }
      ]
    };

    try {
      const baseUrl = "/api";
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
      <style jsx global>{`
        .compare-grid {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 30px !important;
        }
        .compare-car-card {
          display: flex !important;
          flex-direction: column !important;
          min-height: 400px !important;
          height: 100% !important;
        }
        .compare-price-grid {
          display: grid !important;
          grid-template-columns: 1fr 140px 1fr !important;
        }
        .final-price-banner {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 30px !important;
        }
        @media (max-width: 768px) {
          .compare-grid {
            grid-template-columns: 1fr !important;
          }
          .compare-car-card {
            min-height: auto !important;
          }
          .compare-price-grid {
            grid-template-columns: 1fr !important;
          }
          .final-price-banner {
            grid-template-columns: 1fr !important;
          }
          .compare-price-grid > div:nth-child(2) {
            order: -1;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
          }
        }
      `}</style>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px 60px" }}>

        {/* 상단 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <button onClick={() => router.back()} style={{ border: "none", background: "none", fontSize: "16px", cursor: "pointer", color: "#555" }}>← 다시 선택하기</button>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#333" }}>비교 견적 결과</h1>
          <div style={{ width: "100px" }}></div>
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>

          {/* 1. 차량 기본 정보 비교 */}
          <div className="compare-grid" style={{ marginBottom: "40px" }}>
            {[car1, car2].map((car, idx) => (
              <div key={idx} className="compare-car-card" style={{ textAlign: "center", backgroundColor: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #e5e7eb" }}>
                {/* 차량 이미지 */}
                <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", backgroundColor: "#f9f9f9", borderRadius: "16px", flexShrink: 0 }}>
                  <img src={car.image} alt={car.trim_name} style={{ maxWidth: "90%", maxHeight: "180px", objectFit: "contain" }} />
                </div>

                {/* 모델명 */}
                <div style={{ fontSize: "22px", fontWeight: "800", marginBottom: "6px", color: "#222" }}>
                  {car.model_name}
                </div>

                {/* 트림명 | 제조사 */}
                <div style={{ fontSize: "15px", color: "#666", marginBottom: "12px", fontWeight: "500" }}>
                  {car.trim_name} <span style={{ color: "#ddd", margin: "0 4px" }}>|</span> {car.manufacturer}
                </div>

                {/* 기본 가격 */}
                <div style={{ fontSize: "16px", color: "#666", marginBottom: "8px" }}>
                  기본 차량가: <span style={{ fontWeight: "600" }}>{formatPrice(car.basePrice)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 2. 선택 옵션 내역 */}
          <div style={{ marginBottom: "40px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "16px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>선택 옵션 내역</h3>
            <div className="compare-grid">
              {[car1, car2].map((car, idx) => (
                <div key={idx} style={{ backgroundColor: "#f8f9fa", borderRadius: "12px", padding: "16px", minHeight: "150px", display: "flex", flexDirection: "column" }}>
                  <div style={{ flex: 1 }}>
                    {car.selectedOptions.length > 0 ? (
                      car.selectedOptions.map((opt, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", borderBottom: "1px dashed #eee", paddingBottom: "4px" }}>
                          <span>{opt.name || opt.option_name}</span>
                          <span style={{ fontWeight: "bold", color: "#555" }}>+{formatPrice(opt.price || opt.option_price)}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: "center", color: "#999", fontSize: "13px", padding: "20px" }}>선택된 옵션 없음</div>
                    )}
                  </div>
                  {car.selectedOptions.length > 0 && (
                    <div style={{ marginTop: "12px", textAlign: "right", fontSize: "14px", fontWeight: "bold", color: "#0052ff", borderTop: "1px solid #ddd", paddingTop: "12px" }}>
                      옵션 합계: +{formatPrice(car.optionTotal)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 최종 견적가 배너 */}
          <div style={{ marginBottom: "40px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "16px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>최종 견적가</h3>
            <div className="final-price-banner">
              {[car1, car2].map((car, idx) => (
                <div key={idx} style={{ 
                  backgroundColor: "#111", 
                  borderRadius: "12px", 
                  padding: "24px", 
                  textAlign: "center",
                  minHeight: "80px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                  <div style={{ fontSize: "14px", color: "#999", marginBottom: "8px" }}>
                    {idx === 0 ? "차량 1" : "차량 2"}
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#ffd700" }}>
                    {formatPrice(car.totalPrice)}
                  </div>
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
                  <div key={idx} className="compare-price-grid" style={{
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
