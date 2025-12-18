// app/favorite/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CarDetailModal from "../components/CarDetailModal"; // 모달 컴포넌트 불러오기

export default function FavoritePage() {
  const router = useRouter();
  
  // 상태 관리
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null); // 모달용 선택된 차량
  const [userId, setUserId] = useState(null);

  // 데이터 로딩
  useEffect(() => {
    // 1. 로그인 체크
    const storedUserId = localStorage.getItem("user_social_id") || localStorage.getItem("alphacar_user_id");
    
    if (!storedUserId) {
      alert("로그인이 필요한 서비스입니다.");
      router.push("/"); // 메인으로 리다이렉트
      return;
    }
    setUserId(storedUserId);

    // 2. 찜 목록 API 호출
    fetch(`/api/favorites/list?userId=${storedUserId}`)
      .then((res) => res.json())
      .then((data) => {
        setFavorites(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("찜 목록 로딩 실패:", err);
        setLoading(false);
      });
  }, [router]);

  // 가격 포맷팅 함수
  const formatPrice = (price) => {
    // 0원 이거나 null, undefined면 처리
    if (!price) return "가격 정보 없음";
    
    const num = Number(price);
    if (isNaN(num) || num === 0) return "가격 정보 없음";
    
    // 10000으로 나눠서 '만원' 단위 표시
    return (num / 10000).toLocaleString() + "만원 ~";
  };

  // 차량 클릭 핸들러 (모달 열기)
  const handleCarClick = (favItem) => {
    if (favItem.vehicleId) {
      setSelectedCar(favItem.vehicleId);
    }
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setSelectedCar(null);
    window.location.reload(); 
  };

  const hasFavorites = favorites.length > 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        padding: "40px 0 80px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        {/* 상단 타이틀 영역 */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "26px", fontWeight: 700, marginBottom: 8 }}>
            내가 찜한 차량
          </h1>
          <p style={{ fontSize: "14px", color: "#666" }}>
            관심 있는 차량을 한 곳에서 모아볼 수 있어요.
          </p>
        </div>

        {/* 로딩 중일 때 */}
        {loading && (
           <div style={{ textAlign: "center", padding: "100px 0", color: "#888" }}>
             데이터를 불러오는 중입니다...
           </div>
        )}

        {/* 로딩 끝난 후 내용 영역 */}
        {!loading && !hasFavorites ? (
          // 👉 찜한 차량이 없을 때
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "60px 20px",
              textAlign: "center",
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div
              style={{
                width: 64, height: 64, borderRadius: "50%", margin: "0 auto 16px",
                border: "1px solid #e5e7eb", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "28px",
              }}
            >
              ❤️
            </div>
            <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: 8 }}>
              아직 찜한 차량이 없어요.
            </p>
            <p style={{ fontSize: "14px", color: "#777", marginBottom: 24 }}>
              마음에 드는 차량 우측 하단의 하트 버튼을 눌러 찜 목록에 추가해 보세요.
            </p>
            <button 
                onClick={() => router.push("/")}
                style={{ 
                  padding: "12px 24px", backgroundColor: "#0066ff", color: "#fff", 
                  border: "none", borderRadius: "999px", cursor: "pointer", 
                  fontWeight: 600, fontSize: "14px"
                }}
            >
              차량 구경하러 가기
            </button>
          </div>
        ) : !loading && hasFavorites ? (
          // 👉 찜한 차량이 있을 때
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "24px 24px 32px",
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: "14px", color: "#555" }}>
                총 {favorites.length}대
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "20px",
              }}
            >
              {favorites.map((fav) => {
                const car = fav.vehicleId; 
                if (!car) return null;

                // 🔹 [수정됨] 가격 데이터 우선순위 로직 추가
                // 1. car.price (최상위 가격)
                // 2. car.minPrice (최소 가격 필드)
                // 3. car.trims 배열의 첫 번째 가격 (트림이 있다면)
                const displayPrice = car.price || car.minPrice || (car.trims && car.trims.length > 0 ? car.trims[0].price : 0);

                return (
                  <div
                    key={fav._id}
                    style={{
                      borderRadius: "16px", border: "1px solid #e5e7eb", padding: "16px 16px 18px",
                      backgroundColor: "#ffffff", display: "flex", flexDirection: "column",
                      justifyContent: "space-between", cursor: "pointer",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onClick={() => handleCarClick(fav)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div>
                      <div
                        style={{
                          width: "100%", height: "150px", borderRadius: "12px", overflow: "hidden",
                          marginBottom: 12, backgroundColor: "#f3f4f6", display: "flex",
                          alignItems: "center", justifyContent: "center",
                        }}
                      >
                        {car.imageUrl || car.main_image ? (
                          <img
                            src={car.imageUrl || car.main_image}
                            alt={car.name || car.vehicle_name}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        ) : (
                          <span style={{ fontSize: "12px", color: "#aaa" }}>이미지 없음</span>
                        )}
                      </div>

                      <div style={{ fontSize: "12px", color: "#888", marginBottom: 4 }}>
                        [{car.manufacturer || car.brand_name || "미분류"}]
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>
                        {car.name || car.vehicle_name}
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#0066ff" }}>
                        {/* 🔹 여기서 찾아낸 가격을 포맷팅 */}
                        {formatPrice(displayPrice)}
                      </div>
                    </div>

                    <button
                      type="button"
                      style={{
                        marginTop: 12, width: "100%", padding: "10px 0", borderRadius: "999px",
                        border: "none", backgroundColor: "#0066ff", color: "#ffffff",
                        fontSize: "14px", fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      상세보기
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {selectedCar && (
          <CarDetailModal car={selectedCar} onClose={handleCloseModal} />
        )}
      </div>
    </main>
  );
}
