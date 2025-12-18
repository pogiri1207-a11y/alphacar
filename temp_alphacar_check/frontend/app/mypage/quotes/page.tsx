// app/mypage/quotes/page.js
"use client";

import { useEffect, useState } from "react";

// [수정됨] 하드코딩된 IP 제거 -> 프록시 경로 사용
// 실제로는 next.config.mjs 설정을 통해 3003번 포트(견적 서비스)로 연결됩니다.
const API_BASE = "/api";

export default function MyPageQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    // 1. 저장 성공 토스트 메시지 처리
    const savedFlag = localStorage.getItem("quote_saved");
    if (savedFlag === "1") {
      setToastMessage("견적함에 저장되었습니다.");
      localStorage.removeItem("quote_saved");
      setTimeout(() => setToastMessage(""), 2500);
    }

    // 2. 사용자 ID 확인
    const userSocialId = localStorage.getItem("user_social_id");
    if (!userSocialId) {
      setLoading(false);
      return;
    }

    // 3. 견적 목록 불러오기 (백엔드 API 호출)
    // 요청 주소: /api/estimate/list -> (프록시) -> 3003번/estimate/list
    fetch(`${API_BASE}/estimate/list?userId=${userSocialId}`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setQuotes(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error("견적 목록 로딩 실패:", err);
        setLoading(false);
      });
  }, []);

  // ✅ [수정됨] 견적 영구 삭제 함수
  const handleDeleteQuote = async (quoteId) => {
    const ok = window.confirm("정말 이 견적을 삭제하시겠습니까? (복구 불가)");
    if (!ok) return;

    try {
      // 1. 백엔드에 삭제 요청 보내기
      // 요청 주소: /api/estimate/{id}
      const res = await fetch(`${API_BASE}/estimate/${quoteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // 2. 성공 시 화면에서도 제거 (새로고침 안 해도 되도록)
        setQuotes((prev) => prev.filter((q) => q._id !== quoteId));
        // alert("삭제되었습니다."); // (선택사항)
      } else {
        alert("삭제 실패: 서버 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("삭제 요청 중 에러:", error);
      alert("삭제 중 문제가 발생했습니다.");
    }
  };

  // 숫자 포맷팅 함수
  const formatPrice = (num) => (num ? num.toLocaleString() + "원" : "0원");

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "40px auto 80px",
        padding: "0 20px",
      }}
    >
      {/* 토스트 메시지 */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#222",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: "999px",
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 9999,
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* 헤더 */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, marginBottom: "8px" }}>
          견적함
        </h1>
        <p style={{ fontSize: "14px", color: "#777" }}>
          저장한 차량 견적들을 확인하고 관리할 수 있습니다.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
          로딩 중입니다...
        </div>
      ) : quotes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            borderRadius: "24px",
            background: "#fafafa",
            border: "1px dashed #ddd",
          }}
        >
          <p style={{ fontSize: "16px", color: "#555", marginBottom: "8px" }}>
            아직 저장된 견적이 없습니다.
          </p>
          <p style={{ fontSize: "13px", color: "#999" }}>
            마음에 드는 차량을 찾아 견적을 저장해보세요.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {quotes.map((quote) => {
            // 날짜 포맷팅
            const dateStr = new Date(quote.createdAt).toLocaleDateString(
              "ko-KR",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            );

            // 개별 견적 vs 비교 견적 구분
            const isCompare = quote.type === "compare";
            const carList = quote.cars || [];

            return (
              <div
                key={quote._id}
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  border: "1px solid #eee",
                }}
              >
                {/* 상단 정보: 타입 & 날짜 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    color: "#888",
                    marginBottom: "16px",
                    borderBottom: "1px solid #f5f5f5",
                    paddingBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: isCompare ? "#0066ff" : "#333",
                    }}
                  >
                    {isCompare ? "비교 견적" : "개별 견적"}
                  </span>
                  <span>{dateStr} 저장됨</span>
                </div>

                {/* 차량 리스트 영역 */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isCompare ? "1fr 1fr" : "1fr",
                    gap: "24px",
                  }}
                >
                  {carList.map((car, cIdx) => (
                    <div
                      key={cIdx}
                      style={{
                        display: "flex",
                        gap: "16px",
                        alignItems: "center",
                        borderRight:
                          isCompare && cIdx === 0 ? "1px solid #f0f0f0" : "none",
                        paddingRight: isCompare && cIdx === 0 ? "24px" : "0",
                      }}
                    >
                      {/* 차량 이미지 */}
                      <div
                        style={{
                          width: "100px",
                          height: "70px",
                          borderRadius: "10px",
                          background: "#f9f9f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {car.image ? (
                          <img
                            src={car.image}
                            alt={car.model}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <span
                            style={{ fontSize: "11px", color: "#ccc" }}
                          >
                            No Image
                          </span>
                        )}
                      </div>

                      {/* 차량 정보 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginBottom: "2px",
                          }}
                        >
                          {car.manufacturer}
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            marginBottom: "2px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {car.model}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#555",
                            marginBottom: "4px",
                          }}
                        >
                          {car.trim}
                        </div>
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#1d4ed8",
                          }}
                        >
                          {formatPrice(car.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 하단 옵션 요약 */}
                <div style={{ marginTop: "20px" }}>
                  {carList.map((car, cIdx) => (
                    <div
                      key={cIdx}
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        background: "#f9fafb",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        marginTop: cIdx > 0 ? "8px" : "0",
                      }}
                    >
                      <span
                        style={{ fontWeight: 600, marginRight: "6px" }}
                      >
                        [{car.model}] 옵션:
                      </span>
                      {car.options && car.options.length > 0
                        ? car.options.join(", ")
                        : "선택 옵션 없음"}
                    </div>
                  ))}
                </div>

                {/* 총 견적가 + 삭제 버튼 */}
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "1px dashed #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* 삭제 버튼 */}
                  <button
                    type="button"
                    onClick={() => handleDeleteQuote(quote._id)}
                    style={{
                      fontSize: "12px",
                      borderRadius: "999px",
                      border: "1px solid #ddd",
                      backgroundColor: "#fff",
                      color: "#666",
                      padding: "4px 12px",
                      cursor: "pointer",
                    }}
                  >
                    삭제
                  </button>

                  {/* 총 견적가 */}
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#888",
                        marginRight: "8px",
                      }}
                    >
                      총 예상 견적가
                    </span>
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        color: "#e11d48",
                      }}
                    >
                      {formatPrice(quote.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
