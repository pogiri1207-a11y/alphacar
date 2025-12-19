// app/event/recommend/page.js
"use client";

import Link from "next/link";

export default function RecommendEventPage() {
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
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        {/* 하얀 카드 전체 */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            padding: "24px 24px 40px",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
          }}
        >
          {/* 상단 위치 표시 */}
          <div
            style={{
              fontSize: "13px",
              color: "#888",
              marginBottom: "12px",
            }}
          >
            <Link href="/" style={{ color: "#4b5563", textDecoration: "none" }}>
              ALPHACAR
            </Link>{" "}
            &nbsp;&gt;&nbsp; 이벤트 &nbsp;&gt;&nbsp; 지인 추천 이벤트
          </div>

          {/* 상단 제목 영역 */}
          <div
            style={{
              position: "relative",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            {/* 공유 버튼 */}
            <button
              type="button"
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                borderRadius: "999px",
                border: "1px solid #ddd",
                padding: "6px 12px",
                fontSize: "12px",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              ↗ 공유
            </button>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 12px",
                borderRadius: "999px",
                border: "1px solid #1ec800",
                color: "#1ec800",
                fontSize: "12px",
                marginBottom: "10px",
              }}
            >
              이벤트
            </div>

            <h1
              style={{
                fontSize: "26px",
                fontWeight: "700",
                margin: "0 0 6px",
              }}
            >
              지인 추천하고 상품권 받자
            </h1>

            <div style={{ fontSize: "13px", color: "#666" }}>
              이벤트 기간 2025-02-01 00:00:00 ~ 2025-12-31 23:59:59
              &nbsp;&nbsp;|&nbsp;&nbsp; 등록일 2025-01-20
            </div>
          </div>

          {/* 메인 이미지 */}
          <div style={{ marginTop: "8px", marginBottom: "24px" }}>
            <img
              src="/event/referral_top.png"
              alt="지인 추천하고 상품권 받자"
              style={{
                width: "100%",
                display: "block",
                borderRadius: "12px",
              }}
            />
          </div>

          {/* 안내 문구 + 혜택/기간 표 */}
          <section style={{ marginBottom: "28px", textAlign: "center" }}>
            <p
              style={{
                fontSize: "16px", // 🔼 글씨 키움
                color: "#374151",
                lineHeight: 1.7,
                marginBottom: "16px",
              }}
            >
              ALPHACAR에서 차량을 구매하시고 만족하셨다면,
              <br />
              지인에게 ALPHACAR를 추천해 주세요!
            </p>
            <p
              style={{
                fontSize: "16px", // 🔼 글씨 키움
                color: "#374151",
                fontWeight: 600,
                lineHeight: 1.7,
                marginBottom: "20px",
              }}
            >
              지인께서 ALPHACAR에서 차량을 구매하시면,
              <br />
              추천하신 분께 주유상품권을 드립니다!
            </p>

            {/* 혜택/유효기간 표 */}
            <div
              style={{
                display: "inline-block",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
                minWidth: "260px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  backgroundColor: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: "14px", // 🔼
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    borderRight: "1px solid #e5e7eb",
                  }}
                >
                  추천 혜택
                </div>
                <div style={{ padding: "10px 14px" }}>유효 기간</div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  fontSize: "14px", // 🔼
                  color: "#4b5563",
                }}
              >
                <div
                  style={{
                    padding: "12px 14px",
                    borderRight: "1px solid #e5e7eb",
                  }}
                >
                  모바일 주유상품권
                  <br />
                  (5만원) 증정
                </div>
                <div style={{ padding: "12px 14px" }}>
                  발송일 기준 1개월(30일)
                </div>
              </div>
            </div>
          </section>

          {/* 유의사항 박스 */}
          <section
            style={{
              borderRadius: "12px",
              backgroundColor: "#f4f5f7",
              padding: "18px 18px 20px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
                gap: "6px",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "999px",
                  backgroundColor: "#111827",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                1
              </div>
              <span
                style={{
                  fontSize: "16px", // 🔼
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                유의사항
              </span>
            </div>

            <ul
              style={{
                listStyle: "disc",
                paddingLeft: "22px",
                fontSize: "14px", // 🔼
                lineHeight: 1.8,
                color: "#4b5563",
              }}
            >
              <li>
                본 이벤트는 최근 3년 이내에 ALPHACAR를 통해 차량을 구매하신
                고객님에 한해 참여가 가능합니다.
              </li>
              <li>
                모바일 주유 상품권은 지인의 차량 구매 확정이 완료된 경우,
                추천해 주신 분께 지급됩니다.
              </li>
              <li>
                유효기간 내에 상품권을 사용하지 않을 경우, 금액적 또는 기타
                서비스로의 대체는 불가합니다.
              </li>
              <li>
                본 이벤트는 당사 사정으로 인해 사전 안내 없이 종료되거나,
                내용이 변경될 수 있습니다.
              </li>
              <li>
                모바일 주유 상품권은 지인 차량 구매 확정일로부터 영업일 기준
                10일 이내에 발송됩니다.
              </li>
              <li>
                본 이벤트에 관한 자세한 사항은 차량 상담을 진행하신 담당자에게
                문의해 주시기 바랍니다.
              </li>
            </ul>
          </section>

          {/* 상담 문의 */}
          <section style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "14px", // 🔼
                color: "#6b7280",
                marginBottom: "6px",
              }}
            >
              상담 문의
            </div>
            <div
              style={{
                fontSize: "24px", // 🔼 22 → 24
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#111827",
              }}
            >
              1588-0000
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
