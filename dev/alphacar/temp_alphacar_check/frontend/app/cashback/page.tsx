"use client";

// [수정] useState, useEffect와 함께 CSSProperties를 import 합니다.
import { useEffect, useState, CSSProperties } from "react"; 

export default function CashbackPage() {
  // [추가] 오늘 날짜를 저장할 상태 변수 (초기값은 빈 문자열)
  const [todayStr, setTodayStr] = useState("");

  // [추가] 컴포넌트가 로드될 때 오늘 날짜 계산
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    setTodayStr(`${year}-${month}-${day}`);
  }, []);

  return (
    <div className="page-wrapper">
      {/* 본문 */}
      <main
        style={{
          maxWidth: "1100px",
          margin: "40px auto",
          padding: "0 20px 60px",
        }}
      >
        {/* 상단 타이틀 영역 */}
        <section
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {/* 파란 헤더 영역 */}
          <div
            style={{
              background:
                "linear-gradient(135deg, #0070f3 0%, #0057c2 100%)",
              padding: "26px 30px 22px",
              color: "#fff",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "left",
              }}
            >
              ALPHACAR
            </div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                margin: "6px 0 4px",
              }}
            >
              최대 <span style={{ color: "#ffd84d" }}>1.8%</span> 현금캐시백!
            </h1>

            {/* [수정] 날짜가 자동으로 표시되는 부분 */}
            <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
              {todayStr || "로딩 중..."} 기준
            </p>
          </div>

          {/* 카드별 표 영역 */}
          <div style={{ padding: "24px 26px 26px" }}>
            {/* A 카드 + T 카드 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "18px",
                marginBottom: "18px",
              }}
            >
              {/* A 카드 */}
              <CardTable
                color="#0070f3"
                label="A 카드"
                rows={[
                  {
                    amount: "1,000만원 이상",
                    cardsa: "1.20%",
                    extra: "0.10%",
                    benefit: "1.30%",
                  },
                ]}
              />

              {/* T 카드 */}
              <CardTable
                color="#f15bb5"
                label="T 카드"
                rows={[
                  {
                    amount: "1,000만원 이상",
                    cardsa: "0.90%",
                    extra: "0.60%",
                    benefit: "1.50%",
                  },
                  {
                    amount: "2,000만원 이상",
                    cardsa: "0.90%",
                    extra: "0.70%",
                    benefit: "1.60%",
                  },
                  {
                    amount: "3,000만원 이상",
                    cardsa: "0.90%",
                    extra: "0.80%",
                    benefit: "1.70%",
                  },
                  {
                    amount: "5,000만원 이상",
                    cardsa: "0.90%",
                    extra: "0.90%",
                    benefit: "1.80%",
                  },
                ]}
              />
            </div>

            {/* H 카드 + W 카드 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "18px",
                marginBottom: "18px",
              }}
            >
              {/* H 카드 */}
              <CardTable
                color="#00a884"
                label="H 카드"
                rows={[
                  {
                    amount: "1,000만원 이상",
                    cardsa: "1.10%",
                    extra: "0.30%",
                    benefit: "1.40%",
                  },
                ]}
              />

              {/* W 카드 */}
              <CardTable
                color="#0057c2"
                label="W 카드"
                rows={[
                  {
                    amount: "1,000만원 이상",
                    cardsa: "1.30%",
                    extra: "0.40%",
                    benefit: "1.70%",
                  },
                ]}
              />
            </div>

            {/* B 카드 단독 */}
            <div style={{ maxWidth: "460px" }}>
              <CardTable
                color="#555555"
                label="B 카드"
                rows={[
                  {
                    amount: "1,000만원 이상",
                    cardsa: "0.70%",
                    extra: "0.40%",
                    benefit: "1.10%",
                  },
                ]}
              />
            </div>

            {/* 하단 유의사항 */}
            <ul
              style={{
                marginTop: "18px",
                paddingLeft: "18px",
                fontSize: "12px",
                color: "#666",
                lineHeight: 1.6,
              }}
            >
              <li>
                카드사 캐시백, 추가 캐시백은 자동이체결제 건만 지급됩니다. (우리카드
                제외)
              </li>
              <li>
                카드사 및 카드 혜택 변경기간 전 카드 해지 시 오토캐시백은
                불가합니다.
              </li>
              <li>
                오토캐시백은 신용카드 혜택과 중복 적용 불가합니다.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * 개별 카드 박스 컴포넌트
 * [수정] tdStyle, thStyle에도 CSSProperties 타입을 명시적으로 지정
 */
function CardTable({ color, label, rows }: { color: string, label: string, rows: { amount: string, cardsa: string, extra: string, benefit: string }[] }) {
    // [수정] thStyle과 tdStyle을 함수 내로 이동시키고 CSSProperties 타입 지정
    const thStyle: CSSProperties = {
        padding: "6px 4px",
        borderRight: "1px solid rgba(255,255,255,0.35)",
        fontWeight: 600,
    };

    const tdStyle: CSSProperties = {
        padding: "6px 6px",
        textAlign: "center",
        borderTop: "1px solid #eee",
    };
    
  return (
    <div
      style={{
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #e3e3e3",
        background: "#fafafa",
      }}
    >
      {/* 제목 줄 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          borderBottom: "1px solid #e3e3e3",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: color,
            color: "#fff",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
          }}
        >
          {label.charAt(0)}
        </div>
        <span style={{ fontSize: "13px", fontWeight: 600 }}>{label}</span>
      </div>

      {/* 헤더 + 데이터 테이블 */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "12px",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: color,
              color: "#fff",
            }}
          >
            <th style={thStyle}>결제금액</th>
            <th style={thStyle}>카드사</th>
            <th style={thStyle}>카드</th>
            <th style={thStyle}>혜택</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              style={{
                backgroundColor: idx % 2 === 0 ? "#fdfdfd" : "#f5f7fa",
              }}
            >
              <td style={tdStyle}>{row.amount}</td>
              <td style={tdStyle}>{row.cardsa}</td>
              <td style={tdStyle}>{row.extra}</td>
              <td style={tdStyle}>{row.benefit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
