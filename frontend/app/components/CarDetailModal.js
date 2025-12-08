// app/components/CarDetailModal.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const formatPrice = (price) => {
  if (!price) return "가격 문의";
  const numPrice = Number(price);
  if (isNaN(numPrice)) return price;
  return (numPrice / 10000).toLocaleString() + "만원";
};

const HeartIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill={filled ? "#ff4d4f" : "rgba(0,0,0,0.5)"} stroke={filled ? "#ff4d4f" : "#ffffff"} strokeWidth="2" style={{ transition: "all 0.2s ease" }}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export default function CarDetailModal({ car, onClose }) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [userId, setUserId] = useState(null);
  const [carDetail, setCarDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 색상 이미지 표시 개수 상태
  const [colorImagesCount, setColorImagesCount] = useState(4);
  const [exteriorImagesCount, setExteriorImagesCount] = useState(4);
  const [interiorImagesCount, setInteriorImagesCount] = useState(4);
  
  // 이미지 로드 실패 추적 (각 갤러리별로)
  const [failedImageKeys, setFailedImageKeys] = useState(new Set());

  // ✅ [최종 수정] 백엔드가 보내준 'vehicleId' 필드를 직접 사용합니다.
  const targetId = car.vehicleId || car._id || car.id; 
  
  const carName = car.name || car.vehicle_name;
  const brandName = car.manufacturer || car.brand_name;
  const imageUrl = car.imageUrl || car.main_image;
  const displayPrice = car.minPrice || (car.trims && car.trims[0]?.price) || car.base_price || car.price;

  useEffect(() => {
    if (!car) return;
    
    // 디버깅: 전달받은 car 객체 확인
    console.log("🚗 [모달] 전달받은 car 객체:", car);
    console.log("🚗 [모달] targetId:", targetId);
    
    const storedUserId = localStorage.getItem("user_social_id") || localStorage.getItem("alphacar_user_id");
    setUserId(storedUserId);

    // 차량 상세 정보 가져오기
    if (targetId) {
      setLoading(true);
      const apiUrl = `/api/vehicles/detail?trimId=${encodeURIComponent(targetId)}`;
      console.log("🌐 [모달] API 호출:", apiUrl);
      
      fetch(apiUrl)
        .then(res => {
          console.log("📡 [모달] API 응답 상태:", res.status, res.statusText);
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log("📦 [차량 상세 데이터 응답]:", data);
          console.log("📦 [specs 데이터]:", data?.specs);
          console.log("📦 [배기량 범위]:", data?.specs?.displacement_range);
          console.log("📦 [복합연비 범위]:", data?.specs?.fuel_efficiency_range);
          console.log("📦 [색상 이미지]:", data?.all_color_images?.length);
          setCarDetail(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("❌ [모달] 차량 상세 정보 로딩 실패:", err);
          setLoading(false);
        });
    } else {
      console.warn("⚠️ [모달] targetId가 없습니다. car 객체:", car);
    }

    if (storedUserId && targetId) {
      // 조회수 기록
      fetch(`/api/log-view/${targetId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: storedUserId })
      }).then((res) => {
        if (res.ok) window.dispatchEvent(new Event("vehicleViewed"));
      }).catch((err) => console.error("히스토리 저장 실패:", err));

      // 찜 상태 확인
      fetch(`/api/favorites/status?userId=${storedUserId}&vehicleId=${targetId}`)
        .then(res => res.json())
        .then(data => setIsLiked(data.isLiked))
        .catch(err => console.error("찜 상태 확인 실패:", err));
    }
  }, [car, targetId]);

  const handleToggleLike = async (e) => {
    e.stopPropagation();
    if (!userId) return alert("로그인이 필요한 서비스입니다.");
    
    const prevLiked = isLiked;
    setIsLiked(!prevLiked);

    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, vehicleId: targetId })
      });
      if (!res.ok) throw new Error("API 오류");
    } catch (err) {
      console.error("찜하기 실패:", err);
      setIsLiked(prevLiked);
    }
  };

  if (!car) return null;

  // ✅ [최종 수정] 이동 로직: targetId 사용
  const handleGoToQuoteResult = () => {
    if (!targetId) {
      // 여전히 ID가 없다면 콘솔에 전체 객체를 찍어서 확인
      console.error("ID Missing in car object:", car);
      alert("차량 ID 정보를 불러오지 못했습니다.");
      return;
    }
    router.push(`/quote/personal/result?trimId=${targetId}`);
  };

  // 제원 정보 포맷팅
  const formatDisplacement = (range) => {
    if (!range) return "정보 없음";
    if (range.min === range.max) {
      return `${range.min.toLocaleString()}cc`;
    }
    return `${range.min.toLocaleString()}cc ~ ${range.max.toLocaleString()}cc`;
  };

  const formatFuelEfficiency = (range) => {
    if (!range) return "정보 없음";
    if (range.min === range.max) {
      return `${range.min.toFixed(1)}km/L`;
    }
    return `${range.min.toFixed(1)}km/L ~ ${range.max.toFixed(1)}km/L`;
  };

  // 색상 이미지 렌더링 헬퍼
  const renderImageGallery = (images, allImages, count, setCount, title) => {
    // 이미지가 없으면 섹션 자체를 표시하지 않음
    if (!allImages || allImages.length === 0) return null;
    
    // 유효한 이미지 URL이 있는지 확인
    const validImages = allImages.filter(img => {
      const imageUrl = img.image_url || img.url || img;
      return imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '';
    });
    
    // 유효한 이미지가 없으면 섹션을 표시하지 않음
    if (validImages.length === 0) return null;
    
    const visibleImages = validImages.slice(0, count);
    const hasMore = validImages.length > count;
    
    // 현재 갤러리의 실패한 이미지 키 필터링
    const galleryPrefix = `${title}-`;
    const galleryFailedKeys = Array.from(failedImageKeys).filter(key => key.startsWith(galleryPrefix));
    
    // 모든 이미지가 로드 실패했는지 확인
    const allImagesFailed = visibleImages.length > 0 && galleryFailedKeys.length === visibleImages.length;
    
    // 모든 이미지가 실패하면 섹션을 표시하지 않음
    if (allImagesFailed) return null;

    return (
      <div style={{ marginTop: "15px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px", color: "#333", textAlign: "left" }}>{title}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
          {visibleImages.map((img, idx) => {
            const imageUrl = img.image_url || img.url || img;
            const imageName = img.color_name || `이미지 ${idx + 1}`;
            const imageKey = `${title}-${idx}`;
            
            // 이미지가 이미 실패했으면 표시하지 않음
            if (failedImageKeys.has(imageKey)) return null;
            
            return (
              <div key={idx} style={{ position: "relative", aspectRatio: "4/3", borderRadius: "8px", overflow: "hidden", border: "1px solid #eee" }}>
                <img 
                  src={imageUrl} 
                  alt={imageName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    // 이미지 로드 실패 시 실패 목록에 추가
                    setFailedImageKeys(prev => new Set([...prev, imageKey]));
                    e.target.style.display = "none";
                    e.target.parentElement.style.display = "none";
                  }}
                />
                {img.color_name && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)", padding: "6px 8px", color: "#fff", fontSize: "11px", fontWeight: 500 }}>
                    {img.color_name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {hasMore && (
          <button
            onClick={() => setCount(count + 4)}
            style={{
              marginTop: "12px",
              width: "100%",
              padding: "10px",
              backgroundColor: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#333",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#e5e5e5"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#f5f5f5"}
          >
            더보기 ({validImages.length - count}개 더)
          </button>
        )}
      </div>
    );
  };

  // 제원 정보 및 이미지 데이터 추출
  const specs = carDetail?.specs || {};
  const colorImages = carDetail?.all_color_images || carDetail?.color_images || [];
  const exteriorImages = carDetail?.all_exterior_images || carDetail?.exterior_images || [];
  const interiorImages = carDetail?.all_interior_images || carDetail?.interior_images || [];
  
  // 디버깅: 데이터 확인
  if (carDetail) {
    console.log("🔍 [모달] carDetail:", carDetail);
    console.log("🔍 [모달] specs:", specs);
    console.log("🔍 [모달] colorImages:", colorImages.length);
    console.log("🔍 [모달] exteriorImages:", exteriorImages.length);
    console.log("🔍 [모달] interiorImages:", interiorImages.length);
  }

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "flex-start", zIndex: 1000, overflowY: "auto", padding: "20px 10px" }} onClick={onClose}>
      <div style={{ backgroundColor: "#fff", width: "90%", maxWidth: "600px", maxHeight: "90vh", borderRadius: "16px", padding: "30px 20px", position: "relative", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", margin: "20px auto", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#888", zIndex: 10 }}>✕</button>

        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "5px", color: "#333" }}>{carName}</h2>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>{brandName}</p>

          <div style={{ margin: "15px 0", height: "180px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {imageUrl ? (
              <img src={imageUrl} alt={carName} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#f5f5f5", borderRadius: "10px", display:"flex", alignItems:"center", justifyContent:"center", color: "#aaa"}}>이미지 준비중</div>
            )}
            <button onClick={handleToggleLike} style={{ position: "absolute", bottom: "10px", right: "10px", background: "rgba(255, 255, 255, 0.8)", border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", zIndex: 10 }}>
              <HeartIcon filled={isLiked} />
            </button>
          </div>

          {/* 제원 정보 섹션 */}
          <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #eee", textAlign: "left" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "16px", color: "#333" }}>제원 정보</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>구매 가격</p>
                <p style={{ fontSize: "16px", fontWeight: "bold", color: "#0070f3" }}>
                  {formatPrice(displayPrice)} {car.maxPrice ? `~ ${formatPrice(car.maxPrice)}` : ""}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>출시일</p>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>
                  {specs.release_date || "정보 없음"}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>배기량</p>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>
                  {formatDisplacement(specs.displacement_range)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>복합연비</p>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>
                  {formatFuelEfficiency(specs.fuel_efficiency_range)}
                </p>
              </div>
            </div>
          </div>

          {/* 색상 이미지 갤러리 */}
          {loading ? (
            <div style={{ marginTop: "20px", padding: "20px", textAlign: "center", color: "#999" }}>로딩 중...</div>
          ) : (
            <>
              {renderImageGallery(
                carDetail?.color_images || [],
                colorImages,
                colorImagesCount,
                setColorImagesCount,
                "차량별 색상"
              )}
              {renderImageGallery(
                carDetail?.exterior_images || [],
                exteriorImages,
                exteriorImagesCount,
                setExteriorImagesCount,
                "외관 색상"
              )}
              {renderImageGallery(
                carDetail?.interior_images || [],
                interiorImages,
                interiorImagesCount,
                setInteriorImagesCount,
                "내관 색상"
              )}
            </>
          )}

          <button style={{ marginTop: "20px", width: "100%", padding: "12px 0", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }} onClick={handleGoToQuoteResult}>
            상세 견적 확인하기
          </button>
        </div>
      </div>
    </div>
  );
}
