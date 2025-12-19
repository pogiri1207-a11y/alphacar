// app/news/page.js
"use client";

import Link from "next/link";
import { useState } from "react";

// 🔹 핫이슈 더미 데이터 (나중에 API 연결 예정)
const hotIssueList = [
  {
    id: 1,
    title: "전기차 배터리 리콜 이슈, 주요 브랜드 대응은?",
    summary:
      "국내외 완성차 업체들이 최근 전기차 배터리 이슈에 대해 어떤 방식으로 대응하고 있는지 정리했습니다.",
    source: "ALPHACAR 뉴스",
    date: "2025.12.05",
  },
  {
    id: 2,
    title: "신형 SUV 출시 임박, 사전 계약 포인트 총정리",
    summary:
      "패밀리카로 인기가 높은 SUV 신모델, 트림별 옵션과 사전 계약 시 꼭 체크해야 할 항목을 안내해드립니다.",
    source: "ALPHACAR 뉴스",
    date: "2025.12.04",
  },
  {
    id: 3,
    title: "하이브리드 vs 전기차, 5년 유지비 비교",
    summary:
      "실제 주행거리와 충전·주유 비용을 기준으로 두 차량의 유지비를 비교해봤습니다.",
    source: "ALPHACAR 리포트",
    date: "2025.12.03",
  },
  {
    id: 4,
    title: "연말 신차 할인 정보 한눈에 보기",
    summary:
      "국산·수입 주요 브랜드의 연말 프로모션과 캐시백 정보를 정리했습니다.",
    source: "ALPHACAR 리포트",
    date: "2025.12.02",
  },
];

// 🔹 내차와의 데이트 카드(샘플)
const carDataCards = [
  {
    id: 1,
    title: "첫 드라이브의 설렘",
    desc: "처음 함께한 도로 위 순간들을 기록해보세요.",
    tag: "나만의 스토리",
  },
  {
    id: 2,
    title: "여행지에서의 한 컷",
    desc: "가장 기억에 남는 여행지와 사진을 남겨보세요.",
    tag: "여행 기록",
  },
  {
    id: 3,
    title: "야간 드라이브의 분위기",
    desc: "도심 야경, 한강 드라이브 등 밤의 추억을 담아보세요.",
    tag: "야간 감성",
  },
  {
    id: 4,
    title: "함께한 사람들",
    desc: "가족, 친구, 연인과 함께한 순간들을 공유해보세요.",
    tag: "동승자 이야기",
  },
];

// 🔹 시승기 유튜브 영상 목록
const driveVideos = [
  {
    id: 1,
    title: "전기 SUV 실사용 시승기",
    videoId: "BgTb_xbuaAU",
  },
  {
    id: 2,
    title: "하이브리드 세단 고속도로 주행",
    videoId: "EEcnUB9w45w",
  },
  {
    id: 3,
    title: "패밀리카 SUV 실내·승차감 리뷰",
    videoId: "f-M4ME3dATw",
  },
  {
    id: 4,
    title: "장거리 주행 전비 테스트",
    videoId: "Z9C259sx4gg",
  },
  {
    id: 5,
    title: "도심 주행 / 주차 편의성 리뷰",
    videoId: "pgWDpctCzAY",
  },
  {
    id: 6,
    title: "고성능 전기차 시승기",
    videoId: "ZYL3pIW-68Y",
  },
];

export default function NewsPage() {
  // 유튜브 모달 상태
  const [activeVideoId, setActiveVideoId] = useState(null);

  const openVideo = (videoId) => setActiveVideoId(videoId);
  const closeVideo = () => setActiveVideoId(null);

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "40px auto 80px",
        padding: "0 20px",
      }}
    >
      {/* 상단 위치 표시 / 소제목 */}
      <div style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>
        ALPHACAR 소식
      </div>

      {/* 상단 헤더 영역 */}
      <section
        style={{
          background: "linear-gradient(to right, #eff4ff, #f4f7ff)",
          borderRadius: "8px",
          padding: "28px 24px 32px",
          marginBottom: "32px",
        }}
      >
        <div style={{ fontSize: "14px", color: "#888", marginBottom: "4px" }}>
          알파카와 자동차, 사용기까지. 자동차 관련 깊이 있는 이야기를 만나보세요
        </div>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 800,
            lineHeight: 1.3,
            marginBottom: "4px",
          }}
        >
          최신 자동차
          <br />
          소식과 이야기
        </h1>
      </section>

      {/* 1. 핫이슈 영역 */}
      <section style={{ marginBottom: "40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "16px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "4px",
              }}
            >
              핫이슈
            </h2>
            <div style={{ fontSize: "12px", color: "#999" }}>
              다나와 자동차 &amp; ALPHACAR에서 모은 인기 기사
            </div>
          </div>
          {/* 더보기 버튼 제거 */}
        </div>

        <div>
          {hotIssueList.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: "16px",
                padding: "16px 0",
                borderTop: "1px solid #eee",
              }}
            >
              {/* 썸네일 자리 */}
              <div
                style={{
                  width: "160px",
                  height: "96px",
                  borderRadius: "6px",
                  background:
                    "linear-gradient(135deg, #d6e4ff, #f5f7ff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: "#4a67d6",
                  flexShrink: 0,
                }}
              >
                IMAGE
              </div>

              {/* 텍스트 영역 */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    marginBottom: "6px",
                    lineHeight: 1.4,
                    cursor: "pointer",
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#555",
                    lineHeight: 1.5,
                    marginBottom: "8px",
                  }}
                >
                  {item.summary}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#999",
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <span>{item.source}</span>
                  <span>·</span>
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. 내차와의 데이트 (노란 박스) */}
      <section style={{ marginBottom: "16px" }}>
        <div
          style={{
            backgroundColor: "#fff7e6",
            borderRadius: "10px",
            padding: "24px 20px 28px",
          }}
        >
          {/* 타이틀 */}
          <div
            style={{
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "4px",
              }}
            >
              내차와의 데이트
            </h2>
            <div style={{ fontSize: "12px", color: "#999" }}>
              차와 함께한 특별한 순간들
            </div>
          </div>

          {/* 카드 리스트 */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              overflowX: "auto",
            }}
          >
            {carDataCards.map((card) => (
              <div
                key={card.id}
                style={{
                  flex: "0 0 210px",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  padding: "12px 12px 14px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "120px",
                    borderRadius: "6px",
                    marginBottom: "10px",
                    background:
                      "linear-gradient(135deg, #ffd591, #ffe7ba)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    color: "#b46000",
                  }}
                >
                  MEMORY
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    marginBottom: "6px",
                    lineHeight: 1.4,
                  }}
                >
                  {card.title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "8px",
                    lineHeight: 1.5,
                  }}
                >
                  {card.desc}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#999",
                  }}
                >
                  {card.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 시승기 섹션 (흰색 카드 + 유튜브 + CTA) */}
      <section style={{ marginBottom: "40px" }}>
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
            padding: "22px 20px 24px",
          }}
        >
          {/* 상단 제목 */}
          <div
            style={{
              marginBottom: "14px",
            }}
          >
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 800,
                marginBottom: "4px",
              }}
            >
              시승기
            </h2>
            <div
              style={{
                fontSize: "12px",
                color: "#9ca3af",
              }}
            >
              전문가의 상세한 시승 리뷰
            </div>
          </div>

          {/* 유튜브 썸네일 리스트 (3개씩 2줄 그리드) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            {driveVideos.map((video) => (
              <button
                key={video.id}
                type="button"
                onClick={() => openVideo(video.videoId)}
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "#000",
                    boxShadow: "0 4px 12px rgba(15,23,42,0.3)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      paddingBottom: "56.25%", // 16:9
                      height: 0,
                    }}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                      alt={video.title}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {/* 플레이 버튼 */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(0,0,0,0.7)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                        }}
                      >
                        <div
                          style={{
                            width: 0,
                            height: 0,
                            borderTop: "8px solid transparent",
                            borderBottom: "8px solid transparent",
                            borderLeft: "13px solid #ffffff",
                            marginLeft: "2px",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 제목 */}
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#111827",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {video.title}
                </div>
              </button>
            ))}
          </div>

          {/* CTA : 남색 박스 + 아래 흰 배경 버튼 */}
          <div
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #e5e7eb",
            }}
          >
            {/* 남색 영역 - 텍스트만 */}
            <div
              style={{
                backgroundColor: "#1f3b8f",
                padding: "20px 16px 18px",
                textAlign: "center",
                color: "#ffffff",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  marginBottom: "6px",
                }}
              >
                직접 경험해보세요
              </div>
              <div
                style={{
                  fontSize: "13px",
                  opacity: 0.95,
                }}
              >
                원하시는 차량의 시승을 신청하고 직접 체험해보세요.
              </div>
            </div>

            {/* 하얀 배경 영역 + 버튼 */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "14px 16px 16px",
                textAlign: "center",
              }}
            >
              <Link href="/news/test-drive">
                <button
                  type="button"
                  style={{
                    padding: "10px 32px",
                    borderRadius: "999px",
                    border: "none",
                    background:
                      "linear-gradient(90deg, #60a5fa, #3b82f6)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 6px 16px rgba(15,23,42,0.25)",
                  }}
                >
                  시승 신청하기
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🔴 유튜브 모달 (화면 가운데 크게 재생) */}
      {activeVideoId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "90%",
              maxWidth: "960px",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "#000",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* X 버튼 */}
            <button
              type="button"
              onClick={closeVideo}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "#fff",
                fontSize: "18px",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              ✕
            </button>

            {/* 유튜브 iframe */}
            <div
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                title="시승기 영상"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
