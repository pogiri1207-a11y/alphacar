"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import React, { Suspense } from "react"; // Suspense import 추가 (만약 누락되었다면)


const API_BASE = "/api"; // /api로 유지

// [핵심 유틸] 가격 데이터가 어디에 숨어있든 찾아서 숫자로 변환하는 강력한 함수
const parsePrice = (opt) => {
  // 1. 가격이 있을만한 필드들을 모두 검사
  const rawPrice = opt.price || opt.option_price || opt.additional_price || opt.cost || 0;

  if (typeof rawPrice === "number") return rawPrice;
  if (typeof rawPrice === "string") {
    // "400,000원" -> "400000"으로 숫자만 남기고 변환
    const cleanStr = rawPrice.replace(/[^0-9]/g, "");
    return parseInt(cleanStr, 10) || 0;
  }
  return 0;
};

// 🚨 [수정 1] 응답 상태를 체크하고 JSON 파싱 오류를 방지하는 헬퍼 함수
// Promise.reject를 사용하여 catch 블록에 오류 객체를 던집니다.
const handleApiResponse = async (res) => {
  if (!res.ok) {
    let errorData = {};
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
    // 오류 발생 시 errorData 객체를 통째로 던집니다.
    return Promise.reject(errorData); 
  }
  return res.json();
};

export default function QuoteResultPage() {
  const searchParams = useSearchParams();
  const trimId = searchParams.get("trimId");
  const router = useRouter();

  const [carDetail, setCarDetail] = useState(null);
  const [options, setOptions] = useState([]); // 옵션 리스트
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 저장 중 상태
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
        // API 호출: trimId에 lineup_id가 넘어올 것을 기대합니다.
        const res = await fetch(`${API_BASE}/vehicles/detail?trimId=${trimId}`);
        const rawVehicleData = await handleApiResponse(res); 

        // --- [핵심 수정 2] 트림 데이터 추출 및 병합 로직 단순화 ---
        let selectedTrim = null;
        const trims = rawVehicleData.trims || [];
        let mergedDetail;

        // 트림 배열이 존재하면 첫 번째 트림을 선택
        if (trims.length > 0) {
            selectedTrim = trims[0]; 
        }
        
        if (selectedTrim) {
            // 트림을 찾은 경우, Vehicle 정보와 트림 정보를 병합
            mergedDetail = {
                ...rawVehicleData, // 상위 정보 유지
                name: selectedTrim.trim_name, // ✅ 트림명 덮어쓰기 (UI 표시용)
                base_price: selectedTrim.price, // ✅ 트림 가격 덮어쓰기
                options: selectedTrim.options || [], // ✅ 옵션 배열 덮어쓰기
            };
        } else {
            // 트림이 없는 경우, 기본 Vehicle 정보만 사용
            mergedDetail = rawVehicleData;
            mergedDetail.options = rawVehicleData.options || [];
        }

        setCarDetail(mergedDetail);

        // --- 옵션 리스트 매핑 ---
        const rawOptions = mergedDetail.options || mergedDetail.selected_options || [];

        const mapped = rawOptions.map((opt, idx) => ({
          id: opt._id || idx,
          name: opt.name || opt.option_name || opt.item_name || "옵션명 없음",
          price: parsePrice(opt),
          isSelected: typeof opt.is_selected === "boolean" ? opt.is_selected : false,
        }));

        setOptions(mapped);

      } catch (err) {
        // 🚨 [수정 3] err 객체에서 message를 정확하게 추출합니다.
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
  const toggleOption = (id) => {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === id ? { ...opt, isSelected: !opt.isSelected } : opt
      )
    );
  };

  // 금액 계산 (useMemo)
  const { basePrice, optionsTotal, finalPrice } = useMemo(() => {
    // 기본 가격은 carDetail.base_price 또는 carDetail.price를 사용
    const baseRaw = carDetail?.base_price || carDetail?.price || 0;
    let base = 0;

    if (typeof baseRaw === "number") base = baseRaw;
    else if (typeof baseRaw === "string") {
        base = parseInt(baseRaw.replace(/[^0-9]/g, ""), 10) || 0;
    }

    // 옵션 합계 계산
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
      car1_trimId: trimId,
      car1_options: selectedOptionIds.join(","),
    }).toString();

    router.push(`/quote/compare?${queryString}`);
  };

  // UI 렌더링
  // 🚨 [수정 전 이미지 경로 설정]: UI 렌더링 부분 상단에 안전 변수 설정
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
      {/* 저장 중일 때 오버레이 */}
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
                   alt={carDetail.name}
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
              {/* carDetail.name은 이제 트림 이름입니다. */}
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
                      {/* 가격이 0원보다 크면 표시, 아니면 '포함' 또는 '0원' 표시 */}
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
