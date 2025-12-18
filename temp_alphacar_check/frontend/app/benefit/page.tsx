// app/benefit/page.js
"use client";

import Link from "next/link";

export default function BenefitPage() {
  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "40px auto 80px",
        padding: "0 20px",
      }}
    >
      {/* 상단 위치 표시 */}
      <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>
        <Link href="/">ALPHACAR</Link> &nbsp;&gt;&nbsp; 내차 구매 혜택 안내
      </div>

      {/* 메인 타이틀 */}
      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "16px" }}>
        똑똑하게 내차 사는 법, ALPHACAR
      </h1>
      <p style={{ fontSize: "15px", color: "#666", marginBottom: "28px" }}>
        합리적인 가격, 꼼꼼한 점검, 투명한 정보까지.
        <br />
        내 차를 가장 똑똑하게 사는 방법을 ALPHACAR가 함께합니다.
      </p>

      {/* 파란 메인 배너 영역 */}
      <section
        style={{
          background: "#0052cc",
          borderRadius: "20px",
          padding: "40px 50px",
          display: "flex",
          alignItems: "center",
          color: "white",
          marginBottom: "40px",
          overflow: "hidden",
        }}
      >
        {/* 왼쪽 텍스트 */}
        <div style={{ flex: 1.3, minWidth: 0 }}>
          <h2
            style={{
              fontSize: "26px",
              fontWeight: 700,
              marginBottom: "16px",
              lineHeight: 1.4,
            }}
          >
            원하는 내 차를 합리적인 가격으로
            <br />
            기다림 없이, 부담 없이, 걱정 없이
          </h2>
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.7,
              opacity: 0.96,
              marginBottom: "20px",
            }}
          >
            차량 상태, 정비 이력, 금융 조건까지 한 번에 확인하고
            <br />
            나에게 꼭 맞는 차량만 골라 만나보세요.
          </p>

          <Link
            href="/quote"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 22px",
              borderRadius: "999px",
              backgroundColor: "#ffd338",
              color: "#222",
              fontWeight: 700,
              fontSize: "14px",
              textDecoration: "none",
              marginTop: "6px",
            }}
          >
            지금 비교견적 받아보기 →
          </Link>
        </div>

        {/* 오른쪽 차량 이미지 영역 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              // 하얀 배경/그림자 제거, 위·아래 여백만 관리
              borderRadius: "18px",
              padding: "0",
              minWidth: "260px",
              maxWidth: "380px",
            }}
          >
            {/* 더 커진 차량 이미지 */}
            <img
              src="/topcars/new_ioniq6.png" // public/topcars/new_ioniq6.png
              alt="ALPHACAR 차량 예시 이미지"
              style={{
                width: "100%",
                height: "210px",       // 🔹 높이 키움
                objectFit: "cover",
                borderRadius: "18px",
                marginBottom: "14px",
              }}
            />

            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "4px",
                color: "#fff",
              }}
            >
              안심할 수 있는 차량 정보 제공
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#e0e0e0",
                lineHeight: 1.5,
              }}
            >
              주요 부품 점검 결과, 사고·침수 이력, 주행거리까지
              <br />
              한눈에 확인할 수 있도록 정리해 드립니다.
            </p>
          </div>
        </div>
      </section>

      {/* 아래 3컬럼 설명 영역 */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "32px",
          marginBottom: "60px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
            꼼꼼하게 직영 점검
          </h3>
          <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6 }}>
            핵심 부품과 주행 성능을 기준으로 차량 상태를 꼼꼼히 점검합니다.
            <br />
            사고·침수·주행거리 조작 이력을 투명하게 안내해 드립니다.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
            철저하게 직영 정비
          </h3>
          <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6 }}>
            주요 소모품 교환 및 필수 정비를 사전 완료한 뒤 차량을 전달합니다.
            <br />
            정비 이력은 추후에도 확인할 수 있도록 기록해 둡니다.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
            든든하게 고객 만족
          </h3>
          <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6 }}>
            구매 후 일정 기간 내 문제가 발생하면 보증 정책에 따라
            <br />
            수리, 교환, 환불 등 합리적인 해결 방안을 제공합니다.
          </p>
        </div>
      </section>

      {/* 하단 안내/푸터 비슷하게 */}
      <footer
        style={{
          borderTop: "1px solid #eee",
          paddingTop: "24px",
          fontSize: "12px",
          color: "#888",
          lineHeight: 1.6,
        }}
      >
        <p>고객센터 1588-0000 &nbsp; | &nbsp;상담시간: 24시간 챗봇상담 가능</p>
        <p>
          차량 구매 및 금융 상품은 각 제휴사 약관에 따르며, 실제 조건은
          상담 시 다시 한 번 안내해 드립니다.
        </p>
      </footer>
    </div>
  );
}
