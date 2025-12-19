// app/mypage/points/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyPagePoints() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // 마이페이지에서 저장해둔 alphacarUser 불러오기
  useEffect(() => {
    try {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem("alphacarUser")
          : null;
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error("유저 정보 불러오기 실패", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return (
      <div style={{ padding: "60px 16px" }}>포인트 정보를 불러오는 중...</div>
    );
  }

  // 로그인 안 되어 있을 때
  if (!user) {
    return (
      <div
        style={{
          maxWidth: "900px",
          margin: "80px auto",
          padding: "0 24px 80px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          포인트
        </h1>
        <p style={{ fontSize: "14px", color: "#666" }}>
          포인트 확인을 위해 로그인이 필요합니다.
          <br />
          마이페이지에서 로그인한 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  // 사용자 정보 & 포인트 값
  const nickname = user.nickname || "플렉스하는 알파카";
  const email = user.email || "AlphaFlex123@naver.com";
  const provider = (user.provider || "email").toLowerCase(); // kakao / google / email
  const point = user.point ?? 0;

  return (
    // 🔹 전체를 flex 로 감싸서 가운데 정렬
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "60px 16px 80px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* 🔹 실제 콘텐츠 영역: 가운데 정렬용 래퍼 */}
      <div style={{ width: "100%", maxWidth: "700px" }}>
        {/* 🔙 뒤로가기 버튼 */}
        <button
          type="button"
          onClick={() => router.push("/mypage")}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "13px",
            color: "#666",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "16px" }}>←</span>
          <span>마이페이지로</span>
        </button>

        {/* 상단: 유저 정보 (닉네임 + 이메일 + 로그인 타입 배지) */}
        <section style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              marginBottom: "10px",
            }}
          >
            {nickname}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {/* 마이페이지 메인과 동일한 노란 KAKAO 배지 스타일 */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 10px",
                borderRadius: "999px",
                backgroundColor:
                  provider === "kakao"
                    ? "#FEE500"
                    : provider === "google"
                    ? "#E8F0FE"
                    : "#f3f4f6",
                fontSize: "12px",
                fontWeight: 600,
                color: provider === "kakao" ? "#000" : "#333",
              }}
            >
              {provider.toUpperCase()}
            </span>

            <span style={{ fontSize: "15px", color: "#444" }}>{email}</span>
          </div>
        </section>

        {/* ✅ 바로 아래에 큰 네모 포인트 카드 */}
        <section
          style={{
            width: "100%",
            borderRadius: "20px",
            backgroundColor: "#fff",
            boxShadow: "0 12px 28px rgba(0,0,0,0.06)",
            padding: "26px 32px 24px",
          }}
        >
          {/* 상단: 사용 가능한 포인트 + 안내 버튼 + 사용하기 버튼 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "20px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#888",
                  marginBottom: "6px",
                }}
              >
                사용 가능한 포인트
              </div>
              <div
                style={{
                  fontSize: "40px",
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                {point}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {/* 포인트 적립 안내 뱃지 */}
              <button
                type="button"
                style={{
                  borderRadius: "999px",
                  border: "1px solid #f1f3f5",
                  padding: "6px 12px",
                  fontSize: "11px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  color: "#555",
                }}
                onClick={() =>
                  alert("포인트 적립/사용 안내는 추후 추가 예정입니다.")
                }
              >
                포인트 적립 안내
              </button>

              {/* 사용하기 버튼 */}
              <button
                type="button"
                style={{
                  borderRadius: "8px",
                  border: "none",
                  padding: "8px 20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor: "#111",
                  color: "#fff",
                  cursor: "pointer",
                }}
                onClick={() =>
                  alert("포인트 사용 기능은 추후 연결 예정입니다.")
                }
              >
                사용하기
              </button>
            </div>
          </div>

          {/* 구분선 */}
          <div
            style={{
              height: "1px",
              backgroundColor: "#f1f3f5",
              margin: "10px 0 14px",
            }}
          />

          {/* 적립 · 사용 내역 타이틀 */}
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "12px",
              color: "#444",
            }}
          >
            적립 · 사용 내역
          </div>

          {/* 샘플 내역 1줄 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              fontSize: "13px",
            }}
          >
            <div>
              <div style={{ marginBottom: "4px" }}>
                신규 회원가입 축하 포인트
              </div>
              <div style={{ fontSize: "12px", color: "#999" }}>
                2025.11.24 15:23
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#e02424",
                  marginBottom: "2px",
                }}
              >
                + {point}
              </div>
              <div style={{ fontSize: "12px", color: "#999" }}>적립</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
