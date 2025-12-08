// app/quote/compare/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

// 백엔드 API 주소
const API_BASE = "/api";

// [유틸] 견고한 HTTP 응답 처리
const handleApiResponse = async (res) => {
  if (!res.ok) {
    let errorData = {};
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { message: res.statusText || '서버 응답 오류', status: res.status };
    }
    throw new Error(errorData.message || `API 요청 실패 (Status: ${res.status})`);
  }
  return res.json();
};

// ---------------- [1] 공통 컴포넌트: 차량 선택 박스 ----------------
function CarSelector({ title, onSelectComplete, onReset, resetSignal }) {
  const [makerId, setMakerId] = useState("");
  const [modelId, setModelId] = useState("");
  const [baseTrimId, setBaseTrimId] = useState("");
  const [trimId, setTrimId] = useState("");

  const [makers, setMakers] = useState([]);
  const [models, setModels] = useState([]);
  const [baseTrims, setBaseTrims] = useState([]);
  const [trims, setTrims] = useState([]);

  const [trimName, setTrimName] = useState("");

  // 1. 초기 로딩
  useEffect(() => {
    fetch(`${API_BASE}/vehicles/makers`)
      .then(handleApiResponse)
      .then((data) => {
        if (Array.isArray(data)) setMakers(data);
      })
      .catch((err) => {
        console.error("제조사 로딩 실패:", err);
        setMakers([]);
      });
  }, []);

  // 2. 초기화 신호
  useEffect(() => {
    handleReset();
  }, [resetSignal]);

  const handleReset = () => {
    setMakerId(""); setModelId(""); setBaseTrimId(""); setTrimId("");
    setTrimName("");
    setModels([]); setBaseTrims([]); setTrims([]);
    if (onReset) onReset();
  };

  // 3. 핸들러들
  const handleMakerChange = (e) => {
    const newMakerId = e.target.value;
    setMakerId(newMakerId);
    setModelId(""); setBaseTrimId(""); setTrimId(""); setTrimName("");
    setModels([]); setBaseTrims([]); setTrims([]);

    if (!newMakerId) return;

    fetch(`${API_BASE}/vehicles/models?makerId=${encodeURIComponent(newMakerId)}`)
      .then(handleApiResponse)
      .then((data) => {
        if (Array.isArray(data)) {
          const uniqueModels = Array.from(new Map(data.map(m => [m.model_name, m])).values());
          setModels(uniqueModels);
          // 차종이 하나만 있으면 자동 선택
          if (uniqueModels.length === 1) {
            const singleModel = uniqueModels[0];
            setModelId(singleModel._id);
            // 자동으로 기본 트림 로드
            fetch(`${API_BASE}/vehicles/base-trims?modelId=${singleModel._id}`)
              .then(handleApiResponse)
              .then((baseTrimData) => {
                if (Array.isArray(baseTrimData)) {
                  setBaseTrims(baseTrimData);
                  if (baseTrimData.length === 1) {
                    setBaseTrimId(baseTrimData[0]._id || baseTrimData[0].id);
                    // 자동으로 세부 트림 로드
                    fetch(`${API_BASE}/vehicles/trims?modelId=${singleModel._id}`)
                      .then(handleApiResponse)
                      .then((trimData) => {
                        if (Array.isArray(trimData)) {
                          setTrims(trimData);
                          // 세부 트림이 하나만 있으면 자동 선택
                          if (trimData.length === 1) {
                            const singleTrim = trimData[0];
                            const trimVal = singleTrim._id || singleTrim.trim_name || singleTrim.name;
                            setTrimId(trimVal);
                            setTrimName(singleTrim.name || singleTrim.trim_name);
                          }
                        } else setTrims([]);
                      })
                      .catch((err) => console.error("세부 트림 로딩 실패:", err));
                  }
                } else setBaseTrims([]);
              })
              .catch((err) => console.error("기본 트림 로딩 실패:", err));
          }
        } else setModels([]);
      })
      .catch((err) => console.error("모델 로딩 실패:", err));
  };

  const handleModelChange = (e) => {
    const newModelId = e.target.value;
    setModelId(newModelId);
    setBaseTrimId(""); setTrimId(""); setTrimName("");
    setBaseTrims([]); setTrims([]);

    if (!newModelId) return;

    fetch(`${API_BASE}/vehicles/base-trims?modelId=${newModelId}`)
      .then(handleApiResponse)
      .then((data) => {
        if (Array.isArray(data)) {
          setBaseTrims(data);
          // 기본 트림이 하나만 있으면 자동 선택
          if (data.length === 1) {
            setBaseTrimId(data[0]._id || data[0].id);
            // 자동으로 세부 트림도 로드
            fetch(`${API_BASE}/vehicles/trims?modelId=${newModelId}`)
              .then(handleApiResponse)
              .then((trimData) => {
                if (Array.isArray(trimData)) {
                  setTrims(trimData);
                  // 세부 트림이 하나만 있으면 자동 선택
                  if (trimData.length === 1) {
                    const singleTrim = trimData[0];
                    const trimVal = singleTrim._id || singleTrim.trim_name || singleTrim.name;
                    setTrimId(trimVal);
                    setTrimName(singleTrim.name || singleTrim.trim_name);
                  }
                } else setTrims([]);
              })
              .catch((err) => console.error("세부 트림 로딩 실패:", err));
          }
        } else setBaseTrims([]);
      })
      .catch((err) => console.error("기본 트림 로딩 실패:", err));
  };

  const handleBaseTrimChange = (e) => {
    const newBaseTrimId = e.target.value;
    setBaseTrimId(newBaseTrimId);
    setTrimId(""); setTrimName("");
    setTrims([]);

    if (!newBaseTrimId || !modelId) return;

    // 기본 트림 선택 후 세부 트림 목록 가져오기
    fetch(`${API_BASE}/vehicles/trims?modelId=${modelId}`)
      .then(handleApiResponse)
      .then((data) => {
        if (Array.isArray(data)) {
          setTrims(data);
          // 세부 트림이 하나만 있으면 자동 선택
          if (data.length === 1) {
            const singleTrim = data[0];
            const trimVal = singleTrim._id || singleTrim.trim_name || singleTrim.name;
            setTrimId(trimVal);
            setTrimName(singleTrim.name || singleTrim.trim_name);
          }
        } else setTrims([]);
      })
      .catch((err) => console.error("세부 트림 로딩 실패:", err));
  };

  const handleTrimChange = (e) => {
    const newTrimId = e.target.value;
    const index = e.target.selectedIndex;
    setTrimId(newTrimId);
    if (index >= 0) setTrimName(e.target.options[index].text);
  };

  const handleCompleteClick = () => {
    if (!trimId) {
      alert("세부트림까지 모두 선택해주세요.");
      return;
    }
    if (onSelectComplete) {
      // "Reserve A/T:1" 형식에서 실제 트림 이름만 추출 (":숫자" 제거)
      const trimNameOnly = trimId.split(':')[0].trim();
      onSelectComplete(trimNameOnly);
    }
  };

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px 28px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#1e293b" }}>{title}</div>
      <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>제조사 → 차종 → 기본트림 → 세부트림 순서로 선택</div>

      {/* 내부 요소도 반응형 그리드 (4단계 필터링을 항상 4열로 표시) */}
      <div className="filter-grid">
        
        <div style={{ minWidth: 0 }}>
          <div style={labelStyle}>제조사</div>
          <select size={8} value={makerId || ""} onChange={handleMakerChange} style={selectStyle}>
            <option value="" disabled style={{ color: "#ccc" }}>- 선택 -</option>
            {makers.length === 0 && <option disabled>로딩중...</option>}
            {makers.map((m, idx) => (
              <option key={m._id || `m-${idx}`} value={m._id || m.name}>{m.name}</option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={labelStyle}>차종</div>
          <select size={8} value={modelId || ""} onChange={handleModelChange} style={selectStyle}>
            <option value="" disabled style={{ color: "#ccc" }}>{makerId ? "- 선택 -" : "-"}</option>
            {models.length === 0 ? (
               <option value="" disabled style={{ color: "#ccc" }}>{makerId ? "없음" : "-"}</option>
            ) : (
               models.map((m, idx) => (
                 <option key={m._id || `mo-${idx}`} value={m._id}>{m.model_name}</option>
               ))
            )}
          </select>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={labelStyle}>기본트림</div>
          <select size={8} value={baseTrimId || ""} onChange={handleBaseTrimChange} style={selectStyle}>
            <option value="" disabled style={{ color: "#ccc" }}>{modelId ? "- 선택 -" : "-"}</option>
             {baseTrims.length === 0 ? (
               <option value="" disabled style={{ color: "#ccc" }}>{modelId ? "없음" : "-"}</option>
            ) : (
               baseTrims.map((t, idx) => (
                 <option key={t._id || `base-${idx}`} value={t._id || t.name}>{t.name || t.base_trim_name}</option>
               ))
            )}
          </select>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={labelStyle}>세부트림</div>
          <select size={8} value={trimId || ""} onChange={handleTrimChange} style={selectStyle}>
            <option value="" disabled style={{ color: "#ccc" }}>{baseTrimId ? "- 선택 -" : "-"}</option>
             {trims.length === 0 ? (
               <option value="" disabled style={{ color: "#ccc" }}>{baseTrimId ? "없음" : "-"}</option>
            ) : (
               trims.map((t, idx) => {
                 const uniqueKey = t._id ? t._id : `trim-${idx}`;
                 const val = t._id || t.trim_name || t.name; 
                 return <option key={uniqueKey} value={val}>{t.name || t.trim_name}</option>;
               })
            )}
          </select>
        </div>
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ fontSize: "13px", color: "#333", backgroundColor: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          선택: <span style={{ fontWeight: 600, color: "#2563eb" }}>{trimName || "-"}</span>
        </div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button onClick={handleReset} style={btnResetStyle}>초기화</button>
          <button onClick={handleCompleteClick} style={btnSearchStyle}>선택 완료</button>
        </div>
       
      </div>
    </div>
  );
}

// ---------------- [2] 하단 컴포넌트: 옵션 카드 ----------------
function CarOptionSelectCard({ data, selectedSet, onToggle }) {
  // base_price가 없으면 price를 사용하거나 0으로 설정 (병합된 데이터 사용)
  const basePrice = data.base_price || data.price || 0;
  
  const optionsTotal = (data.options || []).reduce((sum, opt, idx) => {
    const id = opt._id || `opt-${idx}`;
    // price와 option_price 중 존재하는 값을 사용
    const price = opt.price || opt.option_price || 0;
    if (selectedSet.has(id)) {
      return sum + price;
    }
    return sum;
  }, 0);
  
  const finalPrice = basePrice + optionsTotal;

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px 28px 20px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", minHeight: "450px" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ width: "100%", height: "140px", marginBottom: "16px", borderRadius: "12px", backgroundColor: data.image_url ? "transparent" : "#f3f3f3", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {data.image_url || data.main_image ? ( // main_image 필드도 확인
            <img src={data.image_url || data.main_image} alt={data.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          ) : (
            <span style={{ color: "#aaa", fontSize: "13px" }}>이미지 준비중</span>
          )}
        </div>
        <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>{data.manufacturer || data.brand_name} {data.model_name || data.vehicle_name}</div>
        <div style={{ fontSize: "20px", fontWeight: 800, color: "#111" }}>{data.name || data.trim_name}</div>
      </div>

      <div style={{ backgroundColor: "#f8f9fa", borderRadius: "12px", padding: "14px 18px", fontSize: "14px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#555" }}>기본 차량가</span>
        <span style={{ fontWeight: 700, color: "#333" }}>{basePrice.toLocaleString()}원</span>
      </div>

      <div style={{ flex: 1, marginBottom: "20px", minHeight: "100px" }}>
        <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "8px", borderBottom: "2px solid #eee", paddingBottom: "6px" }}>
            옵션 선택 ({data.options?.length || 0})
        </div>
        <div style={{ maxHeight: "120px", overflowY: "auto", paddingRight: "4px" }}>
          {(!data.options || data.options.length === 0) && (
            <div style={{ padding: "12px", textAlign: "center", color: "#999", fontSize: "12px" }}>선택 가능한 옵션이 없습니다.</div>
          )}
          {(data.options || []).map((opt, idx) => {
            const safeId = opt._id || `opt-${idx}`;
            const isChecked = selectedSet.has(safeId);
            const price = opt.price || opt.option_price || 0;
            return (
              <label
                key={safeId}
                style={{
                  display: "flex", alignItems: "center", padding: "6px 10px", marginBottom: "4px", borderRadius: "6px",
                  cursor: "pointer", transition: "all 0.2s",
                  backgroundColor: isChecked ? "#eff6ff" : "#fff",
                  border: isChecked ? "1px solid #bfdbfe" : "1px solid #eee"
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(safeId)}
                  style={{ marginRight: "10px", width: "14px", height: "14px", accentColor: "#2563eb", cursor: "pointer" }}
                />
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", fontWeight: isChecked ? 600 : 400 }}>{opt.name || opt.option_name}</div>
                </div>
                <span style={{ fontSize: "11px", color: isChecked ? "#1d4ed8" : "#666", fontWeight: isChecked ? 700 : 400 }}>
                    +{price.toLocaleString()}원
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ backgroundColor: "#111", color: "#fff", borderRadius: "12px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
        <span style={{ fontSize: "14px", opacity: 0.9 }}>최종 견적가</span>
        <span style={{ fontSize: "18px", fontWeight: 700, color: "#fbbf24" }}>{finalPrice.toLocaleString()}원</span>
      </div>
    </div>
  );
}

// ---------------- [3] 메인 페이지 ----------------
export default function CompareQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [car1Data, setCar1Data] = useState(null);
  const [car2Data, setCar2Data] = useState(null);

  const [car1Opts, setCar1Opts] = useState(new Set());
  const [car2Opts, setCar2Opts] = useState(new Set());

  const [resetSignal, setResetSignal] = useState(0);

  // ✅ [수정됨] 데이터 추출 및 병합 로직을 포함한 fetch 함수
  const fetchCarDetail = async (trimId) => {
    try {
      const res = await fetch(`${API_BASE}/vehicles/detail?trimId=${trimId}`);
      if (!res.ok) {
          let errorMsg = `조회 실패 (${res.status})`;
          try {
              const errJson = await res.json();
              if (errJson.message) errorMsg = errJson.message;
          } catch(e) {}
          throw new Error(errorMsg);
      }
     
      const rawVehicleData = await res.json();

      // 1. 선택된 트림 찾기
      let selectedTrim = null;
      const trims = rawVehicleData.trims || [];

      if (trims.length > 0) {
          const decodedTrimId = decodeURIComponent(trimId);
          // "Reserve A/T:1" 형식에서 실제 트림 이름만 추출 (":숫자" 제거)
          const trimNameOnly = decodedTrimId.split(':')[0].trim();
          
          // A. 이름으로 정확히 일치하는 트림 찾기 (String ID 대응)
          selectedTrim = trims.find(t => t.trim_name === trimNameOnly || t.trim_name === decodedTrimId);

          // B. ID로 찾기 (ObjectId 대응)
          if (!selectedTrim) {
              selectedTrim = trims.find(t => t._id === trimId || t.trim_id === trimId);
          }

          // C. Fallback: 여전히 못 찾았다면 첫 번째 트림을 기본값으로 사용
          if (!selectedTrim) {
              selectedTrim = trims[0];
          }
      }
     
      if (!selectedTrim) {
          console.warn("트림 데이터가 없어 차량을 표시할 수 없습니다.");
          throw new Error("선택된 트림 정보를 찾을 수 없습니다.");
      }

      // 2. Vehicle + Trim 데이터 병합 (Card 컴포넌트가 기대하는 flat 구조 생성)
      const mergedData = {
          ...rawVehicleData, // 상위 정보 (vehicle_name, brand_name, _id, etc.)
          name: selectedTrim.trim_name, // ✅ 트림명
          base_price: selectedTrim.price, // ✅ 트림 가격
          options: selectedTrim.options || [], // ✅ 옵션 배열
          image_url: rawVehicleData.main_image || rawVehicleData.image_url, // 이미지 URL 통합
      };
     
      return mergedData;

    } catch (err) {
      console.error(err);
      alert(`차량 정보를 불러오는데 실패했습니다.\n사유: ${err.message}`);
      return null;
    }
  };

  useEffect(() => {
    const car1_trimId = searchParams.get("car1_trimId");
    if (car1_trimId) {
      fetchCarDetail(car1_trimId).then((data) => {
        if (data) setCar1Data(data);
      });
    }
  }, [searchParams]);

  const handleSelect1 = async (trimId) => {
    const data = await fetchCarDetail(trimId);
    if (data) {
      setCar1Data(data);
      setCar1Opts(new Set());
    }
  };

  const handleSelect2 = async (trimId) => {
    const data = await fetchCarDetail(trimId);
    if (data) {
      setCar2Data(data);
      setCar2Opts(new Set());
    }
  };

  const handleResetAll = () => {
    setCar1Data(null); setCar2Data(null);
    setCar1Opts(new Set()); setCar2Opts(new Set());
    setResetSignal(s => s + 1);
  };

  const toggleCar1Opt = (id) => {
    const newSet = new Set(car1Opts);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setCar1Opts(newSet);
  };

  const toggleCar2Opt = (id) => {
    const newSet = new Set(car2Opts);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setCar2Opts(newSet);
  };

  const handleViewResult = () => {
    if (!car1Data || !car2Data) {
      alert("두 대의 차량을 모두 선택해야 비교가 가능합니다.");
      return;
    }

    const id1 = car1Data._id || car1Data.id;
    const id2 = car2Data._id || car2Data.id;

    if (!id1 || !id2) {
        alert("차량 ID를 식별할 수 없습니다. 다시 선택해주세요.");
        return;
    }

    const ids = `${id1},${id2}`;
    const opts1 = Array.from(car1Opts).join(",");
    const opts2 = Array.from(car2Opts).join(",");
    router.push(`/quote/compare/vs?ids=${ids}&opts1=${opts1}&opts2=${opts2}`);
  };

  return (
    <main style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 5% 80px" }}>
        
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1e293b", margin: 0 }}>비교견적</h1>
                <p style={{ fontSize: "15px", color: "#64748b", marginTop: "4px" }}>두 차량을 가로로 나란히 비교해보세요.</p>
            </div>
            <button onClick={handleResetAll} style={btnResetStyle}>전체 초기화</button>
        </div>

        {/* ✅ [UI 수정 1] 상단: 차량 선택 박스 2개 가로 배치 (항상 2열 고정) */}
        <div className="car-selector-grid">
            <CarSelector title="차량 1 선택" onSelectComplete={handleSelect1} onReset={() => setCar1Data(null)} resetSignal={resetSignal} />
            <CarSelector title="차량 2 선택" onSelectComplete={handleSelect2} onReset={() => setCar2Data(null)} resetSignal={resetSignal} />
        </div>

        {/* ✅ [UI 수정 2] 하단: 결과 박스 2개 가로 배치 (선택 시 등장) */}
        {(car1Data || car2Data) && (
            <div style={{ animation: "fadeIn 0.4s ease-out", borderTop: "2px dashed #e2e8f0", paddingTop: "40px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#333", marginBottom: "20px", textAlign: "center" }}>
                    선택된 차량 정보 및 옵션
                </h2>
                
                <div className="car-result-grid">
                    {/* 데이터가 없으면 빈 칸을 둬서 레이아웃 유지 */}
                    {car1Data ? <CarOptionSelectCard data={car1Data} selectedSet={car1Opts} onToggle={toggleCar1Opt} /> : <div className="empty-car-card">차량 1을 선택해주세요</div>}
                    
                    {car2Data ? <CarOptionSelectCard data={car2Data} selectedSet={car2Opts} onToggle={toggleCar2Opt} /> : <div className="empty-car-card">차량 2를 선택해주세요</div>}
                </div>

                {car1Data && car2Data && (
                    <div style={{ marginTop: "40px", textAlign: "center" }}>
                        <button onClick={handleViewResult} style={btnResultStyle}>
                            상세 비교 결과 보기 →
                        </button>
                    </div>
                )}
            </div>
        )}

      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .car-selector-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }
        @media (max-width: 768px) {
          .car-selector-grid {
            grid-template-columns: 1fr;
          }
        }
        .filter-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        @media (max-width: 1024px) {
          .filter-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .car-result-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .car-result-grid {
            grid-template-columns: 1fr;
          }
        }
        .empty-car-card {
          border: 2px dashed #eee;
          border-radius: 16px;
          min-height: 450px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ccc;
          background-color: #fff;
        }
      `}</style>
    </main>
  );
}

// 스타일
const selectStyle = { width: "100%", height: "180px", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "8px", fontSize: "14px", outline: "none", color: "#333" };
const labelStyle = { fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "6px" };
const btnResetStyle = { padding: "10px 18px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#fff", color: "#64748b", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "0.2s" };
const btnSearchStyle = { padding: "8px 20px", borderRadius: "8px", border: "none", backgroundColor: "#2563eb", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "0.2s" };
const btnResultStyle = { padding: "18px 50px", borderRadius: "99px", border: "none", backgroundColor: "#0f172a", color: "#fff", fontSize: "18px", fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 25px rgba(15, 23, 42, 0.2)", transition: "transform 0.2s" };

