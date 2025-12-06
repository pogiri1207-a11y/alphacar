// app/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMainData } from "../lib/api";
import YouTubeSection from "./components/YouTubeSection";
import CarDetailModal from "./components/CarDetailModal";

// 백엔드 주소 (Next.js rewrites 설정에 따름)
const API_BASE_URL = "/api";

const bannerItems = [
  { id: 1, img: "/banners/banner1.png", link: "/cashback" },
  { id: 2, img: "/banners/banner2.png", link: "/benefit" },
  { id: 3, img: "/banners/banner3.png", link: "/quote" },
];

const domesticTop5 = [
  { rank: 1, name: "쏘렌토", sales: "10,047", share: "8.6%", prev: "6,788", total: "10,434" },
  { rank: 2, name: "스포티지", sales: "6,868", share: "5.9%", prev: "4,055", total: "4,100" },
  { rank: 3, name: "그랜저", sales: "6,499", share: "5.6%", prev: "5,074", total: "5,047" },
  { rank: 4, name: "쏘나타 더 엣지", sales: "5,897", share: "5.1%", prev: "4,603", total: "6,658" },
  { rank: 5, name: "투싼", sales: "5,384", share: "4.6%", prev: "3,909", total: "5,583" },
];

const foreignTop5 = [
  { rank: 1, name: "Model Y", sales: "3,712", share: "15.4%", prev: "8,361", total: "3,712" },
  { rank: 2, name: "E-Class", sales: "2,489", share: "10.3%", prev: "3,273", total: "2,543" },
  { rank: 3, name: "5 Series", sales: "1,783", share: "7.4%", prev: "2,196", total: "2,073" },
  { rank: 4, name: "GLE-Class", sales: "758", share: "3.2%", prev: "692", total: "343" },
  { rank: 5, name: "GLC-Class", sales: "752", share: "3.1%", prev: "900", total: "771" },
];

const brands = [
  "전체", "현대", "기아", "제네시스", "르노코리아", "KGM", "쉐보레", "벤츠", "BMW", "아우디",
  "폭스바겐", "볼보", "렉서스", "토요타", "테슬라", "랜드로버", "포르쉐", "미니", "포드",
  "링컨", "지프", "푸조", "캐딜락", "폴스타", "마세라티", "혼다", "BYD",
];

export default function HomePage() {
  const router = useRouter();

  const [bannerIndex, setBannerIndex] = useState(0);
  const safeBannerIndex = typeof window === "undefined" ? 0 : bannerIndex;

  const [carList, setCarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [selectedBrand, setSelectedBrand] = useState("전체");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // 모달 및 유저 상태
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  // 1. 초기 실행: 유저 ID 생성
  useEffect(() => {
    let storedUserId = localStorage.getItem("alphacar_user_id");
    if (!storedUserId) {
      storedUserId = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("alphacar_user_id", storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setBannerIndex((prev) => (prev + 1) % bannerItems.length),
      4000
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchMainData()
      .then((data) => {
        let cars = [];
        if (data.carList && Array.isArray(data.carList)) cars = data.carList;
        else if (data.cars && Array.isArray(data.cars)) cars = data.cars;
        else if (Array.isArray(data)) cars = data;
        setCarList(cars);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch:", err);
        setErrorMsg(`데이터 로딩 실패`);
        setCarList([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrand]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const keyword = searchText.trim();
    if (!keyword) return;
    router.push(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  const formatPrice = (price) => {
    if (!price) return "가격 정보 없음";
    return (Number(price) / 10000).toLocaleString() + "만원";
  };

  const filteredCars = carList.filter((car) => {
    if (!car) return false;
    const carBrand = car.manufacturer || car.brand || "기타";
    return selectedBrand === "전체" ? true : carBrand === selectedBrand;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCars = filteredCars.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleBannerClick = () => {
    const current = bannerItems[bannerIndex];
    if (current.link) router.push(current.link);
  };

  // ★ 차량 클릭 핸들러: 팝업 열기 + Redis 저장 + 이벤트 발송
  const handleCarClick = async (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);

    if (!userId) return;

    try {
      const carId = car.id || car._id;

      if (carId) {
        const targetUrl = `${API_BASE_URL}/${carId}/view`;

        await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        console.log(`✅ [기록 완료] ${car.name}`);

        window.dispatchEvent(new Event("vehicleViewed"));
      }
    } catch (error) {
      console.error("❌ 조회 기록 전송 실패:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCar(null);
  };

  return (
    <main style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <div className="page-wrapper">
        {/* 우측 하단 플로팅 버튼 제거됨 (RightSideBar에서 처리) */}

        {errorMsg && (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #ffccc7",
              padding: "10px",
              textAlign: "center",
              color: "#ff4d4f",
              margin: "10px",
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {/* 배너 영역 */}
        <section className="banner-section">
          <div
            className="banner-slide"
            style={{ backgroundImage: `url(${bannerItems[safeBannerIndex].img})` }}
            onClick={handleBannerClick}
          />
          <div className="banner-dots">
            {bannerItems.map((item, idx) => (
              <button
                key={item.id}
                className={idx === safeBannerIndex ? "dot active" : "dot"}
                onClick={() => setBannerIndex(idx)}
              />
            ))}
          </div>
        </section>

        {/* 검색 박스 */}
        <section style={{ margin: "30px auto", padding: "0 40px" }}>
          <form
            onSubmit={handleSearchSubmit}
            style={{
              width: "100%",
              backgroundColor: "white",
              borderRadius: "999px",
              border: "2px solid #0070f3",
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              boxSizing: "border-box",
            }}
          >
            <span style={{ marginRight: "10px", fontSize: "18px" }}>🔍</span>
            <input
              type="text"
              placeholder="찾는 차량을 검색해 주세요 (예: 그랜저)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ border: "none", outline: "none", flex: 1, fontSize: "16px" }}
            />
            <button
              type="submit"
              style={{
                border: "none",
                background: "#0070f3",
                color: "white",
                borderRadius: "20px",
                padding: "8px 16px",
                fontWeight: "bold",
                cursor: "pointer",
                marginLeft: "10px",
              }}
            >
              검색
            </button>
          </form>
        </section>

        {/* TOP10 박스 */}
        <section style={{ margin: "30px auto 0", padding: "0 40px" }}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "700",
              marginBottom: "18px",
            }}
          >
            ALPHACAR 판매 순위 TOP 10
          </h3>
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "24px 28px 28px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
              display: "flex",
              gap: "32px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: "320px" }}>
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  marginBottom: "10px",
                }}
              >
                {" "}
                국내 자동차 판매 순위 TOP 5
              </h4>
              {domesticTop5.map((car) => (
                <div
                  key={car.rank}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #f5f5f5",
                    fontSize: "13px",
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "#0070f3",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "10px",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {car.rank}
                  </span>
                  <span style={{ flex: 1, fontWeight: 500 }}>{car.name}</span>
                  <span style={{ width: "60px", textAlign: "right" }}>{car.share}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: "320px" }}>
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  marginBottom: "10px",
                }}
              >
                {" "}
                외제 자동차 판매 순위 TOP 5
              </h4>
              {foreignTop5.map((car) => (
                <div
                  key={car.rank}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #f5f5f5",
                    fontSize: "13px",
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "#ff4d4f",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "10px",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {car.rank}
                  </span>
                  <span style={{ flex: 1, fontWeight: 500 }}>{car.name}</span>
                  <span style={{ width: "60px", textAlign: "right" }}>{car.share}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 브랜드 / 차량 리스트 */}
        <section className="brand-section">
          <div className="brand-tabs">
            {brands.map((brand) => (
              <button
                key={brand}
                className={
                  brand === selectedBrand ? "brand-btn brand-btn-active" : "brand-btn"
                }
                onClick={() => setSelectedBrand(brand)}
              >
                {brand}
              </button>
            ))}
          </div>

          <div className="car-list">
            {loading && !errorMsg && (
              <p style={{ textAlign: "center", width: "100%" }}>데이터 로딩 중...</p>
            )}
            {!loading && filteredCars.length === 0 && (
              <p className="empty-text">
                {errorMsg ? "데이터를 불러올 수 없습니다." : "해당 브랜드의 차량이 없습니다."}
              </p>
            )}

            {paginatedCars.map((car, idx) => (
              <div
                key={car._id || car.name || idx}
                className="car-card"
                onClick={() => handleCarClick(car)}
                style={{ cursor: "pointer" }}
              >
                <div
                  className="car-image-placeholder"
                  style={{ overflow: "hidden", background: "#fff" }}
                >
                  {car.imageUrl ? (
                    <img
                      src={car.imageUrl}
                      alt={car.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <span style={{ color: "#ccc" }}>이미지 없음</span>
                  )}
                </div>
                <div className="car-info">
                  <p className="car-name">
                    [{car.manufacturer || "미분류"}] {car.name || "이름 없음"}
                  </p>
                  <p className="car-price">{formatPrice(car.minPrice)} ~</p>
                  <button className="car-detail-btn">상세보기</button>
                </div>
              </div>
            ))}
          </div>

          {filteredCars.length > 0 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={
                    idx + 1 === currentPage ? "page-btn page-btn-active" : "page-btn"
                  }
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ✅ 유튜브 섹션: 홈페이지 맨 아래에 배치 */}
        <YouTubeSection />
      </div>

      {isModalOpen && selectedCar && (
        <CarDetailModal car={selectedCar} onClose={handleCloseModal} />
      )}
    </main>
  );
}

