// app/RightSideBar.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function RightSideBar() {
  const [hoverTarget, setHoverTarget] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConsultHover, setIsConsultHover] = useState(false);
  const [recentCount, setRecentCount] = useState(0);
  const [isNarrow, setIsNarrow] = useState(false);

  const router = useRouter();
  const BACKEND_URL = "/api";

  // [기능] Redis에서 최근 본 차량 개수 가져오기
  const fetchCount = async () => {
    try {
      const storedUserId =
        localStorage.getItem("user_social_id") ||
        localStorage.getItem("alphacar_user_id");
      if (!storedUserId) return;

      const res = await axios.get(`${BACKEND_URL}/history/count`, {
        params: { userId: storedUserId },
      });

      if (res.data && typeof res.data.count === "number") {
        setRecentCount(res.data.count);
      }
    } catch (e) {
      console.error("❌ 카운트 조회 실패:", e.message);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsNarrow(window.innerWidth < 1100);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    fetchCount();

    const handleUpdate = () => {
      console.log("🔄 배지 업데이트 신호 감지!");
      setTimeout(() => fetchCount(), 100);
    };

    window.addEventListener("vehicleViewed", handleUpdate);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("vehicleViewed", handleUpdate);
    };
  }, []);

  const renderTooltip = (label) => (
    <div
      style={{
        position: "absolute",
        right: "110%",
        top: "50%",
        transform: "translateY(-50%)",
        backgroundColor: "#333",
        color: "#fff",
        fontSize: "11px",
        padding: "6px 10px",
        borderRadius: "999px",
        whiteSpace: "nowrap",
        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
      }}
    >
      {label}
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        right: isNarrow ? "16px" : "24px",
        
        // AI 챗봇 버튼 높이에 맞춰 동일한 Y 위치로 조정
        bottom: "32px",
        
        width: "64px",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {/* 메뉴 버튼 그룹 */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "999px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          padding: "14px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          width: "50px",
        }}
      >
        {/* TOP */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            onMouseEnter={() => setHoverTarget("top")}
            onMouseLeave={() => setHoverTarget(null)}
            style={iconButtonStyle}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                lineHeight: 1.1,
              }}
            >
              <span style={{ fontSize: "14px" }}>↑</span>
              <span style={{ fontSize: "10px", marginTop: "1px" }}>
                TOP
              </span>
            </div>
          </button>
          {hoverTarget === "top" && renderTooltip("맨 위로")}
        </div>

        <div style={dividerStyle} />

        {/* 최근 본 차량 */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => router.push("/recent-views")}
            onMouseEnter={() => setHoverTarget("recent")}
            onMouseLeave={() => setHoverTarget(null)}
            style={iconButtonStyle}
          >
            <span style={{ fontSize: "16px" }}>🕒</span>
          </button>

          {recentCount > 0 && (
            <div
              style={{
                position: "absolute",
                top: "0px",
                right: "0px",
                backgroundColor: "#ff0000",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: "bold",
                minWidth: "16px",
                height: "16px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                padding: "2px",
                pointerEvents: "none",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              {recentCount > 9 ? "9+" : recentCount}
            </div>
          )}

          {hoverTarget === "recent" && renderTooltip("최근 본 차량")}
        </div>

        <div style={dividerStyle} />

        {/* 찜한 차량 */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => router.push("/favorite")}
            onMouseEnter={() => setHoverTarget("favorite")}
            onMouseLeave={() => setHoverTarget(null)}
            style={{
              ...iconButtonStyle,
              color: "#111111", // 하트 진하게 유지
            }}
          >
            <span style={{ fontSize: "16px" }}>♡</span>
          </button>
          {hoverTarget === "favorite" && renderTooltip("찜한 차량")}
        </div>

        <div style={dividerStyle} />

        {/* 차량 비교 */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() =>
              router.push("https://192.168.0.160.nip.io:8000/quote")
            }
            onMouseEnter={() => setHoverTarget("compare")}
            onMouseLeave={() => setHoverTarget(null)}
            style={iconButtonStyle}
          >
            <div
              style={{
                width: "22px",
                height: "18px",
                borderRadius: "4px",
                border: "1.3px solid #555",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              VS
            </div>
          </button>
          {hoverTarget === "compare" && renderTooltip("차량 비교")}
        </div>
      </div>

      {/* 메뉴 (••• 버튼 및 팝업) */}
      <div
        style={{
          position: "relative",
          height: isMenuOpen ? 150 : 46,
          transition: "height 0.2s ease-out",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {!isMenuOpen && (
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "46px",
              height: "46px",
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#ffffff",
              boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "18px", letterSpacing: "2px" }}>
              •••
            </span>
          </button>
        )}

        {isMenuOpen && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "140px",
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
              padding: "10px 0 12px",
              fontSize: "13px",
              zIndex: 61,
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              style={{
                border: "none",
                background: "none",
                fontSize: "18px",
                cursor: "pointer",
                marginBottom: "8px",
              }}
            >
              ✕
            </button>

            <div
              style={{
                borderTop: "1px solid #f1f1f1",
                paddingTop: "6px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push("/community");
                }}
                style={menuItemStyle}
              >
                커뮤니티
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push("/mypage/login");
                }}
                style={menuItemStyle}
              >
                회원가입
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push("/event");
                }}
                style={menuItemStyle}
              >
                이벤트
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 고객센터 버튼 (항상 표시, 메뉴 열릴 때 위로 이동) */}
      <button
        type="button"
        onClick={() => router.push("/customer-center")}
        onMouseEnter={() => setIsConsultHover(true)}
        onMouseLeave={() => setIsConsultHover(false)}
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "999px",
          border: "none",
          outline: "none",
          backgroundColor: "#0F62FE",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 600,
          boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
          cursor: "pointer",
          position: "relative",
          bottom: isMenuOpen ? "150px" : "0px",
          transition: "bottom 0.2s ease-out",
        }}
      >
          {isConsultHover ? (
            "고객센터"
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 11a6 6 0 0 1 12 0"
                stroke="#ffffff"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
              />
              <rect
                x="4"
                y="11"
                width="3"
                height="6"
                rx="1.2"
                stroke="#ffffff"
                strokeWidth="1.6"
                fill="none"
              />
              <rect
                x="17"
                y="11"
                width="3"
                height="6"
                rx="1.2"
                stroke="#ffffff"
                strokeWidth="1.6"
                fill="none"
              />
              <path
                d="M9.5 18.5c.5 1.2 1.7 2 3.1 2h1.4"
                stroke="#ffffff"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
    </div>
  );
}

const iconButtonStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "999px",
  border: "none",
  backgroundColor: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#333333",
};

const dividerStyle = {
  width: "24px",
  height: "1px",
  backgroundColor: "#e5e5e5",
};

const menuItemStyle = {
  width: "100%",
  padding: "8px 0",
  border: "none",
  background: "none",
  cursor: "pointer",
  fontSize: "13px",
  color: "#333",
  textAlign: "center",
};
