"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

// 백엔드 API 주소
const API_BASE = "/api";

// 타입 정의
interface ApiError {
  message?: string;
  status?: number;
}

interface Maker {
  _id?: string;
  name?: string;
  [key: string]: any;
}

interface Model {
  _id?: string;
  model_name?: string;
  name?: string;
  [key: string]: any;
}

interface BaseTrim {
  _id?: string;
  id?: string;
  name?: string;
  base_trim_name?: string;
  [key: string]: any;
}

interface Trim {
  _id?: string;
  trim_name?: string;
  name?: string;
  lineup_id?: string;
  [key: string]: any;
}

interface VehicleData {
  _id?: string;
  id?: string;
  name?: string;
  trim_name?: string;
  vehicle_name?: string;
  model_name?: string;
  brand_name?: string;
  manufacturer?: string;
  base_price?: number;
  image_url?: string;
  main_image?: string;
  [key: string]: any;
}

interface CarSelectorProps {
  onSelectComplete: (trimId: string, modelName?: string) => void;
  onReset?: () => void;
  initialData?: {
    makerId?: string;
    modelId?: string;
    baseTrimId?: string;
    trimId?: string;
    modelName?: string;
  };
}

interface CarInfoCardProps {
  data: VehicleData | null;
}

// [유틸] 견고한 HTTP 응답 처리
const handleApiResponse = async (res: Response): Promise<any> => {
  if (!res.ok) {
    let errorData: ApiError = {};
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
function CarSelector({ onSelectComplete, onReset, initialData }: CarSelectorProps) {
  const [makerId, setMakerId] = useState<string>(initialData?.makerId || "");
  const [modelId, setModelId] = useState<string>(initialData?.modelId || "");
  const [baseTrimId, setBaseTrimId] = useState<string>(initialData?.baseTrimId || "");
  const [trimId, setTrimId] = useState<string>(initialData?.trimId || "");

  const [makers, setMakers] = useState<Maker[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [baseTrims, setBaseTrims] = useState<BaseTrim[]>([]);
  const [trims, setTrims] = useState<Trim[]>([]);

  const [trimName, setTrimName] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);
  const initialDataProcessedRef = useRef<string>("");

  // 1. 초기 로딩
  useEffect(() => {
    fetch(`${API_BASE}/vehicles/makers`)
      .then(handleApiResponse)
      .then((data: any) => { if (Array.isArray(data)) setMakers(data); })
      .catch((err: any) => { console.error("제조사 로딩 실패:", err); setMakers([]); });
  }, []);

  // 2. initialData가 있으면 자동으로 선택 (한 번만 실행)
  useEffect(() => {
    if (!initialData || isInitializing || makers.length === 0 || hasUserInteracted) return;

    const { makerId: initMakerId, modelId: initModelId, baseTrimId: initBaseTrimId, trimId: initTrimId, modelName: initModelName } = initialData;
    const initialDataKey = `${initMakerId}-${initModelId}-${initBaseTrimId}-${initTrimId}`;

    if (initialDataProcessedRef.current === initialDataKey) return;

    if (initMakerId && initModelId) {
      setIsInitializing(true);
      initialDataProcessedRef.current = initialDataKey;

      setMakerId(initMakerId);

      fetch(`${API_BASE}/vehicles/models?makerId=${encodeURIComponent(initMakerId)}`)
        .then(handleApiResponse)
        .then((data: any) => {
          if (Array.isArray(data)) {
            const uniqueModels = Array.from(new Map(data.map((m: Model) => [m.model_name, m])).values());
            setModels(uniqueModels);

            const foundModel = uniqueModels.find((m: Model) => m._id === initModelId || m.model_name === initModelName);
            if (foundModel) {
              const currentModelId = foundModel._id || "";
              setModelId(currentModelId);

              fetch(`${API_BASE}/vehicles/base-trims?modelId=${encodeURIComponent(currentModelId)}`)
                .then(handleApiResponse)
                .then((baseTrimData: any) => {
                  if (Array.isArray(baseTrimData)) {
                    setBaseTrims(baseTrimData);

                    if (initBaseTrimId) {
                      const foundBaseTrim = baseTrimData.find((bt: BaseTrim) => bt._id === initBaseTrimId || bt.id === initBaseTrimId || bt.base_trim_name === initBaseTrimId);
                      if (foundBaseTrim) {
                        const currentBaseTrimVal = foundBaseTrim._id || foundBaseTrim.id || foundBaseTrim.base_trim_name || "";
                        setBaseTrimId(currentBaseTrimVal);

                        // 세부 트림 로드 (비교견적과 동일한 로직)
                        fetch(`${API_BASE}/vehicles/trims?modelId=${encodeURIComponent(currentModelId)}&baseTrimName=${encodeURIComponent(currentBaseTrimVal)}`)
                          .then(handleApiResponse)
                          .then((trimData: any) => {
                            if (Array.isArray(trimData)) {
                              setTrims(trimData);
                              if (initTrimId) {
                                const foundTrim = trimData.find((t: Trim) =>
                                  t._id === initTrimId || t.trim_name === initTrimId || t.lineup_id === initTrimId
                                );
                                if (foundTrim) {
                                  setTrimId(foundTrim.lineup_id || foundTrim._id || "");
                                  setTrimName(foundTrim.trim_name || "");
                                }
                              }
                            }
                            setIsInitializing(false);
                          })
                          .catch(() => setIsInitializing(false));
                      } else setIsInitializing(false);
                    } else setIsInitializing(false);
                  } else setIsInitializing(false);
                })
                .catch(() => setIsInitializing(false));
            } else setIsInitializing(false);
          } else setIsInitializing(false);
        })
        .catch(() => setIsInitializing(false));
    }
  }, [initialData, makers, isInitializing, hasUserInteracted]);

  const handleReset = () => {
    setMakerId(""); setModelId(""); setBaseTrimId(""); setTrimId("");
    setTrimName("");
    setModels([]); setBaseTrims([]); setTrims([]);
    setHasUserInteracted(false);
    initialDataProcessedRef.current = "";
    if (onReset) onReset();
  };

  const handleMakerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMakerId = e.target.value;
    setHasUserInteracted(true);
    setMakerId(newMakerId);
    setModelId(""); setBaseTrimId(""); setTrimId(""); setTrimName("");
    setModels([]); setBaseTrims([]); setTrims([]);

    if (!newMakerId) return;

    fetch(`${API_BASE}/vehicles/models?makerId=${encodeURIComponent(newMakerId)}`)
      .then(handleApiResponse)
      .then((data: any) => {
        if (Array.isArray(data)) {
          const uniqueModels = Array.from(new Map(data.map((m: Model) => [m.vehicle_name || m.model_name, m])).values());
          setModels(uniqueModels);
        } else setModels([]);
      })
      .catch((err: any) => console.error("모델 로딩 실패:", err));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModelId = e.target.value;
    setHasUserInteracted(true);
    if (!newModelId) {
      setModelId(""); setBaseTrimId(""); setTrimId(""); setBaseTrims([]); setTrims([]); return;
    }
    setModelId(newModelId);
    setBaseTrimId(""); setTrimId(""); setTrimName("");
    setBaseTrims([]); setTrims([]);

    fetch(`${API_BASE}/vehicles/base-trims?modelId=${encodeURIComponent(newModelId)}`)
      .then(handleApiResponse)
      .then((data: any) => {
        if (Array.isArray(data)) setBaseTrims(data);
        else setBaseTrims([]);
      })
      .catch((err: any) => console.error("기본 트림 로딩 실패:", err));
  };

  const handleBaseTrimChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBaseTrimVal = e.target.value; // base_trim_name 또는 _id
    setHasUserInteracted(true);

    if (!newBaseTrimVal || !modelId) {
      setBaseTrimId(""); setTrimId(""); setTrimName(""); setTrims([]); return;
    }

    setBaseTrimId(newBaseTrimVal);
    setTrimId(""); setTrimName("");
    setTrims([]);

    // ✅ [로직 수정] 비교견적과 동일하게 modelId와 baseTrimName을 사용하여 세부 트림 호출
    fetch(`${API_BASE}/vehicles/trims?modelId=${encodeURIComponent(modelId)}&baseTrimName=${encodeURIComponent(newBaseTrimVal)}`)
      .then(handleApiResponse)
      .then((data: any) => {
        if (Array.isArray(data)) setTrims(data);
        else setTrims([]);
      })
      .catch((err: any) => console.error("세부 트림 로딩 실패:", err));
  };

  const handleTrimChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTrimId = e.target.value;
    setHasUserInteracted(true);

    if (!newTrimId) {
      setTrimId(""); setTrimName(""); return;
    }

    const index = e.target.selectedIndex;
    const selectedText = index >= 0 ? e.target.options[index].text : "";

    setTrimId(newTrimId);
    setTrimName(selectedText);

    if (onSelectComplete) {
      const selectedModel = models.find((m: Model) => m._id === modelId);
      const modelName = selectedModel?.model_name || selectedModel?.name || "";
      onSelectComplete(newTrimId, modelName);
    }
  };

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "28px 32px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
      <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", color: "#1e293b", borderBottom: "2px solid #f1f5f9", paddingBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>차량 선택</span>
        <button onClick={handleReset} style={btnResetStyle}>초기화</button>
      </div>

      <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>제조사 → 차종 → 기본트림 → 세부트림 순서로 선택</div>

      <div className="personal-filter-grid">
        {/* 제조사 */}
        <div style={{ minWidth: 0 }}>
          <div style={labelStyle}>제조사</div>
          <select size={10} value={makerId || ""} onChange={handleMakerChange} style={selectStyle}>
            <option value="" disabled style={{ color: "#ccc" }}>- 선택 -</option>
            {makers.map((m, idx) => (
              <option key={m._id || `m-${idx}`} value={m._id || m.name}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* 차종 */}
        <div style={{ minWidth: 0 }}>
          <div style={labelStyle}>차종</div>
          <select size={10} value={modelId || ""} onChange={handleModelChange} style={selectStyle}>
            <option value="" disabled style={{ color: "#ccc" }}>{makerId ? "- 선택 -" : "-"}</option>
            {models.map((m, idx) => (
              <option key={m._id || `mo-${idx}`} value={m._id}>{m.model_name}</option>
            ))}
          </select>
        </div>

        {/* 기본트림 */}
        <div style={{ minWidth: 0 }}>
          <div style={labelStyle}>기본트림</div>
          <select size={10} value={baseTrimId || ""} onChange={handleBaseTrimChange} style={selectStyle}>
            <option value="" disabled style={{ color: "#ccc" }}>{modelId ? "- 선택 -" : "-"}</option>
            {baseTrims.map((t, idx) => (
              <option key={t._id || `base-${idx}`} value={t.base_trim_name || t.name || t._id}>{t.name || t.base_trim_name}</option>
            ))}
          </select>
        </div>

        {/* 세부트림 */}
        <div style={{ minWidth: 0 }}>
          <div style={labelStyle}>세부트림</div>
          <select size={10} value={trimId || ""} onChange={handleTrimChange} style={selectStyle}>
            <option value="" disabled style={{ color: "#ccc" }}>{baseTrimId ? "- 선택 -" : "-"}</option>
            {trims.map((t, idx) => (
              <option key={t._id || `trim-${idx}`} value={t.lineup_id || t._id}>{t.trim_name || t.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ---------------- [2] 차량 정보 카드 ----------------
function CarInfoCard({ data }: CarInfoCardProps) {
  if (!data) return null;
  const basePrice = data.base_price || 0;

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
            <div style={{ width: "100%", maxWidth: "500px", height: "260px", borderRadius: "12px", backgroundColor: data.image_url ? "transparent" : "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {data.image_url || data.main_image ? (
                    <img src={data.image_url || data.main_image} alt={data.name || "차량 이미지"} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                ) : (
                    <span style={{ color: "#aaa", fontSize: "14px" }}>이미지 준비중</span>
                )}
            </div>

            <div style={{ textAlign: "center", width: "100%" }}>
                <div style={{ fontSize: "16px", color: "#64748b", marginBottom: "8px", fontWeight: 600 }}>
                    {data.brand_name || data.manufacturer} {data.vehicle_name || data.model_name}
                </div>
                <div style={{ fontSize: "26px", fontWeight: 800, color: "#1e293b", marginBottom: "24px", lineHeight: "1.3" }}>
                    {data.name || data.trim_name}
                </div>

                <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", backgroundColor: "#f1f5f9", padding: "16px 32px", borderRadius: "99px" }}>
                    <span style={{ fontSize: "14px", color: "#475569", fontWeight: 600 }}>기본 차량가</span>
                    <span style={{ fontSize: "24px", fontWeight: 800, color: "#2563eb" }}>{basePrice.toLocaleString()}원</span>
                </div>
            </div>
        </div>
    </div>
  );
}

// ---------------- [3] 메인 페이지 ----------------
function PersonalQuotePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [carData, setCarData] = useState<VehicleData | null>(null);
  const [isAutoSelecting, setIsAutoSelecting] = useState<boolean>(false);
  const [selectorInitialData, setSelectorInitialData] = useState<{
    makerId?: string;
    modelId?: string;
    baseTrimId?: string;
    trimId?: string;
    modelName?: string;
  } | undefined>(undefined);

  const fetchCarDetail = async (trimId: string, modelName?: string): Promise<VehicleData | null> => {
    try {
      const queryParams = new URLSearchParams({ trimId });
      if (modelName) queryParams.append('modelName', modelName);
      const res = await fetch(`${API_BASE}/vehicles/detail?${queryParams.toString()}`);
      if (!res.ok) throw new Error("조회 실패");
      const rawVehicleData: any = await res.json();

      let selectedTrim: any = null;
      const trims = rawVehicleData.trims || [];

      if (trims.length > 0) {
          const decodedTrimId = decodeURIComponent(trimId);
          const trimNameOnly = decodedTrimId.split(':')[0].trim();
          selectedTrim = trims.find((t: any) => t.trim_name === trimNameOnly || t.trim_name === decodedTrimId || t.lineup_id === trimId || t._id === trimId);
          if (!selectedTrim) selectedTrim = trims[0];
      }

      if (!selectedTrim) return rawVehicleData;

      return {
          ...rawVehicleData,
          name: selectedTrim.trim_name,
          base_price: selectedTrim.price,
      };

    } catch (err: any) {
      console.error(err);
      return null;
    }
  };

  const handleSelectComplete = async (trimId: string, modelName?: string) => {
    const data = await fetchCarDetail(trimId, modelName);
    if (data) setCarData(data);
  };

  useEffect(() => {
    const trimId = searchParams.get("trimId");
    const modelName = searchParams.get("modelName");

    if (!isAutoSelecting && !carData && trimId) {
      setIsAutoSelecting(true);
      handleSelectComplete(trimId, modelName || undefined).finally(() => setIsAutoSelecting(false));
    }
  }, [searchParams]);

  const handleReset = () => {
    setCarData(null);
    setSelectorInitialData(undefined);
  };

  const handleMoveToResult = () => {
    if (!carData) { alert("차량을 먼저 선택해주세요."); return; }
    const safeId = carData.name || carData._id || carData.id || "";
    const queryParams = new URLSearchParams({ trimId: safeId });
    if (carData.vehicle_name || carData.model_name) {
      queryParams.append('modelName', carData.vehicle_name || carData.model_name);
    }
    router.push(`/quote/personal/result?${queryParams.toString()}`);
  };

  return (
    <main style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 5% 80px" }}>
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#1e293b", marginBottom: "12px" }}>나만의 견적 내기</h1>
            <p style={{ fontSize: "16px", color: "#64748b" }}>원하는 차량을 선택하고 상세 옵션을 구성해보세요.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ width: "100%" }}>
                <CarSelector
                  onSelectComplete={handleSelectComplete}
                  onReset={handleReset}
                  initialData={selectorInitialData}
                />
            </div>

            {carData && (
                <div style={{ animation: "slideUp 0.5s ease-out", display: "flex", flexDirection: "column", gap: "24px" }}>
                    <CarInfoCard data={carData} />
                    <button onClick={handleMoveToResult} style={btnResultStyle}>
                        상세 견적 확인하기 →
                    </button>
                </div>
            )}
        </div>
      </div>
      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .personal-filter-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) { .personal-filter-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .personal-filter-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}

export default function PersonalQuotePage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "100px 0" }}>로딩 중...</div>}>
      <PersonalQuotePageContent />
    </Suspense>
  );
}

// 스타일
const selectStyle: React.CSSProperties = { width: "100%", height: "240px", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "12px", fontSize: "14px", outline: "none", color: "#333", backgroundColor: "#f8fafc" };
const labelStyle: React.CSSProperties = { fontSize: "14px", fontWeight: 700, color: "#475569", marginBottom: "8px", paddingLeft: "4px" };
const btnResetStyle: React.CSSProperties = { padding: "6px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#fff", color: "#64748b", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "0.2s" };
const btnResultStyle: React.CSSProperties = { width: "100%", maxWidth: "400px", margin: "0 auto", padding: "20px 0", borderRadius: "99px", border: "none", backgroundColor: "#0f172a", color: "#fff", fontSize: "18px", fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 25px rgba(15, 23, 42, 0.2)", transition: "transform 0.2s" };
