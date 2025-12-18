// app/event/blog-review/page.js
"use client";

import Link from "next/link";

export default function BlogReviewEventPage() {
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
        {/* 하얀 카드 전체 래핑 */}
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
            &nbsp;&gt;&nbsp; 이벤트 &nbsp;&gt;&nbsp; 블로그 후기 이벤트
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
                top: "0",
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
              블로그 후기 쓰고, 네이버페이 받자!
            </h1>

            <div style={{ fontSize: "13px", color: "#666" }}>
              이벤트 기간 2025-02-05 09:00:00 ~ 2025-12-31 23:59:59
              &nbsp;&nbsp;|&nbsp;&nbsp; 등록일 2025-01-20
            </div>
          </div>

          {/* 메인 이미지 */}
          <div style={{ marginTop: "8px", marginBottom: "24px" }}>
            <img
              src="/event/blog_review_top.png"
              alt="블로그 후기 작성 이벤트"
              style={{
                width: "100%",
                display: "block",
                borderRadius: "12px",
              }}
            />
          </div>

          {/* 1. 이벤트 기본 안내 (파란 박스) */}
          <section
            style={{
              backgroundColor: "#0072ff",
              color: "#fff",
              borderRadius: "12px",
              padding: "22px 20px 18px",
              marginBottom: "28px",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "14px",
              }}
            >
              이벤트 참여 안내
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "16px",
                fontSize: "14px",
              }}
            >
              <div>
                <div style={{ opacity: 0.9 }}>이벤트 참여 기간</div>
                <div style={{ marginTop: "4px", fontWeight: "500" }}>
                  2025. 02. 05 ~ 2025. 12. 31
                </div>
              </div>

              <div>
                <div style={{ opacity: 0.9 }}>이벤트 참여 대상</div>
                <div style={{ marginTop: "4px", fontWeight: "500" }}>
                  알파카 서비스 이용 고객 (구매/판매)
                </div>
              </div>

              <div>
                <div style={{ opacity: 0.9 }}>이벤트 참여 방법</div>
                <div style={{ marginTop: "4px", fontWeight: "500" }}>
                  블로그 후기 작성 후
                  <br />
                  네이버 폼 제출
                </div>
              </div>
            </div>
          </section>

          {/* 2. 이벤트 참여 필수 조건 */}
          <section style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                textAlign: "center",
                marginBottom: "18px",
              }}
            >
              이벤트 참여 필수 조건
            </h2>

            {/* Step 1 */}
            <div
              style={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
                padding: "18px 18px",
                marginBottom: "12px",
                display: "flex",
                gap: "14px",
                boxShadow: "0 4px 10px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#0072ff",
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
                    fontWeight: "600",
                    marginBottom: "6px",
                    fontSize: "15px",
                  }}
                >
                  [구매/판매후기] 관련 사진 5장 이상 + 텍스트 1000자 이상
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  차량 사진, 계약서, 알파카 화면 등 실제 이용 내역이 확인 가능한
                  이미지를 5장 이상 첨부해 주세요.
                </div>
              </div>
            </div>

            {/* Step 2 – 번호는 왼쪽, 내용은 가운데 정렬 */}
            <div
              style={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
                padding: "18px 18px",
                marginBottom: "12px",
                display: "flex",
                gap: "14px",
                boxShadow: "0 4px 10px rgba(15, 23, 42, 0.06)",
              }}
            >
              {/* 번호 동그라미 */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#0072ff",
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

              {/* 오른쪽 내용 – 전부 가운데 정렬 */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                {/* 제목 */}
                <div
                  style={{
                    fontWeight: "700",
                    marginBottom: "10px",
                    fontSize: "15px",
                  }}
                >
                  추천 키워드 중 1개를 선택하여 제목과 본문에 입력 + 필수
                  해시태그 포함
                </div>

                {/* 추천 키워드 pill 두 개 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    marginBottom: "10px",
                    fontSize: "13px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      padding: "7px 14px",
                      borderRadius: "999px",
                      backgroundColor: "#f0f5ff",
                      border: "1px solid #c7d6ff",
                      color: "#2563eb",
                      fontWeight: 600,
                    }}
                  >
                    알파카 구매후기
                  </span>
                  <span
                    style={{
                      padding: "7px 14px",
                      borderRadius: "999px",
                      backgroundColor: "#f0f5ff",
                      border: "1px solid #c7d6ff",
                      color: "#2563eb",
                      fontWeight: 600,
                    }}
                  >
                    알파카 판매후기
                  </span>
                </div>

                {/* + 표시 */}
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  +
                </div>

                {/* 안내 문구 */}
                <div
                  style={{
                    fontSize: "13px",
                    marginBottom: "6px",
                    color: "#374151",
                  }}
                >
                  아래 해시태그를 <strong>본문에 모두 포함</strong>해 주세요.
                </div>

                {/* 해시태그 pill 영역 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      backgroundColor: "#f5f5f5",
                      fontSize: "13px",
                    }}
                  >
                    #알파카
                  </span>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      backgroundColor: "#f5f5f5",
                      fontSize: "13px",
                    }}
                  >
                    #구매후기
                  </span>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      backgroundColor: "#f5f5f5",
                      fontSize: "13px",
                    }}
                  >
                    #판매후기
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div
              style={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
                padding: "18px 18px",
                marginBottom: "4px",
                display: "flex",
                gap: "14px",
                boxShadow: "0 4px 10px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#0072ff",
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
                    fontWeight: "600",
                    marginBottom: "6px",
                    fontSize: "15px",
                  }}
                >
                  블로그 게시글 공개 설정은 반드시 &lsquo;전체공개&rsquo;로 설정
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  이웃공개, 비공개 글은 이벤트 참여로 인정되지 않습니다.
                </div>
              </div>
            </div>
          </section>

          {/* 3. 꼭 읽어 주세요 */}
          <section>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              꼭 읽어 주세요!
            </h2>
            <ul
              style={{
                listStyle: "disc",
                paddingLeft: "22px",
                fontSize: "13px",
                lineHeight: 1.7,
                color: "#555",
              }}
            >
              <li>
                본 이벤트 응모를 원하시면 네이버 블로그에 후기를 작성한 후,
                알파카 안내에 따라 네이버폼을 제출해 주세요.
              </li>
              <li>본 이벤트는 1인 1회만 참여 가능합니다.</li>
              <li>
                경품 발송을 위해 개인 정보를 수집·이용할 수 있으며, 이에
                동의하지 않을 경우 경품 지급이 제한될 수 있습니다.
              </li>
              <li>
                블로그 게시 시 허위의 사실, 타인의 권리를 침해하는 내용이
                포함될 경우 이벤트 대상에서 제외될 수 있습니다.
              </li>
              <li>
                네이버페이 포인트 지급 일정 및 방식은 내부 사정에 따라 변경될 수
                있습니다.
              </li>
              <li>
                부정 참여가 의심되는 경우(동일 내용 다수 게시, 무단 도용 등)
                사전 통보 없이 이벤트 대상에서 제외될 수 있습니다.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
