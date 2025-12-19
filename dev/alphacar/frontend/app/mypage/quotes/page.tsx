"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import jsPDF from "jspdf";

// ✅ 타입 정의
interface OptionDetail {
  name: string;
  price: number;
}

interface CarInfo {
  manufacturer: string;
  model: string;
  trim: string;
  price: number; // 차량 기본가
  image: string;
  options: (string | OptionDetail)[];
  specs?: Record<string, any>;
  engine?: string;
  power?: string;
  fuel?: string;
  [key: string]: any;
}

interface QuoteData {
  _id: string;
  type: string;
  createdAt: string;
  totalPrice: number; // 전체 견적 합계
  cars: CarInfo[];
}

const API_BASE = "/api";

function MyPageQuotesContent() {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const savedFlag = localStorage.getItem("quote_saved");
    if (savedFlag === "1") {
      setToastMessage("견적함에 저장되었습니다.");
      localStorage.removeItem("quote_saved");
      setTimeout(() => setToastMessage(""), 2500);
    }

    const userSocialId = localStorage.getItem("user_social_id");
    if (!userSocialId) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/estimate/list?userId=${userSocialId}`)
      .then((res) => res.json())
      .then((data) => {
        setQuotes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("견적 로딩 실패:", err);
        setLoading(false);
      });
  }, []);

  // ✅ 폰트 로드 (public/fonts/NanumGothic.ttf 필요)
  const loadFont = async (): Promise<string | null> => {
    try {
      const response = await fetch("/fonts/NanumGothic.ttf");
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      return btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""));
    } catch { return null; }
  };

  // ✅ [핵심] 고퀄리티 PDF 생성 로직 (가격 가독성 및 상세 제원)
  const handleDownloadPDF = async (quote: QuoteData) => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const fontData = await loadFont();

      if (fontData) {
        doc.addFileToVFS("NanumGothic.ttf", fontData);
        doc.addFont("NanumGothic.ttf", "NanumGothic", "normal");
        doc.addFont("NanumGothic.ttf", "NanumGothic", "bold");
        doc.setFont("NanumGothic", "normal");
      }

      let currentY = 25;
      const marginX = 20;
      const pageWidth = 210;

      const checkPageBreak = (neededHeight: number) => {
        if (currentY + neededHeight > 275) {
          doc.addPage();
          currentY = 25;
          return true;
        }
        return false;
      };

      // 1. 헤더
      doc.setFontSize(24);
      doc.setTextColor(0, 82, 255);
      doc.setFont("NanumGothic", "bold");
      doc.text("ALPHACAR PREMIUM QUOTE REPORT", marginX, currentY);
      currentY += 10;
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.setFont("NanumGothic", "normal");
      doc.text(`발행일: ${new Date().toLocaleDateString()} | 견적 번호: ${quote._id}`, marginX, currentY);
      currentY += 5;
      doc.setDrawColor(0, 82, 255);
      doc.setLineWidth(1);
      doc.line(marginX, currentY, 190, currentY);
      currentY += 15;

      for (const car of quote.cars) {
        // 상세 데이터가 없을 경우를 대비해 실시간 Fetch 시도 (Specs 확보용)
        let fullSpecs = car.specs || {};
        try {
          const res = await fetch(`${API_BASE}/vehicles/detail?trimId=${encodeURIComponent(car.trim)}`);
          const detail = await res.json();
          if (detail?.selectedTrimSpecs) fullSpecs = detail.selectedTrimSpecs;
        } catch (e) { console.warn("Detail Specs fetch failed"); }

        // 2. 차량 타이틀 및 기본가
        doc.setFontSize(22);
        doc.setTextColor(0);
        doc.setFont("NanumGothic", "bold");
        doc.text(`${car.manufacturer} ${car.model}`, marginX, currentY);
        currentY += 10;
        doc.setFontSize(14);
        doc.setFont("NanumGothic", "normal");
        doc.setTextColor(80);
        doc.text(`선택 트림: ${car.trim}`, marginX, currentY);
        currentY += 12;

        doc.setFillColor(245, 247, 255);
        doc.rect(marginX, currentY - 5, 170, 12, "F");
        doc.setFontSize(13);
        doc.setTextColor(0, 82, 255);
        doc.setFont("NanumGothic", "bold");
        doc.text("차량 기본 가격", marginX + 5, currentY + 3);
        doc.text(`${car.price.toLocaleString()}원`, 185, currentY + 3, { align: "right" });
        currentY += 18;

        // 3. 선택 옵션 리스트 (개별 가격 명시)
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.setFont("NanumGothic", "bold");
        doc.text("■ 선택 옵션 상세 내역", marginX, currentY);
        currentY += 10;
        
        let optionSum = 0;
        if (car.options && car.options.length > 0) {
          car.options.forEach((opt: any) => {
            const name = typeof opt === 'string' ? opt : opt.name;
            const price = typeof opt === 'string' ? 0 : (opt.price || 0);
            optionSum += price;

            const optText = `• ${name}`;
            const priceText = price > 0 ? `+${price.toLocaleString()}원` : "기본포함";
            
            checkPageBreak(8);
            doc.setFontSize(11);
            doc.setTextColor(60);
            doc.setFont("NanumGothic", "normal");
            doc.text(optText, marginX + 5, currentY);
            doc.text(priceText, 185, currentY, { align: "right" });
            currentY += 8;
          });
        } else {
          doc.setFontSize(11);
          doc.setTextColor(150);
          doc.text("• 선택된 추가 옵션이 없습니다.", marginX + 5, currentY);
          currentY += 8;
        }

        // 해당 차량 합계
        currentY += 5;
        doc.setDrawColor(230);
        doc.line(marginX + 5, currentY, 185, currentY);
        currentY += 8;
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.setFont("NanumGothic", "bold");
        doc.text(`${car.model} 견적 합계`, marginX + 5, currentY);
        doc.text(`${(car.price + optionSum).toLocaleString()}원`, 185, currentY, { align: "right" });
        currentY += 20;

        // 4. 상세 제원 정보 (2열 그리드 + 자동 줄바꿈)
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.text("■ 차량 상세 제원 정보", marginX, currentY);
        currentY += 10;

        const specMap = {
          "엔진형식": car.engine || fullSpecs["엔진형식"] || "정보 없음",
          "최고출력": car.power || fullSpecs["최고출력"] || "정보 없음",
          "복합연비": car.fuel || fullSpecs["복합연비"] || "정보 없음",
          ...fullSpecs
        };

        const specEntries = Object.entries(specMap).filter(([k, v]) => v && String(v).trim() !== "" && k !== "_id");
        doc.setFontSize(9);
        
        for (let i = 0; i < specEntries.length; i += 2) {
          const item1 = specEntries[i];
          const item2 = specEntries[i+1];

          // 줄바꿈 대응 높이 계산
          const val1Lines = doc.splitTextToSize(String(item1[1]), 45);
          const val2Lines = item2 ? doc.splitTextToSize(String(item2[1]), 45) : [];
          const rowHeight = Math.max(val1Lines.length, val2Lines.length) * 5 + 5;

          checkPageBreak(rowHeight);
          doc.setFillColor(250, 250, 250);
          doc.rect(marginX, currentY - 5, 180, rowHeight, "F");

          // 1열
          doc.setTextColor(130);
          doc.setFont("NanumGothic", "normal");
          doc.text(item1[0], marginX + 3, currentY);
          doc.setTextColor(0);
          doc.setFont("NanumGothic", "bold");
          doc.text(val1Lines, marginX + 35, currentY);

          // 2열
          if (item2) {
            doc.setTextColor(130);
            doc.setFont("NanumGothic", "normal");
            doc.text(item2[0], marginX + 93, currentY);
            doc.setTextColor(0);
            doc.setFont("NanumGothic", "bold");
            doc.text(val2Lines, marginX + 125, currentY);
          }
          currentY += rowHeight;
        }
        
        currentY += 15;
        doc.setDrawColor(0, 82, 255);
        doc.setLineWidth(0.5);
        doc.line(marginX, currentY, 190, currentY);
        currentY += 20;
      }

      // 5. 최종 견적 합계 (푸터)
      checkPageBreak(30);
      currentY = 275;
      doc.setFontSize(22);
      doc.setTextColor(225, 29, 72);
      doc.setFont("NanumGothic", "bold");
      doc.text(`최종 견적 총액: ${quote.totalPrice.toLocaleString()}원`, 190, currentY, { align: "right" });

      doc.save(`Alphacar_Detailed_Quote_${quote._id.substring(0, 8)}.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF 생성 중 오류가 발생했습니다. 데이터를 확인해주세요.");
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    const res = await fetch(`${API_BASE}/estimate/${id}`, { method: "DELETE" });
    if (res.ok) setQuotes(prev => prev.filter(q => q._id !== id));
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>데이터 로드 중...</div>;

  return (
    <div style={{ maxWidth: "1100px", margin: "40px auto 80px", padding: "0 20px" }}>
      {toastMessage && (
        <div style={{ position: "fixed", bottom: "30px", left: "50%", transform: "translateX(-50%)", background: "#333", color: "#fff", padding: "12px 24px", borderRadius: "12px", zIndex: 9999 }}>
          {toastMessage}
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800 }}>견적함</h1>
        <p style={{ color: "#666" }}>저장한 차량의 상세 제원과 옵션 가격을 PDF 리포트로 확인하세요.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "35px" }}>
        {quotes.map((quote) => (
          <div key={quote._id} style={{ background: "#fff", borderRadius: "28px", padding: "35px", border: "1px solid #eee", boxShadow: "0 5px 25px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px" }}>
              <span style={{ fontWeight: 700, color: quote.type === "compare" ? "#0052FF" : "#111", background: "#f1f5f9", padding: "5px 15px", borderRadius: "8px", fontSize: "13px" }}>
                {quote.type === "compare" ? "비교 견적" : "개별 견적"}
              </span>
              <span style={{ color: "#aaa", fontSize: "13px" }}>{new Date(quote.createdAt).toLocaleDateString()} 저장</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: quote.type === "compare" ? "1fr 1fr" : "1fr", gap: "25px" }}>
              {quote.cars.map((car, idx) => (
                <div key={idx} style={{ display: "flex", gap: "20px", alignItems: "center", background: "#fafafa", padding: "20px", borderRadius: "20px" }}>
                  <img src={car.image} alt="" style={{ width: "130px", height: "80px", objectFit: "contain" }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "18px" }}>{car.model}</div>
                    <div style={{ fontSize: "14px", color: "#888" }}>{car.trim}</div>
                    <div style={{ fontSize: "17px", fontWeight: 700, color: "#0052FF", marginTop: "5px" }}>{car.price.toLocaleString()}원</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "30px", paddingTop: "25px", borderTop: "1px dashed #ccc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "15px" }}>
                <button onClick={() => handleDownloadPDF(quote)} style={{ padding: "12px 25px", borderRadius: "12px", background: "#0052FF", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>
                  전문 PDF 리포트 저장
                </button>
                <button onClick={() => handleDeleteQuote(quote._id)} style={{ padding: "12px 20px", borderRadius: "12px", background: "#fff", color: "#999", border: "1px solid #ddd", cursor: "pointer" }}>
                  삭제
                </button>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "14px", color: "#888", marginRight: "10px" }}>총 견적가 합계</span>
                <span style={{ fontSize: "26px", fontWeight: 900, color: "#e11d48" }}>{quote.totalPrice.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyPageQuotes() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <MyPageQuotesContent />
    </Suspense>
  );
}
