// app/event/discount/page.js
"use client";

import Link from "next/link";

export default function DiscountEventPage() {
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
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            padding: "24px 24px 40px",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
          }}
        >
          {/* 위치 표시 */}
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
            &nbsp;&gt;&nbsp; 이벤트 &nbsp;&gt;&nbsp; 견적 비교 30만원 할인
          </div>

          {/* 상단 타이틀 */}
          <div
            style={{
              position: "relative",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
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
                border: "1px solid #2563eb",
                color: "#2563eb",
                fontSize: "12px",
                marginBottom: "10px",
              }}
            >
              SPECIAL EVENT
            </div>

            <h1
              style={{
                fontSize: "26px",
                fontWeight: "700",
                margin: "0 0 6px",
              }}
            >
              ALPHACAR 견적 비교하면 30만원 할인!
            </h1>

            <div style={{ fontSize: "13px", color: "#666" }}>
              이벤트 기간 2025-12-01 ~ 2026-03-31 
              &nbsp;&nbsp;|&nbsp;&nbsp; 등록일 2025-12-01
            </div>
          </div>

          {/* 상단 안내 박스 (이미지 대신 컬러 영역) */}
          <section
            style={{
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, #111827 0%, #1f2937 40%, #0f172a 100%)",
              color: "#ffffff",
              padding: "26px 22px 22px",
              marginBottom: "28px",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                margin: "0 0 10px",
              }}
            >
              견적 비교만 해도 최대 30만원 추가 할인!
            </h2>
            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.7,
                margin: 0,
                opacity: 0.9,
              }}
            >
              ALPHACAR에서 여러 딜러사의 견적을 한 번에 비교하고,
              <br />
              최종 구매 확정 시, 추가 할인 혜택을 드립니다.
            </p>
          </section>

          {/* 할인 혜택 안내 */}
          <section style={{ marginBottom: "28px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "14px",
                textAlign: "center",
              }}
            >
              할인 혜택 안내
            </h3>

            <div
              style={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1.1fr",
                  backgroundColor: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: "14px",
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
                  혜택 내용
                </div>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRight: "1px solid #e5e7eb",
                  }}
                >
                  적용 대상
                </div>
                <div style={{ padding: "10px 14px" }}>사용 기한</div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1.1fr",
                  fontSize: "14px",
                  color: "#4b5563",
                }}
              >
                <div
                  style={{
                    padding: "12px 14px",
                    borderRight: "1px solid #e5e7eb",
                  }}
                >
                  차량 구매 확정 시 최대 30만원
                  <br />
                  추가 할인 쿠폰 제공
                </div>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRight: "1px solid #e5e7eb",
                  }}
                >
                  ALPHACAR 견적 비교를 통해
                  <br />
                  최종 계약을 완료한 고객
                </div>
                <div style={{ padding: "12px 14px" }}>
                  쿠폰 발급일 기준 30일 이내
                </div>
              </div>
            </div>
          </section>

          {/* 참여 방법 */}
          <section style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "14px",
                textAlign: "center",
              }}
            >
              참여 방법
            </h3>

            {/* Step 01 */}
            <div
              style={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
                padding: "18px 18px",
                marginBottom: "10px",
                display: "flex",
                gap: "14px",
                boxShadow: "0 4px 10px rgba(15, 23, 42, 0.03)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "600",
                  flexShrink: 0,
                }}
              >
                01
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: "6px",
                    fontSize: "15px",
                  }}
                >
                  ALPHACAR에서 원하는 차량을 검색하고 견적 비교 신청
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  여러 딜러사의 견적을 한 번에 받아볼 수 있도록 비교 요청을
                  진행해 주세요.
                </div>
              </div>
            </div>

            {/* Step 02 */}
            <div
              style={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
                padding: "18px 18px",
                marginBottom: "10px",
                display: "flex",
                gap: "14px",
                boxShadow: "0 4px 10px rgba(15, 23, 42, 0.03)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "600",
                  flexShrink: 0,
                }}
              >
                02
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: "6px",
                    fontSize: "15px",
                  }}
                >
                  상담을 통해 최종 견적 확정 및 차량 계약
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  담당 매니저와의 상담 후, 최종 견적을 확정하고 계약까지
                  완료해 주세요.
                </div>
              </div>
            </div>

            {/* Step 03 */}
            <div
              style={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
                padding: "18px 18px",
                display: "flex",
                gap: "14px",
                boxShadow: "0 4px 10px rgba(15, 23, 42, 0.03)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "600",
                  flexShrink: 0,
                }}
              >
                03
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: "6px",
                    fontSize: "15px",
                  }}
                >
                  계약 완료 후, 할인 쿠폰 자동 발급
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  차량 출고 또는 계약 확정 후, 마이페이지 또는 문자 안내를 통해
                  할인 쿠폰이 발급됩니다.
                </div>
              </div>
            </div>
          </section>

          {/* 유의사항 */}
          <section>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              꼭 읽어 주세요!
            </h3>
            <ul
              style={{
                listStyle: "disc",
                paddingLeft: "22px",
                fontSize: "14px",
                lineHeight: 1.8,
                color: "#4b5563",
              }}
            >
              <li>
                본 이벤트는 ALPHACAR 견적 비교 서비스를 통해 차량을 구매
                확정하신 고객님에 한해 적용됩니다.
              </li>
              <li>
                타 채널(오프라인 매장, 제휴사 사이트 등)에서 직접 계약한 경우,
                이벤트 대상에서 제외될 수 있습니다.
              </li>
              <li>
                할인 쿠폰은 계약 취소 또는 환불 시 자동 소멸되며, 재발급이
                불가합니다.
              </li>
              <li>
                발급된 쿠폰은 명시된 사용 기한 내에서만 사용 가능하며, 기간
                만료 후 연장이 불가합니다.
              </li>
              <li>
                본 이벤트 내용은 당사 사정에 따라 사전 고지 없이 변경되거나
                조기 종료될 수 있습니다.
              </li>
              <li>
                기타 자세한 사항은 ALPHACAR 고객센터 또는 담당 매니저를 통해
                안내해 드립니다.
              </li>
            </ul>
          </section>

          {/* 상담 문의 */}
          <section style={{ textAlign: "center", marginTop: "18px" }}>
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "6px",
              }}
            >
              상담 문의
            </div>
            <div
              style={{
                fontSize: "24px",
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
