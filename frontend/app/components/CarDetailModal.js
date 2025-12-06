"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const formatPrice = (price) => {
  if (!price) return "가격 문의";
  const numPrice = Number(price);
  if (isNaN(numPrice)) return price;
  return (numPrice / 10000).toLocaleString() + "만원";
};

export default function CarDetailModal({ car, onClose }) {
  const router = useRouter();

  // ✅ [기능 추가] 모달이 열릴 때(마운트 시) Redis에 조회 기록 저장
  useEffect(() => {
    if (!car) return;

    // 1. 사용자 ID와 차량 ID 확인
    const userId = localStorage.getItem("user_social_id") || localStorage.getItem("alphacar_user_id");
    const vehicleId = car._id || car.id;

    if (userId && vehicleId) {
      // 2. 백엔드(/api/history)로 기록 요청
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, vehicleId })
      })
      .then((res) => {
        if (res.ok) {
          // 3. 성공 시 사이드바(RightSideBar) 카운트 갱신 트리거 이벤트 발생
          window.dispatchEvent(new Event("vehicleViewed"));
          console.log(`[History] 차량 조회 기록됨: ${vehicleId}`);
        }
      })
      .catch((err) => console.error("히스토리 저장 실패:", err));
    }
  }, []); // 빈 배열: 모달이 처음 뜰 때 한 번만 실행

  if (!car) return null;

  // 3. 견적 페이지 이동 처리 함수 (기존 로직 유지)
  const handleGoToQuoteResult = async () => {
    // 1. 현재 car 객체의 ID는 '차량(Vehicle) ID'입니다.
    const vehicleId = car._id || car.id;

    if (!vehicleId) {
      console.error("차량 ID 정보가 누락되었습니다.");
      alert("차량 ID 정보가 없어 이동할 수 없습니다.");
      return;
    }

    try {
      // 2. 해당 차량의 '트림 목록'을 조회하여 첫 번째 트림 ID를 가져옵니다.
      // (우리가 설정한 프록시 /api/vehicles/trims 경로 사용)
      const res = await fetch(`/api/vehicles/trims?modelId=${vehicleId}`);

      if (!res.ok) {
        throw new Error("트림 정보를 가져오는데 실패했습니다.");
      }

      const trims = await res.json();

      if (Array.isArray(trims) && trims.length > 0) {
        // 3. 가장 첫 번째(기본) 트림의 ID를 추출합니다.
        const targetTrimId = trims[0]._id;

        console.log(`차량 ID(${vehicleId}) -> 트림 ID(${targetTrimId}) 변환 성공`);

        // 4. 올바른 트림 ID를 가지고 상세 견적 페이지로 이동합니다.
        router.push(`/quote/personal/result?trimId=${targetTrimId}`);
      } else {
        alert("해당 차량의 트림 정보가 없어 견적을 낼 수 없습니다.");
      }

    } catch (error) {
      console.error("이동 중 오류 발생:", error);
      alert("상세 페이지로 이동하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex",
        justifyContent: "center", alignItems: "center", zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff", width: "90%", maxWidth: "500px",
          borderRadius: "16px", padding: "40px 30px", position: "relative",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "15px", right: "15px",
            background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#888"
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: "center" }}>
          {/* 1. 제조사 및 차량명 */}
          <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "5px", color: "#333" }}>
            {car.name}
          </h2>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
            {car.manufacturer}
          </p>

          {/* 2. 차량 이미지 */}
          <div style={{ margin: "20px 0", height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {car.imageUrl ? (
              <img
                src={car.imageUrl}
                alt={car.name}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#f5f5f5", borderRadius: "10px", display:"flex", alignItems:"center", justifyContent:"center", color: "#aaa"}}>
                이미지 준비중
              </div>
            )}
          </div>

          {/* 3. 가격 정보 */}
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "5px" }}>예상 구매 가격</p>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "#0070f3" }}>
              {formatPrice(car.minPrice || car.base_price || car.price)} ~
            </p>
          </div>

          {/* 4. 견적 버튼 */}
          <button
            style={{
              marginTop: "25px", width: "100%", padding: "15px 0",
              backgroundColor: "#0070f3", color: "white", border: "none",
              borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer",
            }}
            onClick={handleGoToQuoteResult}
          >
            상세 견적 확인하기
          </button>
        </div>
      </div>
    </div>
  );
}
