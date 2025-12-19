// app/event/end/page.js
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const events = [
  // ✅ 진행중 이벤트 3개
  {
    id: 1,
    status: "ongoing",
    badge: "이벤트",
    dday: "27-day",
    title: "블로그 후기 쓰고, 네이버페이 받자!",
    desc: "여러분의 소중한 이야기를 기다립니다.",
    period: "2025-02-05 ~ 2025-12-31",
    image: "/event/event1.png",
  },
  {
    id: 2,
    status: "ongoing",
    badge: "이벤트",
    dday: "27-day",
    title: "지인 추천하고 상품권 받자",
    desc: "알파카를 추천하면 5만원 주유상품권!",
    period: "2025-02-01 ~ 2025-12-31",
    image: "/event/event2.png",
  },
  {
    id: 3,
    status: "ongoing",
    badge: "이벤트",
    dday: "10-day",
    title: "ALPHACAR 견적 비교하면 30만원 할인!",
    desc: "견적 비교만 해도 추가 할인 쿠폰을 드립니다.",
    period: "2025-06-01 ~ 2025-12-31",
  },
  // ✅ 종료된 이벤트 2개
  {
    id: 4,
    status: "ended",
    badge: "이벤트",
    dday: "종료",
    title: "신규 가입 웰컴 포인트 지급",
    desc: "회원가입만 해도 웰컴 포인트를 지급했습니다.",
    period: "2025-03-01 ~ 2025-03-31",
  },
  {
    id: 5,
    status: "ended",
    badge: "이벤트",
    dday: "종료",
    title: "시승 후기 남기고 커피 기프티콘 받기",
    desc: "시승 후기를 남겨주신 분들께 선물을 드렸습니다.",
    period: "2025-04-01 ~ 2025-04-10",
  },
];

// 🔗 진행중 이벤트 상세 페이지 링크 매핑
function getEventHref(ev) {
  if (ev.id === 1) return "/event/blog-review";
  if (ev.id === 2) return "/event/recommend";
  if (ev.id === 3) return "/event/discount";
  return null;
}

// 하단 페이지네이션 (모양만)
function Pagination() {
  return (
    <div
      style={{
        marginTop: 28,
        display: "flex",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <button
        type="button"
        style={{
          width: 32,
          height: 32,
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#e5e7eb",
          color: "#9ca3af",
          fontSize: 14,
          cursor: "default",
        }}
        aria-disabled="true"
      >
        ‹
      </button>
      <button
        type="button"
        style={{
          width: 34,
          height: 34,
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#2563eb",
          color: "#ffffff",
          fontSize: 14,
          fontWeight: 600,
          cursor: "default",
          boxShadow: "0 6px 18px rgba(37, 99, 235, 0.45)",
        }}
      >
        1
      </button>
      <button
        type="button"
        style={{
          width: 32,
          height: 32,
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#ffffff",
          color: "#9ca3af",
          fontSize: 14,
          cursor: "default",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
        }}
        aria-disabled="true"
      >
        ›
      </button>
    </div>
  );
}

export default function EndEventPage() {
  // ✅ 여기만 다름: 기본 탭을 "ended"로 시작
  const [activeTab, setActiveTab] = useState("ended"); // "ongoing" | "ended"

  const ongoingEvents = useMemo(
    () => events.filter((ev) => ev.status === "ongoing"),
    []
  );
  const endedEvents = useMemo(
    () => events.filter((ev) => ev.status === "ended"),
    []
  );

  const eventsToShow = activeTab === "ongoing" ? ongoingEvents : endedEvents;
  const isEndedTab = activeTab === "ended";

  const renderCard = (ev, index, isEnded) => {
    const href = getEventHref(ev);

    const card = (
      <article
        style={{
          borderRadius: "20px",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          boxShadow: "0 10px 28px rgba(15, 23, 42, 0.12)",
          display: "flex",
          flexDirection: "column",
          minHeight: "340px",
          position: "relative",
        }}
      >
        {/* 상단 이미지 / 그라데이션 */}
        <div
          style={{
            height: "190px",
            overflow: "hidden",
            backgroundColor: "#111827",
            position: "relative",
          }}
        >
          {ev.image ? (
            <img
              src={ev.image}
              alt={ev.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background:
                  index % 2 === 0
                    ? "linear-gradient(135deg, #111827, #1f2937)"
                    : "linear-gradient(135deg, #ffedd5, #fb923c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 18px",
                color: "#ffffff",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "16px",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(0,0,0,0.35)",
                  fontSize: "11px",
                }}
              >
                SPECIAL EVENT
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  textAlign: "center",
                  lineHeight: 1.4,
                  textShadow: "0 2px 6px rgba(0,0,0,0.4)",
                }}
              >
                {ev.title}
              </div>
            </div>
          )}
        </div>

        {/* 하단 텍스트 */}
        <div
          style={{
            padding: "16px 18px 18px",
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "10px",
              fontSize: "12px",
            }}
          >
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "999px",
                backgroundColor: "#eef2ff",
                color: "#4f46e5",
                fontWeight: 600,
              }}
            >
              {ev.badge}
            </span>
            <span style={{ color: "#9ca3af" }}>{ev.dday}</span>
          </div>

          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              margin: "0 0 8px",
              color: "#111827",
              lineHeight: 1.4,
            }}
          >
            {ev.title}
          </h3>

          <p
            style={{
              fontSize: "13px",
              color: "#4b5563",
              margin: "0 0 10px",
            }}
          >
            {ev.desc}
          </p>

          <p
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              marginTop: "auto",
            }}
          >
            {ev.period}
          </p>
        </div>

        {/* 종료된 이벤트일 때 검은 블러 오버레이 */}
        {isEnded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6))",
              backdropFilter: "blur(1.5px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            종료된 이벤트
          </div>
        )}
      </article>
    );

    if (!isEnded && href) {
      return (
        <Link
          key={ev.id}
          href={href}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {card}
        </Link>
      );
    }

    return <div key={ev.id}>{card}</div>;
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 16px 80px",
        }}
      >
        {/* 🔵 상단 히어로 영역 */}
        <section
          style={{
            width: "100%",
            borderRadius: "24px",
            padding: "40px 24px 46px",
            marginBottom: "32px",
            background:
              "linear-gradient(135deg, #e4f0ff 0%, #f3f7ff 40%, #e4f3ff 100%)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "999px",
              backgroundColor: "#ffffff",
              color: "#4b6cff",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "16px",
              boxShadow: "0 4px 10px rgba(148, 163, 184, 0.35)",
            }}
          >
            <span role="img" aria-label="gift">
              🎁
            </span>
            <span>2025 견적 비교 특별 이벤트</span>
          </div>

          <h1
            style={{
              fontSize: "40px",
              lineHeight: 1.25,
              margin: "0 0 10px",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            특별한 혜택을
            <br />
            <span style={{ color: "#3055ff" }}>만나보세요</span>
          </h1>

          <p
            style={{
              fontSize: "15px",
              color: "#4b5563",
              margin: 0,
            }}
          >
            견적 비교만 해도 받을 수 있는 다양한 혜택
          </p>
        </section>

        {/* 상단 탭 */}
        <div
          style={{
            marginBottom: 24,
            borderBottom: "1px solid #d1d5db",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              maxWidth: 800,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("ongoing")}
              style={{
                flex: 1,
                height: 52,
                border: "none",
                borderBottom:
                  activeTab === "ongoing"
                    ? "3px solid #111827"
                    : "3px solid transparent",
                backgroundColor: "transparent",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: activeTab === "ongoing" ? 700 : 500,
                color: activeTab === "ongoing" ? "#111827" : "#6b7280",
              }}
            >
              진행중 이벤트
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ended")}
              style={{
                flex: 1,
                height: 52,
                border: "none",
                borderBottom:
                  activeTab === "ended"
                    ? "3px solid #111827"
                    : "3px solid transparent",
                backgroundColor: "transparent",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: activeTab === "ended" ? 700 : 500,
                color: activeTab === "ended" ? "#111827" : "#6b7280",
              }}
            >
              종료된 이벤트
            </button>
          </div>
        </div>

        {/* 가운데 타이틀 */}
        <section
          style={{
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          <h2
            style={{
              fontSize: 26,
              fontWeight: 800,
              margin: "0 0 8px",
              color: "#111827",
            }}
          >
            이벤트
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "#6b7280",
              margin: 0,
            }}
          >
            ALPHACAR 회원님을 위한 다양한 이벤트를 만나보세요
          </p>
        </section>

        {/* 카드 리스트 */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "24px",
          }}
        >
          {eventsToShow.map((ev, idx) =>
            renderCard(ev, idx, isEndedTab)
          )}
        </section>

        {/* 하단 페이지네이션 */}
        <Pagination />
      </div>
    </main>
  );
}
