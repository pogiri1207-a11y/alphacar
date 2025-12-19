"use client";

import React, { useMemo, useState, CSSProperties } from "react";

// ✅ [핵심] InfoCard의 Props 타입 정의 (actionLabel, onAction을 Optional로 설정)
interface InfoCardProps {
  title: string;
  subtitle: string;
  iconSrc: string;
  actionLabel?: string;      // 👈 ?를 붙여서 있어도 되고 없어도 되게 함
  onAction?: () => void;     // 👈 ?를 붙여서 있어도 되고 없어도 되게 함
  children: React.ReactNode;
}

export default function CustomerCenterPage() {
  const faqItems = useMemo(
    () => [
      {
        id: 1,
        question: "차량 구매 금액에는 어떤 항목들이 포함되나요?",
        answer: (
          <ul style={answerListStyle}>
            <li>차량 가격 외 명의 이전비, 관리 비용(매도비), 탁송비가 포함됩니다.</li>
            <li>연장보증 서비스, 선택형 옵션 구매 시 비용이 추가됩니다.</li>
            <li>명의 이전비: 취·등록세, 공채 할인비, 등록 대행 수수료 등이 포함됩니다.</li>
            <li>관리 비용: 자동차관리법 제122조에 명시된 차량 보관/관리 실비입니다.</li>
          </ul>
        ),
      },
      {
        id: 2,
        question: "견적 비교 결과는 얼마나 빨리 받을 수 있나요?",
        answer: (
          <ul style={answerListStyle}>
            <li>AI가 실시간으로 제휴사 견적을 계산해 평균 30초 내 결과를 제공합니다.</li>
            <li>브랜드/트림/옵션 선택이 완료되지 않은 경우, 추가 정보 요청 알림을 드립니다.</li>
            <li>야간/점검 시간에는 최대 1~2분 더 소요될 수 있습니다.</li>
          </ul>
        ),
      },
      {
        id: 3,
        question: "금융 상품(할부/리스/렌트)도 비교가 가능한가요?",
        answer: (
          <ul style={answerListStyle}>
            <li>할부, 운용리스, 렌터카 상품을 동시에 비교해 최적 총소유비용을 제공합니다.</li>
            <li>신용등급은 저장하지 않으며, 사전 한도 조회는 제휴 금융사 페이지에서 이뤄집니다.</li>
            <li>보증금·잔가·기간을 조정하며 총이자/월 납입액을 시뮬레이션할 수 있습니다.</li>
          </ul>
        ),
      },
      {
        id: 4,
        question: "계약 취소나 변경은 어떻게 진행되나요?",
        answer: (
          <ul style={answerListStyle}>
            <li>배정 전: 별도 위약금 없이 취소 가능합니다. 즉시 상담원에게 알려주세요.</li>
            <li>배정 후: 제휴사 정책에 따른 실비(탁송/서류 비용)가 발생할 수 있습니다.</li>
            <li>옵션 변경 시 재견적이 필요하며, 금액 변동분을 안내드립니다.</li>
          </ul>
        ),
      },
      {
        id: 5,
        question: "차량 인도까지 어떤 과정을 거치나요?",
        answer: (
          <ul style={answerListStyle}>
            <li>① 견적 확정 → ② 계약/등록 서류 접수 → ③ 차량 배정 및 검사 → ④ 탁송/인도</li>
            <li>평균 3~7영업일 소요되며, 인기 트림/색상은 추가 대기 가능성이 있습니다.</li>
            <li>탁송 일정과 위치는 알림톡과 전화로 이중 안내드립니다.</li>
          </ul>
        ),
      },
    ],
    []
  );

  const [openedIds, setOpenedIds] = useState<Set<number>>(() => new Set());

  const toggleItem = (id: number) => {
    setOpenedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "40px auto 96px", padding: "0 20px" }}>
      {/* 헤더 영역 */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <h1 style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.4px", margin: 0 }}>고객센터</h1>
        <p style={{ fontSize: "14px", color: "#666", marginTop: "10px", lineHeight: 1.6 }}>
          신차 견적 비교·금융 상담·계약 진행까지 필요한 도움을 빠르게 받아보세요.
        </p>
      </div>

      {/* 주요 연락/채널 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        {/* actionLabel, onAction이 없어도 타입 에러가 발생하지 않음 */}
        <InfoCard title="전화문의" subtitle="평일 09:00 ~ 18:00" iconSrc="/icons/phone.svg">
          <div style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "1px", color: "#111" }}>1588-0000</div>
          <p style={{ marginTop: "8px", fontSize: "13px", color: "#666", lineHeight: 1.6 }}>
            신차 견적, 금융, 인도 일정 등 무엇이든 문의하세요.
          </p>
        </InfoCard>

        <InfoCard
          title="24시간 챗봇 상담"
          subtitle="즉시 응답"
          iconSrc="/icons/chatbot-outline.svg"
          actionLabel="AI CHAT"
          onAction={() => window.dispatchEvent(new Event("openAiChat"))}
        >
          <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.6, marginBottom: "10px" }}>
            하단 AI Chat 버튼을 눌러 실시간 답변을 받아보세요.
          </p>
        </InfoCard>

        <InfoCard
          title="회원 1:1 문의"
          subtitle="전담 매니저 연결"
          iconSrc="/icons/inquiry-outline.svg"
          actionLabel="상담 신청"
          onAction={() => {
            window.location.href = "/consult";
          }}
        >
          <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.6, marginBottom: "10px" }}>
            상담 내역을 남기면 담당자가 빠르게 연락드립니다.
          </p>
        </InfoCard>
      </div>

      {/* FAQ */}
      <section style={{ marginTop: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>자주 묻는 질문 TOP5</h2>
          <span style={{ fontSize: "12px", color: "#888" }}>클릭하면 펼쳐서 확인할 수 있어요</span>
        </div>

        <div style={{ borderTop: "1px solid #e5e5e5" }}>
          {faqItems.map((item) => {
            const opened = openedIds.has(item.id);
            return (
              <div
                key={item.id}
                style={{
                  borderBottom: "1px solid #e5e5e5",
                  backgroundColor: opened ? "#fafafa" : "#fff",
                  transition: "background-color 0.2s ease",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={opened}
                  style={{
                    width: "100%",
                    padding: "16px 16px 16px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
                    <span style={{ color: "#0F62FE", fontWeight: 800 }}>Q</span>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "#111", lineHeight: 1.5 }}>
                      {item.question}
                    </span>
                  </div>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: "1px solid #d7d7d7",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#555",
                      fontWeight: 700,
                      backgroundColor: "#fff",
                      flexShrink: 0,
                    }}
                    aria-hidden
                  >
                    {opened ? "⌃" : "⌄"}
                  </span>
                </button>

                {opened && (
                  <div style={{ padding: "0 44px 18px 40px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ color: "#0F62FE", fontWeight: 800, marginTop: "4px" }}>A</span>
                      <div style={{ fontSize: "14px", color: "#333", lineHeight: 1.7 }}>{item.answer}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ✅ InfoCard 컴포넌트에 타입 적용
function InfoCard({ title, subtitle, iconSrc, actionLabel, onAction, children }: InfoCardProps) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "18px 18px 20px",
        background: "#fff",
        boxShadow: "0 8px 16px rgba(0,0,0,0.03)",
        minHeight: 150,
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        columnGap: "12px",
        rowGap: "8px",
        alignItems: "center",
      }}
    >
      {iconSrc && <img src={iconSrc} alt="" style={{ width: 52, height: 52 }} />}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "#0F62FE" }}>{title}</div>
        <div style={{ fontSize: "13px", color: "#666" }}>{subtitle}</div>
        {children}
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            style={{
              marginTop: "4px",
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #0F62FE",
              backgroundColor: "#0F62FE",
              color: "#fff",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 8px 16px rgba(15,98,254,0.18)",
            }}
          >
            {actionLabel}
            <span aria-hidden>→</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ✅ 스타일 객체에 CSSProperties 타입 적용
const answerListStyle: CSSProperties = {
  margin: "6px 0 0",
  paddingLeft: "18px",
  display: "grid",
  gap: "6px",
  listStyle: "disc",
  fontSize: "13px",
  color: "#333",
  lineHeight: 1.6,
};
