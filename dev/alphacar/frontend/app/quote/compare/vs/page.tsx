"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useMemo } from "react";

// ✅ TypeScript 인터페이스 정의
interface Option {
  _id?: string;
  id?: string;
  name?: string;
  option_name?: string;
  price?: number;
  option_price?: number;
  [key: string]: any;
}

interface Trim {
  _id?: string;
  trim_id?: string;
  trim_name?: string;
  price?: number;
  options?: Option[];
  [key: string]: any;
}

interface CarData {
  _id?: string;
  id?: string;
  manufacturer?: string;
  brand_name?: string;
  model_name?: string;
  vehicle_name?: string;
  name?: string;
  trim_name?: string;
  main_image?: string;
  image_url?: string;
  trims?: Trim[];
  [key: string]: any;
}

interface ProcessedCar {
  manufacturer: string;
  model_name: string;
  trim_name: string;
  image: string;
  basePrice: number;
  selectedOptions: Option[];
  optionTotal: number;
  totalPrice: number;
  discountPrice: number;
  monthly: number;
  [key: string]: any;
}

const API_BASE = "/api";

const handleApiResponse = async (res: Response) => {
  if (!res.ok) {
    let errorData: any = {};
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
  const idsParam = searchParams.get("ids");

  // ✅ 1. URL 옵션 파라미터를 읽고 Set으로 변환 (인덱스 "0", "1" 등 대응 가능)
  const selectedOptsArray = useMemo(() => {
    const results: Set<string>[] = [];
    for (let i = 1; i <= 5; i++) {
      const opts = searchParams.get(`opts${i}`) || "";
      const optSet = new Set(
        opts.split(",")
          .map(o => decodeURIComponent(o.trim()))
          .filter(Boolean)
      );
      results.push(optSet);
    }
    return results;
  }, [searchParams]);

  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price: number | string | undefined) => {
    return Number(price || 0).toLocaleString() + "원";
  };

  useEffect(() => {
    if (!idsParam) {
      setLoading(false);
      return;
    }
    const fetchCompareData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/vehicles/compare-data?ids=${idsParam}`);
        const data = await handleApiResponse(res);
        setCars(data);
      } catch (err: any) {
        console.error("에러 발생:", err.message || err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompareData();
  }, [idsParam]);

  // ✅ 2. 인덱스 기반 매칭 로직 보강
  const processCarData = (carData: CarData, selectedSet: Set<string>, originalTrimId: string): ProcessedCar => {
    let selectedTrim: Trim | undefined = undefined;
    const trims = carData.trims || [];

    if (trims.length > 0) {
      const decodedTrimId = decodeURIComponent(originalTrimId);
      selectedTrim = trims.find((t) => t.trim_name === decodedTrimId) ||
                     trims.find((t) => t._id === originalTrimId || t.trim_id === originalTrimId) ||
                     trims[0];
    }

    const basePrice = Number(selectedTrim ? selectedTrim.price || 0 : 0);
    const allOptions = selectedTrim ? selectedTrim.options || [] : [];

    // ✅ [수정] ID, 이름 뿐만 아니라 "인덱스(0, 1, 2...)"로 넘어온 경우까지 모두 체크
    const selectedOptions = allOptions.filter((opt, idx) => {
      const optName = opt.name || opt.option_name || "";
      const optId = opt._id || opt.id || "";
      const optIndex = String(idx); // 현재 옵션의 순서(0, 1, 2...)
      
      return selectedSet.has(optId) || 
             selectedSet.has(optName) || 
             selectedSet.has(optIndex) ||
             selectedSet.has(`opt-${idx}`);
    });

    const optionTotal = selectedOptions.reduce((sum, opt) => sum + (opt.price || opt.option_price || 0), 0);
    const totalPrice = basePrice + optionTotal;
    const discountPrice = Math.floor(totalPrice * 0.95);
    const monthly = Math.floor(discountPrice / 60 / 10000);

    return {
      ...carData,
      manufacturer: carData.manufacturer || carData.brand_name || "제조사",
      model_name: carData.model_name || carData.vehicle_name || "모델명",
      trim_name: selectedTrim ? (selectedTrim.trim_name || "트림") : (carData.name || carData.trim_name || "트림"),
      image: carData.main_image || carData.image_url || "/car/sample-left.png",
      basePrice,
      selectedOptions,
      optionTotal,
      totalPrice,
      discountPrice,
      monthly,
    };
  };

  const trimIds = idsParam ? idsParam.split(',').filter(id => id.trim() !== '') : [];
  const processedCars = cars.map((carData, index) => {
    const trimId = trimIds[index] || '';
    const selectedOpts = selectedOptsArray[index] || new Set();
    return processCarData(carData, selectedOpts, trimId);
  });

  const handleSaveCompareQuote = async () => {
    const userSocialId = localStorage.getItem("user_social_id");
    if (!userSocialId) { alert("로그인이 필요합니다."); return; }

    const payload = {
      userId: userSocialId,
      type: "compare",
      totalPrice: processedCars.reduce((sum, car) => sum + car.totalPrice, 0),
      cars: processedCars.map(car => ({
        manufacturer: car.manufacturer,
        model: car.model_name,
        trim: car.trim_name,
        price: car.totalPrice,
        image: car.image,
        options: car.selectedOptions.map(o => o.name || o.option_name)
      }))
    };

    try {
      const res = await fetch(`${API_BASE}/estimate`, {
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
    } catch (e: any) {
      alert("에러 발생: " + e.message);
    }
  };

  if (loading) return <main style={{ padding: "100px", textAlign: "center" }}><p>결과를 불러오는 중입니다...</p></main>;

  return (
    <main style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <style jsx global>{`
        .compare-grid { display: grid !important; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important; gap: 30px !important; }
        .compare-car-card { display: flex !important; flex-direction: column !important; min-height: 400px !important; height: 100% !important; }
        .final-price-banner { display: grid !important; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important; gap: 30px !important; }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <button onClick={() => router.back()} style={{ border: "none", background: "none", fontSize: "16px", cursor: "pointer", color: "#555" }}>← 다시 선택하기</button>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#333" }}>비교 견적 결과</h1>
          <div style={{ width: "100px" }}></div>
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <div className="compare-grid" style={{ marginBottom: "40px" }}>
            {processedCars.map((car, idx) => (
              <div key={idx} className="compare-car-card" style={{ textAlign: "center", backgroundColor: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #e5e7eb" }}>
                <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", backgroundColor: "#f9f9f9", borderRadius: "16px" }}>
                  <img src={car.image} alt={car.trim_name} style={{ maxWidth: "90%", maxHeight: "180px", objectFit: "contain" }} />
                </div>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#222" }}>{car.model_name}</div>
                <div style={{ fontSize: "15px", color: "#666", marginBottom: "12px" }}>{car.trim_name} | {car.manufacturer}</div>
                <div style={{ fontSize: "16px", color: "#666" }}>기본 차량가: <span style={{ fontWeight: "600" }}>{formatPrice(car.basePrice)}</span></div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "40px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "16px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>선택 옵션 내역</h3>
            <div className="compare-grid">
              {processedCars.map((car, idx) => (
                <div key={idx} style={{ backgroundColor: "#f8f9fa", borderRadius: "12px", padding: "16px", minHeight: "150px", display: "flex", flexDirection: "column" }}>
                  <div style={{ flex: 1 }}>
                    {car.selectedOptions.length > 0 ? car.selectedOptions.map((opt, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", borderBottom: "1px dashed #eee", paddingBottom: "4px" }}>
                        <span>{opt.name || opt.option_name}</span>
                        <span style={{ fontWeight: "bold", color: "#555" }}>+{formatPrice(opt.price || opt.option_price)}</span>
                      </div>
                    )) : <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>선택된 옵션 없음</div>}
                  </div>
                  <div style={{ marginTop: "12px", textAlign: "right", fontWeight: "bold", color: "#0052ff", borderTop: "1px solid #ddd", paddingTop: "12px" }}>
                    옵션 합계: +{formatPrice(car.optionTotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="final-price-banner" style={{ marginBottom: "40px" }}>
            {processedCars.map((car, idx) => (
              <div key={idx} style={{ backgroundColor: "#111", borderRadius: "12px", padding: "24px", textAlign: "center", color: "#fff" }}>
                <div style={{ fontSize: "14px", color: "#999", marginBottom: "8px" }}>차량 {idx + 1} 견적가</div>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#ffd700" }}>{formatPrice(car.totalPrice)}</div>
              </div>
            ))}
          </div>

          <button style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "none", background: "#111", color: "#fff", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }} onClick={handleSaveCompareQuote}>
            비교 견적 저장
          </button>
        </div>
      </div>
    </main>
  );
}

export default function CompareVsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "100px", textAlign: "center" }}>로딩 중...</div>}>
      <CompareVsContent />
    </Suspense>
  );
}
