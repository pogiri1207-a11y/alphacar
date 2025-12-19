// app/quote/page.js
"use client";

import Link from "next/link";

export default function QuotePage() {
  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "40px auto",
        padding: "0 40px",
      }}
    >
      <section
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "40px 40px 40px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          minHeight: "50vh",
          boxSizing: "border-box",
        }}
      >
        {/* ---------------- 상단 : 질문 + 로고 ---------------- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "40px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "13px",
                color: "#999",
                marginBottom: "4px",
              }}
            >
              ALPHACAR 내차 구매
            </p>
            <h1
              style={{
                fontSize: "28px",
                lineHeight: 1.4,
                marginBottom: "10px",
              }}
            >
              어떤 방법으로 차량을
              <br />
              구매하고 싶으신가요?
            </h1>
            <p style={{ fontSize: "15px", color: "#666" }}>
              최적의 차량 구매는 ALPHACAR에서 시작해 보세요.
            </p>
          </div>

          {/* 오른쪽 알파카 로고 */}
          <div
            style={{
              width: "260px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="/logo/alphacar-logo.png"
              alt="ALPHACAR 로고"
              style={{
                width: "100%",
                maxWidth: "240px",
                height: "auto",
                display: "block",
              }}
            />
          </div>
        </div>

        {/* ---------------- 하단 : 비교견적 / 개별견적 이미지 버튼 ---------------- */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "16px",
            flexWrap: "wrap",
          }}
        >
          {/* 비교견적 큰 이미지 버튼 */}
          <Link
            href="/quote/compare"
            style={{
              flex: "1 1 0",
              minWidth: "320px",
              textDecoration: "none",
            }}
          >
            <img
              src="/quote/compare-full.jpg.png" // public/quote/compare-full.jpg.png
              alt="비교견적 - 실시간 최저가 판매"
              style={{
                width: "100%",
                display: "block",
                borderRadius: "16px",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
              }}
            />
          </Link>

          {/* 개별견적 큰 이미지 버튼 */}
          <Link
            href="/quote/personal"
            style={{
              flex: "1 1 0",
              minWidth: "320px",
              textDecoration: "none",
            }}
          >
            <img
              src="/quote/personal-full.jpg.png" // public/quote/personal-full.jpg.png
              alt="개별견적 - 원하는 차량 정보를 한눈에"
              style={{
                width: "100%",
                display: "block",
                borderRadius: "16px",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
              }}
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
