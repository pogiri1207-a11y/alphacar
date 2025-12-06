"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react"; // React 임포트 수정 (필요한 경우)

// 백엔드 API 주소 (3003번 포트 확인)
const API_BASE = "/api";

// ✅ [추가] 공통: 견고한 HTTP 응답 처리 헬퍼 함수 (이 코드가 상단에 정의되어 있어야 함)
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
  const [trimId, setTrimId] = useState("");

  const [makers, setMakers] = useState([]);
  const [models, setModels] = useState([]);
  const [trims, setTrims] = useState([]);

  const [makerName, setMakerName] = useState("");
  const [modelName, setModelName] = useState("");
  const [trimName, setTrimName] = useState("");

  // / 1. 초기 로딩 (제조사 목록)
  useEffect(() => {
    // ✅ 경로 일치 수정: /makers -> /vehicles/makers
    fetch(`${API_BASE}/vehicles/makers`)
      .then(handleApiResponse) // 견고한 응답 처리 적용
      .then((data) => {
        // 데이터가 진짜 배열인지 확인
        if (Array.isArray(data)) {
          setMakers(data);
        } else {
          throw new Error("서버가 배열 대신 비정상 데이터를 반환했습니다.");
        }
      })
      .catch((err) => {
        console.error("제조사 로딩 실패:", err.message || err);
        setMakers([]);
      });
  }, []);

  // 2. 초기화 신호 감지
  useEffect(() => {
    handleReset();
  }, [resetSignal]);

  const handleReset = () => {
    setMakerId(""); setModelId(""); setTrimId("");
    setMakerName(""); setModelName(""); setTrimName("");
    setModels([]); setTrims([]);
    if (onReset) onReset();
  };

  // 3. 핸들러들
  const handleMakerChange = (e) => {
    const makerId = e.target.value;
    setMakerId(makerId);

    // ✅ 경로 일치 및 견고한 처리 수정: /models -> /vehicles/models
    fetch(`${API_BASE}/vehicles/models?makerId=${makerId}`)
      .then(handleApiResponse) // 견고한 응답 처리 적용
      .then((data) => {
        if (Array.isArray(data)) {
          // [팁] 중복된 모델명이 있다면 여기서 제거해주는 게 좋습니다.
          const uniqueModels = Array.from(new Map(data.map(m => [m.model_name, m])).values());
          setModels(uniqueModels);
        } else {
          console.error("모델 데이터 오류:", data);
          setModels([]);
        }
      })
      .catch((err) => {
        console.error("모델 로딩 실패:", err.message || err);
        setModels([]);
      });

    // ⚠️ 경고: 트림 목록 호출 로직 제거 (Maker 변경 시 트림을 가져올 필요 없음)
  };


  const handleModelChange = (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    setModelId(id);
    setModelName(e.target.options[index].text);
    setTrimId(""); setTrimName("");

    if (id) {
        // ✅ 경로 일치 및 견고한 처리 수정: /trims -> /vehicles/trims
      fetch(`${API_BASE}/vehicles/trims?modelId=${id}`)
        .then(handleApiResponse) // 견고한 응답 처리 적용
        .then((data) => {
            if (Array.isArray(data)) {
                setTrims(data);
            } else {
                console.error("트림 데이터 오류:", data);
                setTrims([]);
            }
        })
        .catch((err) => {
             console.error("트림 로딩 실패:", err.message || err);
             setTrims([]);
        });
    } else {
      setTrims([]);
    }
  };

  const handleTrimChange = (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    setTrimId(id);
    setTrimName(e.target.options[index].text);
  };

  // [수정] 옵션 선택 없이 트림 ID만 전달
  const handleCompleteClick = () => {
    if (!trimId) {
      alert("트림까지 모두 선택해주세요.");
      return;
    }
    // 부모에게 트림 ID만 전달 (옵션은 하단에서 선택)
    if (onSelectComplete) {
      onSelectComplete(trimId);
    }
  };

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px 28px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", minHeight: "300px", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>{title}</div>
      <div style={{ fontSize: "13px", color: "#888", marginBottom: "20px" }}>제조사 → 모델 → 트림 순서로 차량을 선택해주세요.</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        <div>
          <div style={labelStyle}>제조사</div>
          <select size={8} value={makerId} onChange={handleMakerChange} style={selectStyle}>
            <option value="" disabled>제조사 선택</option>
              {/* ✅ key 오류 방지 */}
            {makers.map((m, index) => <option key={m._id || index} value={m._id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <div style={labelStyle}>모델</div>
          <select size={8} value={modelId} onChange={handleModelChange} style={selectStyle}>
            <option value="" disabled>{models.length === 0 ? "제조사를 선택하세요" : "모델을 선택하세요"}</option>
              {/* ✅ key 오류 방지 */}
            {models.map((m, index) => <option key={m._id || index} value={m._id}>{m.model_name}</option>)}
          </select>
        </div>
        <div>
          <div style={labelStyle}>트림</div>
          <select size={8} value={trimId} onChange={handleTrimChange} style={selectStyle}>
            <option value="" disabled>{trims.length === 0 ? "모델을 선택하세요" : "트림을 선택하세요"}</option>
              {/* ✅ key 오류 방지 */}
            {trims.map((t, index) => <option key={t._id || index} value={t._id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div style={{ fontSize: "12px", color: "#555" }}>
          선택: <span style={{ fontWeight: 600 }}>{trimName || "-"}</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleReset} style={btnResetStyle}>초기화</button>
          <button onClick={handleCompleteClick} style={btnSearchStyle}>선택 완료</button>
        </div>
      </div>
    </div>
  );
}

// ---------------- [2] 하단 컴포넌트: 차량 정보 및 옵션 선택 카드 ----------------
function CarOptionSelectCard({ data, selectedSet, onToggle }) {
  // data: 차량 상세 정보 (options 배열 포함)
  // selectedSet: 선택된 옵션 ID Set
  // onToggle: (optId) => void

  const basePrice = data.base_price || 0;
  // 선택된 옵션 가격 합산
  const optionsTotal = (data.options || []).reduce((sum, opt, idx) => {
    const id = opt._id || idx; 
    if (selectedSet.has(id)) {
      return sum + (opt.price || 0);
    }
    return sum;
  }, 0);
  const finalPrice = basePrice + optionsTotal;

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "28px 32px 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
      {/* 차량 이미지 및 정보 */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ width: "200px", height: "110px", margin: "0 auto 16px", borderRadius: "16px", backgroundColor: data.image_url ? "transparent" : "#f3f3f3", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {data.image_url ? (
            <img src={data.image_url} alt={data.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <span style={{ color: "#ccc", fontSize: "12px" }}>이미지 없음</span>
          )}
        </div>
        <div style={{ fontSize: "20px", fontWeight: 800, marginBottom: "4px" }}>{data.name}</div>
        <div style={{ fontSize: "13px", color: "#777" }}>{data.description || "상세 설명 없음"}</div>
      </div>

      <div style={{ backgroundColor: "#fafafa", borderRadius: "12px", padding: "14px 18px", fontSize: "14px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>기본 가격</span>
        <span style={{ fontWeight: 700, color: "#1d4ed8" }}>{basePrice.toLocaleString()}원</span>
      </div>

      {/* [핵심] 하단 카드 내 옵션 선택 체크박스 */}
      <div style={{ fontSize: "14px", marginBottom: "16px" }}>
        <div style={{ fontWeight: 700, marginBottom: "10px" }}>옵션 선택 (체크)</div>
        <div style={{ borderRadius: "12px", border: "1px solid #eee", padding: "10px 0", maxHeight: "260px", overflowY: "auto" }}>
          {(!data.options || data.options.length === 0) && (
            <div style={{ padding: "12px", textAlign: "center", color: "#999", fontSize: "13px" }}>선택 가능한 옵션이 없습니다.</div>
          )}
          {data.options && data.options.map((opt, idx) => {
            const safeId = opt._id || idx; 
            const isChecked = selectedSet.has(safeId);
            return (
              <label
                key={safeId}
                style={{
                  display: "flex", alignItems: "center", padding: "8px 18px", borderBottom: "1px solid #f5f5f5", cursor: "pointer", transition: "background 0.2s",
                  backgroundColor: isChecked ? "#e9f9f1" : "transparent"
                }}
                onMouseEnter={(e) => !isChecked && (e.currentTarget.style.background = "#f9f9f9")}
                onMouseLeave={(e) => !isChecked && (e.currentTarget.style.background = "transparent")}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(safeId)}
                  style={{ marginRight: "12px", cursor: "pointer" }}
                />
                <span style={{ flex: 1 }}>{opt.name}</span>
                <span style={{ fontSize: "13px", color: "#555" }}>+{opt.price ? opt.price.toLocaleString() : 0}원</span>
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ backgroundColor: "#fff3ee", borderRadius: "12px", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "15px", fontWeight: 700 }}>
        <span>최종 차량가</span>
        <span style={{ color: "#e11d48" }}>{finalPrice.toLocaleString()}원</span>
      </div>
    </div>
  );
}

// ---------------- [3] 메인 페이지 ----------------
export default function CompareQuotePage() {
  const router = useRouter();
  // ✅ [수정 2] useSearchParams 훅 사용
  const searchParams = useSearchParams();

  // 차량 상세 정보 상태
  const [car1Data, setCar1Data] = useState(null);
  const [car2Data, setCar2Data] = useState(null);

  // 선택된 옵션 ID Set 상태
  const [car1Opts, setCar1Opts] = useState(new Set());
  const [car2Opts, setCar2Opts] = useState(new Set());

  const [resetSignal, setResetSignal] = useState(0);

  // 트림 상세 정보 가져오기
  const fetchCarDetail = async (trimId) => {
    try {
        // ✅ 경로 일치 수정: /detail -> /vehicles/detail
      const res = await fetch(`${API_BASE}/vehicles/detail?trimId=${trimId}`);
      
      // 4xx/5xx 오류 처리
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `차량 상세 정보 조회 실패 (Status: ${res.status})`);
      }
      
      return await res.json();
    } catch (err) {
      console.error("차량 상세 정보 로드 오류:", err.message || err);
      alert("차량 정보를 불러오는데 실패했습니다.");
      return null;
    }
  };

  // ✅ [수정 3] URL 파라미터를 읽어와서 초기 데이터 세팅하는 useEffect 추가
  useEffect(() => {
    const car1_trimId = searchParams.get("car1_trimId");
    const car1_options_str = searchParams.get("car1_options");

    // trimId가 URL에 있다면 자동으로 데이터 가져오기
    if (car1_trimId) {
      fetchCarDetail(car1_trimId).then((data) => {
        if (data) {
          setCar1Data(data);
          // 옵션 정보도 URL에 있다면 세팅
          if (car1_options_str) {
            const optsArray = car1_options_str.split(",");
            // 빈 문자열 제거 및 Set으로 변환
            const validOpts = optsArray.filter(id => id && id.trim() !== "");
            setCar1Opts(new Set(validOpts));
          } else {
            setCar1Opts(new Set());
          }
        }
      });
    }
  }, [searchParams]);

  // 차량 1 선택 완료 핸들러 (트림 ID만 받음)
  const handleSelect1 = async (trimId) => {
    const data = await fetchCarDetail(trimId);
    if (data) {
      setCar1Data(data);
      setCar1Opts(new Set()); // 옵션 초기화
    }
  };

  // 차량 2 선택 완료 핸들러 (트림 ID만 받음)
  const handleSelect2 = async (trimId) => {
    const data = await fetchCarDetail(trimId);
    if (data) {
      setCar2Data(data);
      setCar2Opts(new Set()); // 옵션 초기화
    }
  };

  const handleResetAll = () => {
    setCar1Data(null);
    setCar2Data(null);
    setCar1Opts(new Set());
    setCar2Opts(new Set());
    setResetSignal(prev => prev + 1);
  };

  // 옵션 토글 함수
  const toggleCar1Opt = (optId) => {
    const newSet = new Set(car1Opts);
    if (newSet.has(optId)) newSet.delete(optId);
    else newSet.add(optId);
    setCar1Opts(newSet);
  };

  const toggleCar2Opt = (optId) => {
    const newSet = new Set(car2Opts);
    if (newSet.has(optId)) newSet.delete(optId);
    else newSet.add(optId);
    setCar2Opts(newSet);
  };

  // [중요] 결과 보기 버튼 핸들러
  const handleViewResult = () => {
    if (!car1Data || !car2Data) {
      alert("비교할 차량 2대를 모두 조회(선택)해 주세요.");
      return;
    }

    // URL 생성: ids=트림1,트림2 & opts1=옵션1,옵션2 & opts2=옵션3,옵션4
    const ids = `${car1Data._id},${car2Data._id}`;
    const opts1 = Array.from(car1Opts).join(",");
    const opts2 = Array.from(car2Opts).join(",");

    // 결과 페이지로 이동 (옵션 정보 포함)
    router.push(`/quote/compare/vs?ids=${ids}&opts1=${opts1}&opts2=${opts2}`);
  };

  return (
    <main style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 40px 60px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", padding: 0, marginBottom: "12px", cursor: "pointer", fontSize: "14px", color: "#555" }}>← 뒤로 가기</button>

        <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px 32px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ width: "6px", height: "60px", borderRadius: "4px", background: "linear-gradient(180deg, #3b82f6, #1d4ed8)" }} />
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#1d4ed8", marginBottom: "6px" }}>비교견적 페이지</div>
              <div style={{ fontSize: "15px", color: "#555" }}>차량과 옵션을 선택하여 가격을 비교해보세요.</div>
            </div>
          </div>
          <button onClick={handleResetAll} style={btnResetStyle}>전체 초기화</button>
        </div>

        {/* 차량 선택 박스 영역 (옵션 선택 기능 빠짐) */}
        {/* ✅ UI 복구: 1:1 비율의 가로 2열 그리드 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <CarSelector title="비교 차량 1" onSelectComplete={handleSelect1} onReset={() => setCar1Data(null)} resetSignal={resetSignal} />
          <CarSelector title="비교 차량 2" onSelectComplete={handleSelect2} onReset={() => setCar2Data(null)} resetSignal={resetSignal} />
        </div>

        {/* 하단 옵션 선택 및 비교 영역 (선택된 차량이 있을 때만 보임) */}
        {(car1Data || car2Data) && (
          <div style={{ marginTop: "40px" }}>
            <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>옵션 선택 및 비교</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "24px" }}>
              {/* 차량 1 옵션 카드 */}
              {car1Data ? (
                <CarOptionSelectCard data={car1Data} selectedSet={car1Opts} onToggle={toggleCar1Opt} />
              ) : <div />}

              {/* 차량 2 옵션 카드 */}
              {car2Data ? (
                <CarOptionSelectCard data={car2Data} selectedSet={car2Opts} onToggle={toggleCar2Opt} />
              ) : <div />}
            </div>

            {/* 결과 보기 버튼 (두 차량 모두 선택되었을 때만 활성화) */}
            {car1Data && car2Data && (
              <div style={{ marginTop: "28px" }}>
                <button onClick={handleViewResult} style={btnResultStyle}>
                  결과 보기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// 스타일
const selectStyle = { width: "100%", borderRadius: "8px", border: "1px solid #ddd", padding: "6px", fontSize: "14px" };
const labelStyle = { fontSize: "13px", color: "#777", marginBottom: "6px" };
const btnResetStyle = { padding: "8px 16px", borderRadius: "999px", border: "1px solid #ddd", backgroundColor: "#f9fafb", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" };
const btnSearchStyle = { padding: "8px 18px", borderRadius: "999px", border: "none", backgroundColor: "#000", color: "#fff", fontSize: "13px", cursor: "pointer" };
const btnResultStyle = { width: "100%", padding: "16px 0", borderRadius: "999px", border: "none", backgroundColor: "#111", color: "#fff", fontSize: "16px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" };
