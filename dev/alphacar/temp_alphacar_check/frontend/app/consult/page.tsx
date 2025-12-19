// app/consult/page.js
"use client";

import React, { CSSProperties, FormEvent } from "react";

export default function ConsultPage() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    alert("상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다.");
    form.reset();
  };

  return (
    <div style={{ maxWidth: "960px", margin: "36px auto 80px", padding: "0 16px" }}>
      {/* 헤더 */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h1 style={{ fontSize: "30px", fontWeight: 800, margin: "0 0 10px" }}>1:1 상담신청</h1>
        <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.6, margin: 0 }}>
          차량 구매에 대한 궁금한 점을 전문 상담사가 친절하게 안내해드립니다.<br />
          빠르고 정확한 맞춤 상담을 받아보세요!
        </p>
      </div>

      {/* 특징 배너 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {[
          { title: "빠른 응답", desc: "24시간 이내 연락" },
          { title: "전문 상담", desc: "10년 경력 컨설턴트" },
          { title: "특별 혜택", desc: "상담 고객 전용 할인" },
        ].map((item) => (
          <div
            key={item.title}
            style={{
              textAlign: "center",
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#111", marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: "13px", color: "#666" }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* 폼 */}
      <form
        onSubmit={handleSubmit}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: "18px",
          background: "#ffffff",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "12px 16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        }}
      >
        {fieldRow("이름", true, <input required name="name" placeholder="홍길동" style={inputStyle} />)}
        {fieldRow("연락처", true, (
          <input
            required
            name="phone"
            placeholder="010-1234-5678"
            style={inputStyle}
            pattern="^[0-9\\-]{9,15}$"
          />
        ))}
        {fieldRow("이메일", false, <input name="email" placeholder="example@email.com" style={inputStyle} type="email" />)}
        {fieldRow("관심 차종", false, (
          <select name="model" style={inputStyle}>
            <option value="">선택해주세요</option>
            <option value="sedan">세단</option>
            <option value="suv">SUV</option>
            <option value="ev">전기차</option>
            <option value="hybrid">하이브리드</option>
            <option value="other">기타</option>
          </select>
        ))}
        {fieldRow("예산", false, (
          <select name="budget" style={inputStyle}>
            <option value="">선택해주세요</option>
            <option value="30미만">3천만 원 미만</option>
            <option value="30-40">3천 ~ 4천만 원</option>
            <option value="40-50">4천 ~ 5천만 원</option>
            <option value="50이상">5천만 원 이상</option>
          </select>
        ))}
        {fieldRow("상담 유형", false, (
          <select name="type" style={inputStyle}>
            <option value="">선택해주세요</option>
            <option>구매 상담</option>
            <option>트림/옵션 추천</option>
            <option>기타 문의</option>
          </select>
        ))}
        {fieldRow("희망 상담 날짜", false, <input name="date" type="date" style={inputStyle} />)}
        {fieldRow("희망 상담 시간", false, (
          <select name="time" style={inputStyle}>
            <option value="">선택해주세요</option>
            <option>09:00 ~ 11:00</option>
            <option>11:00 ~ 13:00</option>
            <option>13:00 ~ 15:00</option>
            <option>15:00 ~ 17:00</option>
            <option>17:00 ~ 19:00</option>
          </select>
        ))}

        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle}>상담 내용</label>
          <textarea
            name="message"
            required
            placeholder="궁금하신 내용을 자세히 적어주세요. (최대 500자)"
            rows={5}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            maxLength={500}
          />
          <div style={{ fontSize: 11, color: "#888", textAlign: "right" }}>최대 500자</div>
        </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#444" }}>
            <input required type="checkbox" />
            개인정보 수집 및 이용에 동의합니다. (<span style={{ color: "#d93025" }}>필수</span>)
          </label>
          <div
            style={{
              background: "#f8fbff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 12,
              color: "#666",
              lineHeight: 1.5,
            }}
          >
            수집된 정보는 상담 목적에만 사용되며, 상담 종료 후 안전하게 파기됩니다.
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", marginTop: 4 }}>
          <button
            type="submit"
            style={{
              width: "100%",
              maxWidth: 360,
              height: 46,
              border: "none",
              borderRadius: 12,
              background: "linear-gradient(90deg, #0f62fe 0%, #2b82ff 100%)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 12px 20px rgba(15,98,254,0.2)",
            }}
          >
            상담 신청하기
          </button>
        </div>
      </form>
    </div>
  );
}

function fieldRow(label, required, control) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: "#d93025", marginLeft: 4 }}>*</span>}
      </label>
      {control}
    </div>
  );
}

const labelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#333",
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 42,
  borderRadius: 10,
  border: "1px solid #d9d9d9",
  padding: "0 12px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  backgroundColor: "#fff",
};
