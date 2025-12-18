"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 백엔드 API 주소
const API_BASE = "/api";

export default function RecentViewsPage() {
  const router = useRouter();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentCars = async () => {
      // 1. 로컬 스토리지에서 유저 ID 확인
      const userId = localStorage.getItem("user_social_id") || localStorage.getItem("alphacar_user_id");

      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // 2. 백엔드 API 호출 (수정된 vehicle.service.ts 로직 사용)
        const res = await fetch(`${API_BASE}/recent-views?userId=${userId}`);
        
        if (!res.ok) throw new Error("데이터를 불러오는데 실패했습니다.");
        
        const data = await res.json();
        setCars(data);
      } catch (err) {
        console.error("최근 본 차량 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentCars();
  }, []);

  // 차량 클릭 시 개별 견적 페이지로 이동
  const handleCarClick = (car: any) => {
    if (!car || !car.name) {
      alert("차량 정보를 불러올 수 없습니다.");
      return;
    }
    
    // 차량 이름에서 모델명 추출 (예: "[현대] 그랜저" -> "그랜저")
    // 또는 "현대 그랜저" -> "그랜저"
    let modelName = car.name.replace(/\[[^\]]+\]\s*/, "").trim();
    // 공백으로 분리하여 첫 번째 단어가 브랜드명일 수 있으므로, 두 번째 단어를 모델명으로 사용
    const nameParts = modelName.split(/\s+/);
    if (nameParts.length > 1) {
      modelName = nameParts[0]; // 첫 번째 단어를 모델명으로 사용
    }
    
    // 차량 이름 전체를 trimId로 사용 (백엔드에서 차량 이름으로 검색 가능)
    const trimId = car.name;
    
    // 개별 견적 페이지로 이동 (trimId와 modelName 전달)
    const queryParams = new URLSearchParams({ trimId: encodeURIComponent(trimId) });
    if (modelName) {
      queryParams.append('modelName', encodeURIComponent(modelName));
    }
    router.push(`/quote/personal?${queryParams.toString()}`);
  };

  return (
    <main style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        
        {/* 헤더 영역 */}
        <div style={{ marginBottom: "30px", display: "flex", alignItems: "center", gap: "16px" }}>
          <button 
            onClick={() => router.back()} 
            style={{ border: "none", background: "none", fontSize: "16px", cursor: "pointer", color: "#666", padding: 0 }}
          >
            ← 뒤로
          </button>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
            최근 본 차량 <span style={{ color: "#2563eb", fontSize: "18px", marginLeft: "4px" }}>{cars.length}</span>
          </h1>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div style={{ padding: "60px", textAlign: "center", color: "#999", fontSize: "16px" }}>
            목록을 불러오는 중입니다...
          </div>
        )}

        {/* 데이터 없음 상태 */}
        {!loading && cars.length === 0 && (
          <div style={{ padding: "100px 0", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🚗</div>
            <p style={{ color: "#666", fontSize: "16px", marginBottom: "24px" }}>최근 본 차량 기록이 없습니다.</p>
            <button 
              onClick={() => router.push('/')}
              style={{ padding: "12px 30px", borderRadius: "99px", background: "#2563eb", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}
            >
              차량 구경하러 가기
            </button>
          </div>
        )}

        {/* 차량 리스트 그리드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
          {cars.map((car, idx) => (
            <div 
              key={`${car._id}-${idx}`} 
              onClick={() => handleCarClick(car)}
              style={{ 
                backgroundColor: "#fff", borderRadius: "16px", padding: "20px", cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transition: "transform 0.2s, box-shadow 0.2s",
                border: "1px solid #f1f5f9"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
              }}
            >
              {/* 이미지 영역 */}
              <div style={{ width: "100%", height: "150px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", borderRadius: "12px", overflow: "hidden" }}>
                {car.image ? (
                  <img src={car.image} alt={car.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                ) : (
                  <span style={{ color: "#ccc", fontSize: "13px" }}>이미지 없음</span>
                )}
              </div>

              {/* 텍스트 정보 */}
              <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>{car.brand}</div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", marginBottom: "16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {car.name}
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>시작가</span>
                <span style={{ fontSize: "17px", fontWeight: "700", color: "#2563eb" }}>
                  {car.price ? Number(car.price).toLocaleString() + "원" : "가격 문의"}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
