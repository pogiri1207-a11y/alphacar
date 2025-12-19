// frontend/app/space-game/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const GAME_DURATION = 20; // 게임 시간 (초)

function getRandomPos() {
  // 10% ~ 80% 사이 랜덤 위치 (너무 끝으로 안 가게)
  const x = 10 + Math.random() * 70;
  const y = 10 + Math.random() * 70;
  return { x, y };
}

export default function SpaceGamePage() {
  const [status, setStatus] = useState("ready"); // ready | playing | end
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [starPos, setStarPos] = useState(getRandomPos());

  // 타이머 관리
  useEffect(() => {
    if (status !== "playing") return;

    if (timeLeft <= 0) {
      setStatus("end");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [status, timeLeft]);

  // 별 자동 이동 (난이도 ↑ : 0.9초 -> 0.6초)
  useEffect(() => {
    if (status !== "playing") return;

    const mover = setInterval(() => {
      setStarPos(getRandomPos());
    }, 600); // 🔥 더 빠르게 움직임

    return () => clearInterval(mover);
  }, [status]);

  const handleStart = () => {
    setStatus("playing");
    setTimeLeft(GAME_DURATION);
    setScore(0); // 🔹 항상 0부터 시작
    setStarPos(getRandomPos());
  };

  const handleStarClick = () => {
    // 🔹 혹시 몰라서 방어 코드 유지
    if (status !== "playing") return;

    // 🔹 이전 값 기준으로 확실하게 +1
    setScore((prev) => prev + 1);
    setStarPos(getRandomPos());
  };

  let message = "";
  if (status === "ready") {
    message = "시작 버튼을 누르고, 움직이는 별을 최대한 빨리 클릭해 보세요!";
  } else if (status === "playing") {
    message = "별이 더 빠르게 움직입니다! 반사신경을 믿어보세요 🚀";
  } else {
    if (score >= 20) {
      message = "우주 여행 성공! ALPHACAR 우주 티켓 당첨 수준이에요 ✨";
    } else if (score >= 10) {
      message = "꽤 잘했어요! 한 번만 더 하면 우주까지 갈 수 있을 듯? 😎";
    } else {
      message =
        "아쉽지만… 연습하면 분명 더 잘할 수 있어요! 다시 도전해 볼까요? 😆";
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #020617 0%, #020617 40%, #020817 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "48px 16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px", // 🔹 전체 카드 폭 약 1.15배
          borderRadius: "30px",
          padding: "32px 36px 34px",
          boxSizing: "border-box",
          background: "#020617",
          boxShadow: "0 20px 44px rgba(0,0,0,0.75)",
          color: "white",
        }}
      >
        {/* 상단 타이틀 */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "26px",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#fde68a",
              marginBottom: "8px",
            }}
          >
            알파카 타고 우주 여행! ✨
          </div>
          <div
            style={{ fontSize: "30px", fontWeight: 800, marginBottom: "6px" }}
          >
            9,999원 우주 별잡기 게임
          </div>
          <div style={{ fontSize: "13px", color: "#9ca3af" }}>
            제한 시간 {GAME_DURATION}초 동안, 움직이는 ⭐를 최대한 많이 클릭해
            보세요!
          </div>
        </div>

        {/* 메인 영역: 게임판 + 정보 */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "26px",
          }}
        >
          {/* 게임판 */}
          <div
            style={{
              flex: 3.2,
              borderRadius: "22px",
              background:
                "radial-gradient(circle at top, #1d4ed8 0%, #020617 55%, #000 100%)",
              padding: "18px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                borderRadius: "18px",
                border: "1px solid rgba(148,163,184,0.4)",
                background:
                  "radial-gradient(circle at top, rgba(56,189,248,0.35) 0%, #020617 55%, #020617 100%)",
                height: "500px", // 🔹 게임판 높이
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* 별 배경 (작은 점들) */}
              {[...Array(34)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: "2px",
                    height: "2px",
                    borderRadius: "999px",
                    background: "rgba(248,250,252,0.9)",
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: 0.7,
                  }}
                />
              ))}

              {/* 행성/배경 이모지 */}
              <div
                style={{
                  position: "absolute",
                  top: "18px",
                  left: "22px",
                  fontSize: "30px",
                }}
              >
                🪐
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  right: "26px",
                  fontSize: "32px",
                }}
              >
                🚀
              </div>

              {/* 클릭할 별 ⭐ */}
              {status !== "end" && (
                <button
                  type="button"
                  onClick={handleStarClick}
                  style={{
                    position: "absolute",
                    top: `${starPos.y}%`,
                    left: `${starPos.x}%`,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "999px",
                    border: "none",
                    padding: "12px 12px",
                    fontSize: "34px",
                    cursor: "pointer",
                    background: "transparent",
                    boxShadow: "0 0 20px rgba(251, 191, 36, 0.9)",
                  }}
                >
                  ⭐
                </button>
              )}

              {/* 가운데 안내 텍스트 */}
              {status !== "playing" && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    maxWidth: "280px",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    color: "#e5e7eb",
                    textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                  }}
                >
                  {status === "ready" && (
                    <>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: 700,
                          marginBottom: "6px",
                        }}
                      >
                        게임 준비 완료!
                      </div>
                      <div>
                        아래의 &ldquo;게임 시작하기&rdquo; 버튼을 누르면 별이
                        빠르게 움직이기 시작합니다.
                      </div>
                    </>
                  )}
                  {status === "end" && (
                    <>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: 700,
                          marginBottom: "6px",
                        }}
                      >
                        게임 종료!
                      </div>
                      <div>
                        결과는 오른쪽에서 확인하고, 다시 도전하거나 지구로
                        돌아가 볼까요? 🌍
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 우측 정보 패널 */}
          <div
            style={{
              flex: 2.3,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* 점수 / 시간 */}
            <div
              style={{
                borderRadius: "18px",
                padding: "14px 18px",
                background: "#020617",
                border: "1px solid rgba(148,163,184,0.4)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "#9ca3af" }}>현재 점수</span>
                <span style={{ color: "#9ca3af" }}>남은 시간</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                  }}
                >
                  {score} 회
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: timeLeft <= 5 ? "#fb7185" : "#facc15",
                  }}
                >
                  {timeLeft} 초
                </div>
              </div>
            </div>

            {/* 진행 바 */}
            <div
              style={{
                borderRadius: "18px",
                padding: "12px 18px 14px",
                background: "#020617",
                border: "1px solid rgba(148,163,184,0.4)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  marginBottom: "4px",
                  color: "#e5e7eb",
                }}
              >
                <span>게임 진행도</span>
                <span>
                  {Math.floor(
                    ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100
                  )}
                  %
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "10px",
                  borderRadius: "999px",
                  background: "#020617",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${
                      ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100
                    }%`,
                    height: "100%",
                    borderRadius: "999px",
                    background:
                      "linear-gradient(90deg, #22c55e 0%, #eab308 40%, #f97316 100%)",
                    transition: "width 0.2s linear",
                  }}
                />
              </div>
            </div>

            {/* 설명 / 결과 메시지 */}
            <div
              style={{
                borderRadius: "18px",
                padding: "14px 18px",
                background: "#020617",
                border: "1px solid rgba(148,163,184,0.4)",
                fontSize: "13px",
                color: "#e5e7eb",
                minHeight: "90px",
              }}
            >
              {message}
            </div>

            {/* 버튼 영역 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginTop: "4px",
              }}
            >
              {/* 메인 액션 버튼 */}
              {status !== "playing" ? (
                <button
                  type="button"
                  onClick={handleStart}
                  style={{
                    width: "100%",
                    height: "54px",
                    borderRadius: "999px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: 700,
                    background:
                      "linear-gradient(90deg, #22c55e 0%, #16a34a 40%, #22c55e 100%)",
                    color: "white",
                    boxShadow: "0 10px 24px rgba(34,197,94,0.4)",
                  }}
                >
                  게임 시작하기
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  style={{
                    width: "100%",
                    height: "54px",
                    borderRadius: "999px",
                    border: "none",
                    fontSize: "15px",
                    fontWeight: 600,
                    background: "#1e293b",
                    color: "#9ca3af",
                  }}
                >
                  게임 진행 중...
                </button>
              )}

              {/* 아래 보조 버튼들 */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  fontSize: "12px",
                  color: "#9ca3af",
                }}
              >
                <button
                  type="button"
                  onClick={handleStart}
                  style={{
                    flex: 1,
                    height: "40px",
                    borderRadius: "999px",
                    border: "1px solid #4b5563",
                    background: "transparent",
                    color: "#e5e7eb",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  다시 하기
                </button>

                {/* 🌍 지구로 돌아가기 버튼 (메인 페이지 이동) */}
                <Link
                  href="/"
                  style={{
                    flex: 1,
                    height: "40px",
                    borderRadius: "999px",
                    border: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(90deg, #38bdf8 0%, #0ea5e9 50%, #0369a1 100%)",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: 600,
                    textDecoration: "none",
                    boxShadow: "0 8px 18px rgba(56,189,248,0.35)",
                  }}
                >
                  🌍 지구로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
