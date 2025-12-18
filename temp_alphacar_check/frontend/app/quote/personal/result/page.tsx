"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import React from "react";

// ✅ 타입 정의
interface Range {
  min: number;
  max: number;
}

interface Specs {
  release_date?: string;
  displacement_range?: Range;
  fuel_efficiency_range?: Range;
  [key: string]: any;
}

interface RawOption {
  _id?: string;
  name?: string;
  option_name?: string;
  item_name?: string;
  price?: number | string;
  option_price?: number | string;
  additional_price?: number | string;
  cost?: number | string;
  is_selected?: boolean;
  [key: string]: any;
}

interface MappedOption {
  id: string | number;
  name: string;
  price: number;
  isSelected: boolean;
}

interface TrimData {
  trim_name?: string;
  price?: number;
  options?: RawOption[];
  [key: string]: any;
}

interface CarDetailData {
  manufacturer?: string;
  brand_name?: string;
  vehicle_name?: string;
  model_name?: string;
  name?: string; // 트림명으로 사용됨
  base_price?: number | string;
  price?: number | string;
  image_url?: string;
  main_image?: string;
  specs?: Specs;
  selectedTrimSpecs?: Record<string, any> | null; // 선택된 트림의 전체 specifications
  options?: RawOption[];
  selected_options?: RawOption[];
  trims?: TrimData[];
  [key: string]: any;
}

const API_BASE = "/api";

// 제원 정보 포맷팅 헬퍼 함수
const formatDisplacement = (range?: Range) => {
  if (!range) return "정보 없음";
  if (range.min === range.max) {
    return `${range.min.toLocaleString()}cc`;
  }
  return `${range.min.toLocaleString()}cc ~ ${range.max.toLocaleString()}cc`;
};

const formatFuelEfficiency = (range?: Range) => {
  if (!range) return "정보 없음";
  if (range.min === range.max) {
    return `${range.min.toFixed(1)}km/L`;
  }
  return `${range.min.toFixed(1)}km/L ~ ${range.max.toFixed(1)}km/L`;
};

// [핵심 유틸] 가격 파싱 함수
const parsePrice = (opt: RawOption): number => {
  const rawPrice = opt.price || opt.option_price || opt.additional_price || opt.cost || 0;

  if (typeof rawPrice === "number") return rawPrice;
  if (typeof rawPrice === "string") {
    const cleanStr = rawPrice.replace(/[^0-9]/g, "");
    return parseInt(cleanStr, 10) || 0;
  }
  return 0;
};

// API 응답 처리 함수
const handleApiResponse = async (res: Response) => {
  if (!res.ok) {
    let errorData: any = {};
    let errorMsg = `API 요청 실패 (Status: ${res.status})`;
    try {
      errorData = await res.json();
      if (errorData.message) errorMsg = errorData.message;
    } catch (e) {
      errorData = {
        message: `API 서버 오류: ${res.status} ${res.statusText}`,
        status: res.status
      };
    }
    return Promise.reject(errorData);
  }
  return res.json();
};

// ------------------------------------------------------------------
// 1️⃣ 실제 로직 컴포넌트 (useSearchParams 사용)
// ------------------------------------------------------------------
function QuoteResultContent() {
  const searchParams = useSearchParams();
  const trimId = searchParams.get("trimId");
  const modelName = searchParams.get("modelName");
  const router = useRouter();

  const [carDetail, setCarDetail] = useState<CarDetailData | null>(null);
  const [options, setOptions] = useState<MappedOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 데이터 불러오기
  useEffect(() => {
    if (!trimId) {
      setLoading(false);
      setError("Trim ID가 URL에 누락되었습니다.");
      return;
    }

    const fetchDetailData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 차종 이름이 있으면 함께 전달
        const queryParams = new URLSearchParams({ trimId });
        if (modelName) {
          queryParams.append('modelName', modelName);
        }
        const res = await fetch(`${API_BASE}/vehicles/detail?${queryParams.toString()}`);
        const rawVehicleData: CarDetailData = await handleApiResponse(res);

        // 트림 데이터 추출 및 병합
        let selectedTrim: TrimData | null = null;
        const trims = rawVehicleData.trims || [];
        let mergedDetail: CarDetailData;

        if (trims.length > 0) {
            selectedTrim = trims[0];
        }
        
        if (selectedTrim) {
            mergedDetail = {
                ...rawVehicleData, // selectedTrimSpecs 포함
                name: selectedTrim.trim_name, // 트림명
                base_price: selectedTrim.price, // 트림 가격
                options: selectedTrim.options || [], // 옵션 배열
            };
        } else {
            mergedDetail = rawVehicleData;
            mergedDetail.options = rawVehicleData.options || [];
        }

        setCarDetail(mergedDetail);

        // 옵션 리스트 매핑
        const rawOptions = mergedDetail.options || mergedDetail.selected_options || [];

        const mapped: MappedOption[] = rawOptions.map((opt: RawOption, idx: number) => ({
          id: opt._id || idx,
          name: opt.name || opt.option_name || opt.item_name || "옵션명 없음",
          price: parsePrice(opt),
          isSelected: typeof opt.is_selected === "boolean" ? opt.is_selected : false,
        }));

        setOptions(mapped);

      } catch (err: any) {
        const msg = err.message || `API 요청 실패 (Status: ${err.status})`;
        console.error("🚨 데이터 로드 중 오류 발생:", err);
        setError(msg);
        setCarDetail(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetailData();
  }, [trimId]);

  // 옵션 선택 토글
  const toggleOption = (id: string | number) => {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === id ? { ...opt, isSelected: !opt.isSelected } : opt
      )
    );
  };

  // 금액 계산
  const { basePrice, optionsTotal, finalPrice } = useMemo(() => {
    const baseRaw = carDetail?.base_price || carDetail?.price || 0;
    let base = 0;

    if (typeof baseRaw === "number") base = baseRaw;
    else if (typeof baseRaw === "string") {
        base = parseInt(baseRaw.replace(/[^0-9]/g, ""), 10) || 0;
    }

    const optTotal = options
      .filter((o) => o.isSelected)
      .reduce((sum, o) => sum + o.price, 0);

    return {
      basePrice: base,
      optionsTotal: optTotal,
      finalPrice: base + optTotal,
    };
  }, [carDetail, options]);

  // 견적 저장 핸들러
  const handleSaveQuote = async () => {
    if (!carDetail || isSaving) return;

    const userSocialId = localStorage.getItem("user_social_id");

    if (!userSocialId) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }

    const payload = {
      userId: userSocialId,
      type: "single",
      totalPrice: finalPrice,
      cars: [
        {
          manufacturer: carDetail.manufacturer || "제조사",
          model: carDetail.vehicle_name || carDetail.model_name,
          trim: carDetail.name,
          price: finalPrice,
          image: carDetail.image_url || carDetail.main_image,
          options: options.filter((o) => o.isSelected).map((o) => o.name),
        },
      ],
    };

    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE}/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        localStorage.setItem("quote_saved", "1");
        router.push("/mypage/quotes");
      } else {
        alert("저장 실패");
      }
    } catch (e) {
      console.error(e);
      alert("에러 발생");
    } finally {
      setIsSaving(false);
    }
  };

  // 비교 견적 핸들러
  const handleCompareClick = () => {
    const selectedOptionIds = options
      .filter((o) => o.isSelected)
      .map((o) => o.id);

    const queryString = new URLSearchParams({
      car1_trimId: trimId || "",
      car1_options: selectedOptionIds.join(","),
    }).toString();

    router.push(`/quote/compare?${queryString}`);
  };

  // 안전한 이미지 경로
  const safeImageSrc = carDetail?.image_url || carDetail?.main_image;

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>로딩 중...</div>
    );
  if (error)
    return (
      <div style={{ padding: "40px", textAlign: "center", color: 'red', backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        차량 정보를 로드할 수 없습니다: {error}
      </div>
    );
  if (!carDetail)
    return (
      <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        차량 정보를 찾을 수 없습니다.
      </div>
    );

  return (
    <main
      style={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        padding: "24px 20px 60px",
      }}
    >
      {/* 저장 중 오버레이 */}
      {isSaving && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff", padding: "20px 28px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", minWidth: "180px",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 50 50" aria-hidden="true">
              <circle cx="25" cy="25" r="20" stroke="#0066ff" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="31.4 188.4">
                <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
              </circle>
            </svg>
            <span style={{ fontSize: "14px", color: "#333" }}>
              견적을 저장하는 중입니다...
            </span>
          </div>
        </div>
      )}

      <div style={{ maxWidth: "550px", margin: "0 auto" }}>
        {/* 뒤로가기 버튼 */}
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            marginBottom: "16px",
            cursor: "pointer",
            fontSize: "14px",
            color: "#555",
          }}
        >
          ← 뒤로 가기
        </button>

        {/* 메인 카드 */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            padding: "32px 32px 28px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          {/* 1. 상단 차량 이미지 + 이름 */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                width: "100%",
                maxWidth: "280px",
                height: "180px",
                margin: "0 auto 16px",
                borderRadius: "12px",
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}
            >
              {safeImageSrc ? (
                 <img
                   src={safeImageSrc}
                   alt={carDetail.name || "차량 이미지"}
                   style={{ width: "100%", height: "100%", objectFit: "contain" }}
                 />
              ) : (
                <div style={{ width: "180px", height: "110px", backgroundColor: "#f3f3f3", borderRadius: "12px" }} />
              )}
            </div>

            <div
              style={{
                fontSize: "22px",
                fontWeight: 800,
                marginBottom: "4px",
                color: "#000"
              }}
            >
              {carDetail.vehicle_name || carDetail.model_name || "모델명 없음"}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#777",
              }}
            >
              {carDetail.name} | {carDetail.brand_name || carDetail.manufacturer}
            </div>
          </div>

          {/* 2. 기본 가격 */}
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
            <span style={{ fontWeight: 700, color: "#1d4ed8", fontSize: "16px" }}>
              {basePrice > 0 ? `${basePrice.toLocaleString()}원` : "가격 정보 없음"}
            </span>
          </div>

          {/* 3. 옵션 리스트 */}
          <div style={{ fontSize: "13px", marginBottom: "20px" }}>
            <div style={{ fontWeight: 700, marginBottom: "8px", fontSize: "14px" }}>
              옵션 선택 ({options.filter(o => o.isSelected).length})
            </div>

            <div
              style={{
                borderRadius: "12px",
                border: "1px solid #eee",
                padding: "6px 0",
                maxHeight: "120px",
                overflowY: "auto",
              }}
            >
               {options.length === 0 ? (
                 <div style={{ padding: "12px", textAlign: "center", color: "#999", fontSize: "12px" }}>선택 가능한 옵션이 없습니다.</div>
              ) : (
                options.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "6px 12px",
                      borderBottom: "1px solid #f5f5f5",
                      cursor: "pointer",
                      backgroundColor: opt.isSelected ? "#fdfdfd" : "#fff"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={opt.isSelected}
                      readOnly
                      style={{ marginRight: "10px", cursor: "pointer", width: "14px", height: "14px", accentColor: "#2563eb" }}
                    />
                    <span style={{ flex: 1, fontWeight: opt.isSelected ? 600 : 400, fontSize: "12px" }}>{opt.name}</span>
                    <span style={{ fontSize: "11px", color: opt.isSelected ? "#1d4ed8" : "#666", fontWeight: opt.isSelected ? 700 : 400 }}>
                      {opt.price > 0 ? `+${opt.price.toLocaleString()}원` : "0원"}
                    </span>
                  </div>
                ))
              )}
            </div>
           {/* 옵션 합계 표시 */}
           <div style={{ textAlign: "right", marginTop: "6px", fontSize: "12px", color: "#666" }}>
             옵션 합계: <span style={{ fontWeight: 700 }}>{optionsTotal.toLocaleString()}원</span>
           </div>
          </div>

          {/* 4. 최종 차량가 */}
          <div
            style={{
              backgroundColor: "#fff3ee",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "16px",
              fontWeight: 700,
              marginBottom: "24px"
            }}
          >
            <span>최종 차량가</span>
            <span style={{ color: "#e11d48", fontSize: "20px" }}>{finalPrice.toLocaleString()}원</span>
          </div>

          {/* 제원 정보 섹션 - 선택된 트림의 전체 specifications */}
          {(() => {
            const selectedTrimSpecs = carDetail?.selectedTrimSpecs || {};
            const validSpecs = Object.entries(selectedTrimSpecs).filter(([key, value]) => {
              if (value === null || value === undefined || value === '') return false;
              if (typeof value === 'string' && value.trim() === '') return false;
              return true;
            });
            
            return validSpecs.length > 0 ? (
              <div style={{ marginBottom: "24px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "16px", color: "#333" }}>제원 정보</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                  {validSpecs.map(([key, value]) => (
                    <div key={key}>
                      <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>{key}</p>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* 5. 하단 버튼 영역 */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={handleSaveQuote}
              style={{
                flex: 1,
                height: "48px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#333",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              견적 저장
            </button>
            <button
              type="button"
              onClick={handleCompareClick}
              style={{
                flex: 1,
                height: "48px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#0066ff",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              비교 견적
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}

// ------------------------------------------------------------------
// 2️⃣ [핵심] Suspense Wrapper (빌드 에러 방지용)
// ------------------------------------------------------------------
export default function QuoteResultPage() {
  return (
    <Suspense fallback={<div style={{ padding: "100px", textAlign: "center" }}>로딩 중...</div>}>
      <QuoteResultContent />
    </Suspense>
  );
}
