"use client";

import { useEffect, useState, useCallback, CSSProperties } from "react";
import { useRouter } from "next/navigation";
// @ts-ignore
import { fetchMainData, fetchBrandsWithLogo } from "../lib/api";
import YouTubeSection from "./components/YouTubeSection";
import CarDetailModal from "./components/CarDetailModal";
import MidBanner from "./components/MidBanner";
import BrandTestDriveSection from "./components/BrandTestDriveSection";

// 백엔드 주소
const API_RANKING_URL = "/api/sales/rankings";

const bannerItems = [
  { id: 1, img: "/banners/banner1.png", link: "/cashback" },
  { id: 2, img: "/banners/banner2.png", link: "/benefit" },
  { id: 3, img: "/banners/banner3.png", link: "/quote" },
];

// 브랜드 목록은 API에서 가져옴

// 💖 하트 아이콘 컴포넌트
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="28"
    height="28"
    fill={filled ? "#ff4d4f" : "rgba(0,0,0,0.3)"}
    stroke={filled ? "#ff4d4f" : "#ffffff"}
    strokeWidth="2"
    style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))", transition: "all 0.2s" }}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export default function HomePage() {
  const router = useRouter();

  const [bannerIndex, setBannerIndex] = useState(0);
  const safeBannerIndex = bannerIndex;

  const [carList, setCarList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [domesticTop5, setDomesticTop5] = useState<any[]>([]);
  const [foreignTop5, setForeignTop5] = useState<any[]>([]);

  const [selectedBrand, setSelectedBrand] = useState("전체");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  const [brands, setBrands] = useState<any[]>([]); // 브랜드 목록 상태 추가

  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [likedVehicleIds, setLikedVehicleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let storedUserId = localStorage.getItem("user_social_id") || localStorage.getItem("alphacar_user_id");
    if (!storedUserId) {
      storedUserId = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("alphacar_user_id", storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  const fetchMyFavorites = useCallback(async (uid: string) => {
    if (!uid) return;
    try {
      console.log("💖 [fetchMyFavorites] 찜 목록 조회 시작:", uid);
      const res = await fetch(`/api/favorites/list?userId=${uid}`);
      if (res.ok) {
        const data = await res.json();
        console.log("💖 [fetchMyFavorites] 찜 목록 응답:", data);
        // vehicleId가 populate된 경우 lineup_id를 우선 사용, 없으면 _id 사용
        const ids = new Set<string>(data.map((item: any) => {
          if (!item.vehicleId) return null;
          // lineup_id가 있으면 lineup_id 사용 (문자열), 없으면 _id 사용 (ObjectId 문자열)
          const id = item.vehicleId.lineup_id || (item.vehicleId._id ? String(item.vehicleId._id) : null);
          console.log("💖 [fetchMyFavorites] 추출된 ID:", id, "from vehicleId:", item.vehicleId);
          return id;
        }).filter((id: any) => id) as string[]);
        console.log("💖 [fetchMyFavorites] 최종 찜 ID 목록:", Array.from(ids));
        setLikedVehicleIds(ids);
      } else {
        console.error("💖 [fetchMyFavorites] API 응답 실패:", res.status);
      }
    } catch (err) {
      console.error("💖 [fetchMyFavorites] 찜 목록 로딩 에러:", err);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMyFavorites(userId);
    }
  }, [userId, fetchMyFavorites]);

  useEffect(() => {
    const timer = setInterval(() => setBannerIndex((prev) => (prev + 1) % bannerItems.length), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchRankings() {
      try {
        const res = await fetch(API_RANKING_URL);
        if (!res.ok) throw new Error("Load Fail");
        const data = await res.json();
        const formatRanking = (list: any[]) => {
          if (!list || !Array.isArray(list)) return [];
          return list.slice(0, 5).map((item) => ({
            rank: item.rank,
            name: item.model_name,
            sales: item.sales_volume ? item.sales_volume.toLocaleString() : "-",
            share: item.market_share ? `${item.market_share}%` : "-",
            prev: item.previous_month && item.previous_month.sales ? item.previous_month.sales.toLocaleString() : "-",
            total: item.previous_year && item.previous_year.sales ? item.previous_year.sales.toLocaleString() : "-"
          }));
        };
        setDomesticTop5(formatRanking(data.domestic));
        setForeignTop5(formatRanking(data.foreign));
      } catch (err) { console.error(err); }
    }
    fetchRankings();
  }, []);

  // 브랜드 목록 가져오기 (로고 포함)
  useEffect(() => {
    fetchBrandsWithLogo()
      .then((brandList: any[]) => {
        // "전체" 옵션을 맨 앞에 추가
        const allBrand = { name: "전체", logo_url: "" };
        
        // 브랜드 정렬: "전체" -> "현대", "기아", "제네시스", "쉐보레" -> 나머지 한글 순서
        const priorityBrands = ["현대", "기아", "제네시스", "쉐보레"];
        const priorityList: any[] = [];
        const normalList: any[] = [];

        brandList.forEach((brand) => {
          if (priorityBrands.includes(brand.name)) {
            priorityList.push(brand);
          } else {
            normalList.push(brand);
          }
        });

        // 우선순위 브랜드는 지정된 순서대로 정렬
        priorityList.sort((a, b) => {
          const indexA = priorityBrands.indexOf(a.name);
          const indexB = priorityBrands.indexOf(b.name);
          return indexA - indexB;
        });

        // 일반 브랜드는 한글 순서로 정렬
        normalList.sort((a, b) => {
          return a.name.localeCompare(b.name, 'ko');
        });

        setBrands([allBrand, ...priorityList, ...normalList]);
      })
      .catch((err: any) => {
        console.error("브랜드 목록 로딩 실패:", err);
        // 실패 시 기본값 설정
        setBrands([{ name: "전체", logo_url: "" }]);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchMainData(selectedBrand === "전체" ? undefined : selectedBrand)
      .then((data: any) => {
        let cars: any[] = [];
        if (data.carList && Array.isArray(data.carList)) cars = data.carList;
        else if (data.cars && Array.isArray(data.cars)) cars = data.cars;
        else if (Array.isArray(data)) cars = data;
        setCarList(cars);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setErrorMsg("데이터 로딩 실패");
        setLoading(false);
      });
  }, [selectedBrand]);

  useEffect(() => { setCurrentPage(1); }, [selectedBrand]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    router.push(`/search?keyword=${encodeURIComponent(searchText.trim())}`);
  };

  const formatPrice = (minPrice: number, maxPrice: number) => {
    if (!minPrice && !maxPrice) return "가격 정보 없음";
    const min = minPrice ? (Number(minPrice) / 10000).toLocaleString() : "";
    const max = maxPrice ? (Number(maxPrice) / 10000).toLocaleString() : "";
    if (min === max) {
      return min + "만원";
    }
    return min + "만원 ~ " + max + "만원";
  };

  // 서버에서 이미 필터링된 데이터를 받으므로 클라이언트 필터링 제거
  const filteredCars = carList;

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCars = filteredCars.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleBannerClick = (item: any) => {
    const target = item || bannerItems[safeBannerIndex];
    if (target.link) router.push(target.link);
  };
  const goPrevBanner = () => setBannerIndex((prev) => (prev - 1 + bannerItems.length) % bannerItems.length);
  const goNextBanner = () => setBannerIndex((prev) => (prev + 1) % bannerItems.length);
  
  const getBannerPositionStyle = (idx: number): CSSProperties => {
    const len = bannerItems.length;
    let diff = idx - safeBannerIndex;
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;
    if (diff === 0) return bannerCarouselStyles.center;
    if (diff === -1 || diff === len - 1) return bannerCarouselStyles.left;
    if (diff === 1 || diff === -len + 1) return bannerCarouselStyles.right;
    return bannerCarouselStyles.hidden;
  };

  const handleCarClick = (car: any) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCar(null);
    if (userId) fetchMyFavorites(userId);
  };

  const handleHeartClick = async (e: React.MouseEvent, car: any) => {
    e.stopPropagation();
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }
    const vehicleId = car.vehicleId || car._id || car.id;
    if (!vehicleId) {
      console.error("차량 ID를 찾을 수 없습니다:", car);
      return;
    }
    // vehicleId를 문자열로 변환
    const vehicleIdStr = String(vehicleId);

    const nextLikedIds = new Set(likedVehicleIds);
    if (nextLikedIds.has(vehicleIdStr)) {
      nextLikedIds.delete(vehicleIdStr);
    } else {
      nextLikedIds.add(vehicleIdStr);
    }
    setLikedVehicleIds(nextLikedIds);

    try {
      console.log("💖 [하트 클릭] 요청 데이터:", { userId, vehicleId });
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, vehicleId: vehicleIdStr })
      });
      console.log("💖 [하트 클릭] 응답 상태:", res.status, res.statusText);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("💖 [하트 클릭] API 실패 상세:", errorText);
        throw new Error(`API Fail: ${res.status} ${res.statusText} - ${errorText}`);
      }
      const result = await res.json();
      console.log("💖 [하트 클릭] 성공:", result);
    } catch (err) {
      console.error("💖 [하트 클릭] 찜 토글 실패:", err);
      fetchMyFavorites(userId);
    }
  };

  return (
    <main style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <div className="page-wrapper">
        {errorMsg && <div style={{ border: "1px solid #ffccc7", padding: "10px", textAlign: "center", color: "#ff4d4f", margin: "10px" }}>⚠️ {errorMsg}</div>}

        <section style={bannerCarouselStyles.section}>
          {bannerItems.map((item, idx) => (
            <div key={item.id} style={{ ...bannerCarouselStyles.cardBase, ...getBannerPositionStyle(idx) }} onClick={() => handleBannerClick(item)}>
              <img src={item.img} alt={`banner-${item.id}`} style={bannerCarouselStyles.image} />
            </div>
          ))}
          <button onClick={goPrevBanner} style={{ ...bannerCarouselStyles.arrowBtn, left: "3%" }}>‹</button>
          <button onClick={goNextBanner} style={{ ...bannerCarouselStyles.arrowBtn, right: "3%" }}>›</button>
          <div style={bannerCarouselStyles.dots}>
            {bannerItems.map((item, idx) => <span key={item.id} onClick={() => setBannerIndex(idx)} style={{ ...bannerCarouselStyles.dot, opacity: idx === safeBannerIndex ? 1 : 0.3, width: idx === safeBannerIndex ? 18 : 8 }} />)}
          </div>
        </section>

        <section style={{ margin: "50px auto 40px", padding: "0 40px", textAlign: "center" }}>
          <h2 style={{ fontSize: "30px", fontWeight: "700", color: "#2563eb", marginBottom: "10px" }}>고객님, 어떤 차를 찾으시나요?</h2>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "22px" }}>차종이나 모델명으로 검색할 수 있어요</p>
          <form onSubmit={handleSearchSubmit} style={{ display: "inline-flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative", width: "720px", maxWidth: "90vw" }}>
              <input type="text" placeholder="어떤 차를 찾으세요?" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: "100%", height: "56px", padding: "0 22px", borderRadius: "999px", border: "1px solid #e5e7eb", fontSize: "17px", outline: "none" }} />
            </div>
            <button type="submit" style={{ width: "54px", height: "54px", borderRadius: "50%", border: "none", backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2.5" /><line x1="16.5" y1="16.5" x2="21" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round" /></svg>
            </button>
          </form>
        </section>

        <section style={{ margin: "30px auto 0", padding: "0 40px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "18px" }}>ALPHACAR 판매 순위 TOP 10</h3>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "24px 28px 28px", boxShadow: "0 6px 20px rgba(0,0,0,0.06)", display: "flex", gap: "32px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "320px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "10px" }}>국내 자동차 판매 순위 TOP 5</h4>
              {domesticTop5.map((car) => <div key={car.rank} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f5f5f5", fontSize: "13px" }}><span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#0070f3", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "10px", fontWeight: "700" }}>{car.rank}</span><span style={{ flex: 1, fontWeight: 500 }}>{car.name}</span><span style={{ width: "60px", textAlign: "right" }}>{car.share}</span></div>)}
            </div>
            <div style={{ flex: 1, minWidth: "320px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "10px" }}>외제 자동차 판매 순위 TOP 5</h4>
              {foreignTop5.map((car) => <div key={car.rank} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f5f5f5", fontSize: "13px" }}><span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#ff4d4f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "10px", fontWeight: "700" }}>{car.rank}</span><span style={{ flex: 1, fontWeight: 500 }}>{car.name}</span><span style={{ width: "60px", textAlign: "right" }}>{car.share}</span></div>)}
            </div>
          </div>
        </section>

        <MidBanner />

        <section className="brand-section" style={{ marginTop: "40px", padding: "0 40px 60px" }}>
          <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#111111", marginBottom: "18px" }}>브랜드로 차량을 찾아보세요</h2>
          <div style={{ backgroundColor: "#f5f5f7", borderRadius: "14px", padding: "14px 18px", marginBottom: "24px" }}>
            <div className="brand-tabs">
              {brands.map((brand) => {
                const brandName = typeof brand === 'string' ? brand : brand.name;
                const logoUrl = typeof brand === 'object' ? brand.logo_url : '';
                const isSelected = brandName === selectedBrand;

                return (
                  <button
                    key={brandName}
                    className={isSelected ? "brand-btn brand-btn-active" : "brand-btn"}
                    onClick={() => setSelectedBrand(brandName)}
                  >
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt={brandName}
                        onError={(e) => {
                          // 이미지 로드 실패 시 숨김
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span>{brandName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="car-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "18px 20px" }}>
            {loading && <p style={{ gridColumn: "1/-1", textAlign: "center" }}>로딩 중...</p>}
            {!loading && filteredCars.length === 0 && <p style={{ gridColumn: "1/-1", textAlign: "center" }}>차량이 없습니다.</p>}

            {paginatedCars.map((car, idx) => {
              const vehicleId = car.vehicleId || car._id || car.id;
              // vehicleId를 문자열로 변환하여 비교 (lineup_id는 이미 문자열)
              const vehicleIdStr = String(vehicleId);
              const isLiked = likedVehicleIds.has(vehicleIdStr);

              return (
                <div
                  key={vehicleId || idx}
                  onClick={() => handleCarClick(car)}
                  style={{
                    borderRadius: "14px", border: "1px solid #e5e7eb", padding: "18px 12px 16px",
                    backgroundColor: "#fff", cursor: "pointer", boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                    display: "flex", flexDirection: "column", gap: "10px", transition: "all 0.12s",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 20px rgba(15,23,42,0.10)"; e.currentTarget.style.borderColor = "#2563eb"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.04)"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
                >
                  <div style={{ width: "100%", height: "120px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    {car.imageUrl ? <img src={car.imageUrl} alt={car.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} /> : <span style={{ color: "#ccc", fontSize: "13px" }}>이미지 없음</span>}

                    {/* 💖 메인 화면 하트 버튼 (위치: 이미지 우측 하단 여백) */}
                    <button
                      onClick={(e) => handleHeartClick(e, car)}
                      style={{
                        position: "absolute",
                        bottom: "-15px", // 🔹 수정: 빨간 네모 위치에 맞게 더 아래로 이동
                        right: "5px",
                        zIndex: 10,
                        background: "none", border: "none", cursor: "pointer", padding: "5px"
                      }}
                    >
                      <HeartIcon filled={isLiked} />
                    </button>
                  </div>

                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>[{car.manufacturer || "미분류"}] {car.name}</p>
                    <p style={{ fontSize: "13px", color: "#2563eb", marginBottom: "6px" }}>{formatPrice(car.minPrice, car.maxPrice)}</p>
                    <button className="car-detail-btn" style={{ marginTop: "2px", padding: "6px 12px", borderRadius: "999px", border: "none", backgroundColor: "#2563eb", color: "#ffffff", fontSize: "12px", cursor: "pointer" }}>상세보기</button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCars.length > 0 && (() => {
            const MAX_VISIBLE_PAGES = 10;
            let startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
            let endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

            // 끝 페이지가 totalPages에 가까우면 시작 페이지를 조정
            if (endPage - startPage < MAX_VISIBLE_PAGES - 1) {
              startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
            }

            const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

            return (
              <div className="pagination" style={{ marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {/* 이전 페이지 화살표 */}
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "1px solid #e5e7eb",
                    backgroundColor: currentPage === 1 ? "#f5f5f5" : "#ffffff",
                    color: currentPage === 1 ? "#ccc" : "#333",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.backgroundColor = "#f0f0f0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                    }
                  }}
                >
                  ‹
                </button>

                {/* 페이지 번호 버튼들 */}
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage ? "page-btn page-btn-active" : "page-btn"}
                    style={{
                      minWidth: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: page === currentPage ? "none" : "1px solid #e5e7eb",
                      backgroundColor: page === currentPage ? "#2563eb" : "#ffffff",
                      color: page === currentPage ? "#ffffff" : "#333",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: page === currentPage ? 700 : 500,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (page !== currentPage) {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (page !== currentPage) {
                        e.currentTarget.style.backgroundColor = "#ffffff";
                      }
                    }}
                  >
                    {page}
                  </button>
                ))}

                {/* 다음 페이지 화살표 */}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "1px solid #e5e7eb",
                    backgroundColor: currentPage === totalPages ? "#f5f5f5" : "#ffffff",
                    color: currentPage === totalPages ? "#ccc" : "#333",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.backgroundColor = "#f0f0f0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                    }
                  }}
                >
                  ›
                </button>
              </div>
            );
          })()}
        </section>

        <BrandTestDriveSection />
        <YouTubeSection />
      </div>

      {isModalOpen && selectedCar && <CarDetailModal car={selectedCar} onClose={handleCloseModal} />}
    </main>
  );
}

// ✅ [핵심] TypeScript에게 이 객체는 단순 문자열이 아니라 CSS 스타일 속성이라고 명시
const bannerCarouselStyles: { [key: string]: CSSProperties } = {
  section: { position: "relative", width: "100%", height: "320px", marginTop: "30px", marginBottom: "20px" },
  cardBase: { position: "absolute", top: "50%", transform: "translateY(-50%)", width: "90%", maxWidth: "1450px", height: "100%", borderRadius: "24px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0, 0, 0, 0.18)", backgroundColor: "#000", cursor: "pointer", transition: "all 0.5s ease" },
  center: { left: "50%", transform: "translate(-50%, -50%) scale(1)", zIndex: 3, opacity: 1, filter: "none" },
  left: { left: "16%", transform: "translate(-50%, -50%) scale(0.85)", zIndex: 2, opacity: 0.7, filter: "blur(1px) brightness(0.45)" },
  right: { left: "84%", transform: "translate(-50%, -50%) scale(0.85)", zIndex: 2, opacity: 0.7, filter: "blur(1px) brightness(0.45)" },
  hidden: { left: "50%", transform: "translate(-50%, -50%) scale(0.8)", zIndex: 1, opacity: 0, pointerEvents: "none", filter: "blur(2px) brightness(0.3)" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  arrowBtn: { position: "absolute", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", borderRadius: "50%", border: "none", backgroundColor: "#ffffff", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", cursor: "pointer", fontSize: "20px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4 },
  dots: { position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 5 },
  dot: { height: "8px", borderRadius: "999px", backgroundColor: "#555", cursor: "pointer", transition: "all 0.3s" },
};
