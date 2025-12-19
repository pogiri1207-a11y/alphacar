"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword");

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) => {
    if (!price) return "가격 미정";
    return (Number(price) / 10000).toLocaleString() + "만원";
  };

  useEffect(() => {
    if (!keyword) {
      setLoading(false);
      return;
    }
    setLoading(true);

    // [수정] 백엔드 포트 및 엔드포인트 수정 (3007 포트, /search 경로)
    // 환경변수가 있으면 사용하고, 없으면 하드코딩된 주소 사용
    const baseUrl = "/api";

    fetch(
      `${baseUrl}/search?keyword=${encodeURIComponent(keyword)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("검색 요청 실패");
        return res.json();
      })
      .then((data) => {
        console.log("DB 데이터 확인:", data);

        // [핵심 수정] 백엔드의 간소화된 데이터를 UI가 기대하는 기존 DB 구조로 변환 (Adapter)
        // 백엔드 응답: { id, name, image, priceRange, releaseDate, displacement, fuelEfficiency }
        // UI 기대값: { _id, vehicle_name, manufacturer, photos..., specifications... }
        if (data.result && Array.isArray(data.result.cars)) {
          const adaptedCars = data.result.cars.map((item) => {
            // 가격 범위 파싱 (예: "1,441만원 ~ 2,003만원" 또는 "2,560만원")
            let minPrice = 0;
            let maxPrice = 0;
            if (item.priceRange && item.priceRange !== '가격 정보 없음') {
              const priceParts = item.priceRange.split(' ~ ');
              const minStr = priceParts[0].replace(/[^0-9]/g, "");
              minPrice = minStr ? parseInt(minStr, 10) * 10000 : 0;
              if (priceParts.length > 1) {
                const maxStr = priceParts[1].replace(/[^0-9]/g, "");
                maxPrice = maxStr ? parseInt(maxStr, 10) * 10000 : 0;
              } else {
                maxPrice = minPrice;
              }
            }

            // 제조사 추출 (예: "[현대] 쏘나타" -> "현대")
            const manufacturerMatch = item.name.match(/\[([^\]]+)\]/);
            const manufacturer = manufacturerMatch ? manufacturerMatch[1] : "검색결과";

            return {
              _id: item.id,
              vehicle_name: item.name, // 예: "[현대] 그랜저"
              trim_name: item.trimName || null, // 트림 이름 추가
              manufacturer: manufacturer,
              brandName: item.brandName || manufacturer,
              logoUrl: item.logoUrl || '',
              model_year: "-", // 연식 정보 없음 (표시하지 않음)
              fuel_type: "정보없음", // 연료 정보 없음
              photos: {
                representative_image: {
                  url: item.image, // 이미지 연결
                },
              },
              summary: {
                category: "검색",
                price_range: {
                  min: minPrice,
                  max: maxPrice,
                },
              },
              // 상세 제원 정보 (출시일, 배기량, 복합연비 포함)
              release_date: item.releaseDate || null,
              displacement: item.displacement || null,
              fuel_efficiency: item.fuelEfficiency || null,
              specifications: {
                fuel_efficiency: { combined: item.fuelEfficiency || "-" },
                engine: { 
                  type: "-", 
                  displacement: item.displacement || "-", 
                  max_power: "-" 
                },
              },
            };
          });
          setCars(adaptedCars);
        } else {
          setCars([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("에러:", err);
        setCars([]);
        setLoading(false);
      });
  }, [keyword]);

  return (
    <div className="page-wrapper">
      {/* 🔵 기존 검색 결과 영역 (DB 연동 그대로 유지) */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 20px",
          minHeight: "80vh",
        }}
      >
        {/* 상단 타이틀 */}
        <div
          style={{
            marginBottom: "40px",
            borderBottom: "2px solid #222",
            paddingBottom: "20px",
          }}
        >
          <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
            '
            <span style={{ color: "#0070f3" }}>
              {keyword || "검색어 없음"}
            </span>
            ' 검색 결과
          </h1>
          <p style={{ marginTop: "10px", color: "#666" }}>
            DB에서 총{" "}
            <span style={{ fontWeight: "bold", color: "#333" }}>
              {cars.length}
            </span>
            대의 차량을 찾았습니다.
          </p>
        </div>

        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "100px 0",
              fontSize: "18px",
            }}
          >
            데이터를 불러오는 중입니다...
          </div>
        )}

        {!loading && cars.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "100px 0",
              color: "#888",
            }}
          >
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>
              검색 결과가 없습니다.
            </p>
            <p style={{ marginTop: "10px" }}>
              정확한 차량 이름으로 다시 검색해보세요.
            </p>
          </div>
        )}

        {/* 차량 리스트 (상세 제원 포함) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "30px",
          }}
        >
          {cars.map((car) => (
            <div
              key={car._id}
              style={{
                display: "flex",
                flexDirection: "row",
                border: "1px solid #e0e0e0",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                backgroundColor: "#fff",
                minHeight: "220px",
              }}
            >
              {/* 1. 차량 이미지 영역 (왼쪽) */}
              <div
                style={{
                  width: "35%",
                  background: "#f8f9fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px",
                }}
              >
                {car.photos?.representative_image?.url ? (
                  <img
                    src={car.photos.representative_image.url}
                    alt={car.vehicle_name}
                    style={{
                      width: "100%",
                      maxHeight: "180px",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <div style={{ color: "#aaa" }}>이미지 없음</div>
                )}
              </div>

              {/* 2. 상세 정보 영역 (오른쪽) */}
              <div
                style={{
                  width: "65%",
                  padding: "25px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {/* 브랜드 로고 배지 */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "10px",
                      alignItems: "center",
                    }}
                  >
                    {car.logoUrl ? (
                      <img
                        src={car.logoUrl}
                        alt={car.brandName || car.manufacturer}
                        style={{
                          height: "24px",
                          maxWidth: "80px",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#fff",
                          background: "#333",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {car.brandName || car.manufacturer}
                      </span>
                    )}
                  </div>

                  {/* 차량 이름 & 가격 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        margin: "0",
                        color: "#222",
                      }}
                    >
                      {car.vehicle_name}
                      {car.trim_name && (
                        <span
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#0070f3",
                            marginLeft: "8px",
                          }}
                        >
                          {car.trim_name}
                        </span>
                      )}
                    </h2>
                    <p
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "#0070f3",
                        margin: "0",
                      }}
                    >
                      {car.summary?.price_range?.min 
                        ? (car.summary.price_range.max && car.summary.price_range.max > car.summary.price_range.min
                          ? `${formatPrice(car.summary.price_range.min)} ~ ${formatPrice(car.summary.price_range.max)}`
                          : formatPrice(car.summary.price_range.min))
                        : "가격 정보 없음"}
                    </p>
                  </div>

                  {/* 제원 정보 그리드 (구매 가격, 출시일, 배기량, 복합연비) */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      marginTop: "20px",
                      backgroundColor: "#f9f9f9",
                      padding: "15px",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px", margin: "0 0 4px 0" }}>
                        구매 가격
                      </p>
                      <p style={{ fontSize: "16px", fontWeight: "bold", color: "#0070f3", margin: "0" }}>
                        {car.summary?.price_range?.min 
                          ? (car.summary.price_range.max && car.summary.price_range.max > car.summary.price_range.min
                            ? `${formatPrice(car.summary.price_range.min)} ~ ${formatPrice(car.summary.price_range.max)}`
                            : formatPrice(car.summary.price_range.min))
                          : "정보 없음"}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px", margin: "0 0 4px 0" }}>
                        출시일
                      </p>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#333", margin: "0" }}>
                        {car.release_date || "정보 없음"}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px", margin: "0 0 4px 0" }}>
                        배기량
                      </p>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#333", margin: "0" }}>
                        {car.displacement || "정보 없음"}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px", margin: "0 0 4px 0" }}>
                        복합연비
                      </p>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#333", margin: "0" }}>
                        {car.fuel_efficiency || "정보 없음"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 하단 버튼 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "15px",
                  }}
                >
                  <Link
                    href={`/quote/personal?trimId=${encodeURIComponent(car.trim_name || "")}&modelName=${encodeURIComponent((car.vehicle_name?.replace(/\[[^\]]+\]\s*/, "") || "").split(" ")[0] || "")}`}
                    style={{
                      padding: "10px 24px",
                      backgroundColor: "#222",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    상세 견적 보기
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 메인으로 돌아가기 */}
        <div style={{ marginTop: "50px", textAlign: "center" }}>
          <Link
            href="/"
            style={{
              padding: "12px 30px",
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "30px",
              textDecoration: "none",
              color: "#333",
            }}
          >
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
