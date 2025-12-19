// frontend/app/mypage/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import axios from "axios";
// @ts-ignore (lib/api 파일이 JS라면 TS 에러 방지용)
import { fetchMypageInfo } from "@/lib/api";
import SimpleModal from "../components/SimpleModal";

// ✅ 타입 정의 (TypeScript의 핵심)
interface User {
  nickname?: string;
  name?: string;
  email?: string;
  provider?: string;
  point?: number;
  socialId?: string;
  [key: string]: any; // 기타 속성 허용
}

// ✅ 인증 정보 전체 삭제 함수
const clearAuthStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("alphacarUser");
    localStorage.removeItem("user_social_id");
    localStorage.removeItem("alphacarWelcomeName");
  }
};

// ---------------------------------------------------------
// 1️⃣ 실제 로직이 들어있는 내부 컴포넌트 (기존 MyPage 내용)
// ---------------------------------------------------------
function MyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL 파라미터 가져오기
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const [showBanner, setShowBanner] = useState(true);

  // 로그인 유저 정보 타입 적용
  const [user, setUser] = useState<User | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  // 견적 개수 상태 관리
  const [estimateCount, setEstimateCount] = useState(0);

  // 모달 상태
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 🔹 소셜 로그인 처리 + 백엔드에서 마이페이지 정보 가져오기
  useEffect(() => {
    const processAuth = async () => {
      setCheckedAuth(false);

      // Case 1: 소셜 로그인 직후
      if (code) {
        try {
          let response;

          if (state === "google") {
            response = await axios.post(
              "https://192.168.0.160.nip.io:8000/auth/google-login",
              { code }
            );
          } else {
            response = await axios.post(
              "https://192.168.0.160.nip.io:8000/auth/kakao-login",
              { code }
            );
          }

          const { access_token, user: loggedInUser } = response.data;

          if (!loggedInUser.provider) {
            loggedInUser.provider = state === "google" ? "google" : "kakao";
          }

          if (loggedInUser.socialId) {
            localStorage.setItem("user_social_id", loggedInUser.socialId);
          } else {
            console.warn("로그인 응답에 socialId가 없습니다.");
          }

          localStorage.setItem("accessToken", access_token);
          localStorage.setItem("alphacarUser", JSON.stringify(loggedInUser));

          const welcome =
            loggedInUser.nickname ||
            loggedInUser.name ||
            loggedInUser.email ||
            "ALPHACAR 회원";
          localStorage.setItem("alphacarWelcomeName", welcome);

          router.replace("/mypage");
          return;
        } catch (error) {
          console.error("로그인 실패:", error);
          clearAuthStorage();
          alert("로그인에 실패했습니다. 백엔드 연결을 확인해주세요.");
          router.replace("/mypage/login");
          return;
        }
      }

      // Case 2: 일반 접속
      try {
        const data = await fetchMypageInfo();

        if (data.isLoggedIn && data.user) {
          if (!data.user.provider) {
            const localUser = JSON.parse(
              localStorage.getItem("alphacarUser") || "{}"
            );
            if (localUser.provider) {
              data.user.provider = localUser.provider;
            }
          }
          setUser(data.user);

          const storedWelcome = localStorage.getItem("alphacarWelcomeName");
          if (storedWelcome) {
            setWelcomeName(storedWelcome);
            setShowWelcomeModal(true);
            localStorage.removeItem("alphacarWelcomeName");
          }
        } else {
          setUser(null);
          clearAuthStorage();
        }
      } catch (error) {
        console.error("마이페이지 정보 불러오기 실패:", error);
        clearAuthStorage();
        setUser(null);
      } finally {
        setCheckedAuth(true);
      }
    };

    processAuth();
  }, [code, router, state]);

  // 견적 개수 가져오기
  useEffect(() => {
    if (user) {
      const socialId = localStorage.getItem("user_social_id");

      if (socialId) {
        fetch(`/api/estimate/count?userId=${socialId}`)
          .then(async (res) => {
            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.message || "서버 요청 실패");
            }
            return res.json();
          })
          .then((data) => {
            console.log("견적 개수 조회 성공:", data);
            if (typeof data === "number") {
              setEstimateCount(data);
            } else {
              setEstimateCount(0);
            }
          })
          .catch((err) => {
            console.error("견적 개수 불러오기 실패:", err);
            setEstimateCount(0);
          });
      }
    }
  }, [user]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    clearAuthStorage();
    setUser(null);
    setEstimateCount(0);
    setShowLogoutModal(false);
    router.replace("/mypage/login");
  };

  const handleLoginClick = () => {
    router.push("/mypage/login");
  };

  if (!checkedAuth) {
    return (
      <div style={{ padding: "60px 16px" }}>마이페이지 불러오는 중...</div>
    );
  }

  const provider = user?.provider ? user.provider.toLowerCase() : "email";

  return (
    <>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "60px 16px 80px",
          display: "flex",
          gap: "40px",
          alignItems: "flex-start",
        }}
      >
        {/* 왼쪽 배너 */}
        <aside style={{ width: "220px", flexShrink: 0 }}>
          {showBanner && (
            <img
              src="/banners/alphacar-space.png"
              alt=""
              onError={() => setShowBanner(false)}
              style={{
                width: "100%",
                display: "block",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            />
          )}
        </aside>

        {/* 오른쪽 메인 영역 */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          {user ? (
            <div style={{ width: "100%", maxWidth: "520px" }}>
              {/* 프로필 영역 */}
              <section
                style={{
                  marginBottom: "32px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h1
                    style={{
                      fontSize: "26px",
                      fontWeight: 700,
                      marginBottom: "8px",
                      lineHeight: "1.2",
                    }}
                  >
                    {user.nickname || "플렉스하는 알파카"}
                  </h1>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px 10px",
                        borderRadius: "999px",
                        background:
                          provider === "kakao"
                            ? "#FEE500"
                            : provider === "google"
                            ? "#fff"
                            : "#f3f4f6",
                        border:
                          provider === "google" ? "1px solid #ddd" : "none",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: provider === "kakao" ? "#000" : "#333",
                      }}
                    >
                      {provider.toUpperCase()}
                    </span>
                    <span style={{ color: "#555" }}>
                      {user.email || "AlphaFlex123@naver.com"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: "#000",
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  로그아웃
                </button>
              </section>

              {/* 견적함 / 포인트 카드 */}
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  borderRadius: "18px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                  marginBottom: "24px",
                  backgroundColor: "#fff",
                }}
              >
                <button
                  type="button"
                  onClick={() => router.push("/mypage/quotes")}
                  style={{
                    padding: "20px",
                    border: "none",
                    borderRight: "1px solid #f3f4f6",
                    textAlign: "center",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#777",
                      marginBottom: "6px",
                    }}
                  >
                    견적함
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 700 }}>
                    {estimateCount}건
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/mypage/points")}
                  style={{
                    padding: "20px",
                    border: "none",
                    textAlign: "center",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#777",
                      marginBottom: "6px",
                    }}
                  >
                    포인트
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 700 }}>
                    {user.point ?? 0}P
                  </div>
                </button>
              </section>

              {/* 메뉴 카드 */}
              <section
                style={{
                  borderRadius: "18px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  backgroundColor: "#fff",
                  overflow: "hidden",
                }}
              >
                {[
                  { label: "결제내역", href: "/mypage/payments" },
                  { label: "알파카 소식", href: "/community" },
                  { label: "설정", href: "/mypage/settings" },
                ].map((item, idx) => (
                  <button
                    key={item.label}
                    type="button"
                    style={{
                      width: "100%",
                      padding: "14px 20px",
                      border: "none",
                      background: "white",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "14px",
                      cursor: "pointer",
                      borderTop: idx === 0 ? "none" : "1px solid #f3f4f6",
                    }}
                    onClick={() => router.push(item.href)}
                  >
                    <span>{item.label}</span>
                    <span style={{ fontSize: "18px" }}>›</span>
                  </button>
                ))}
              </section>
            </div>
          ) : (
            <>
              {/* 로그인 전 화면 */}
              <section
                style={{
                  textAlign: "center",
                  marginBottom: "40px",
                  width: "100%",
                  maxWidth: "520px",
                }}
              >
                <h1
                  style={{
                    fontSize: "40px",
                    fontWeight: 700,
                    marginBottom: "10px",
                  }}
                >
                  신차 살 땐,{" "}
                  <span style={{ color: "#0052FF" }}>ALPHACAR</span>
                </h1>
                <p
                  style={{
                    fontSize: "18px",
                    color: "#555",
                    marginBottom: "28px",
                  }}
                >
                  알파카 회원가입하면 1억포인트를 드려요
                </p>

                <button
                  type="button"
                  onClick={handleLoginClick}
                  style={{
                    width: "340px",
                    height: "56px",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: "#111",
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  로그인/회원가입
                </button>

                <div
                  style={{
                    marginTop: "24px",
                    width: "100%",
                    height: "2px",
                    backgroundColor: "#111",
                  }}
                />
              </section>
            </>
          )}
        </main>
      </div>

      <SimpleModal
        open={showWelcomeModal}
        title="ALPHACAR"
        message={`${welcomeName}님 환영합니다!`}
        confirmText="확인"
	cancelText=""
        onConfirm={() => setShowWelcomeModal(false)}
        onCancel={() => setShowWelcomeModal(false)}
      />

      <SimpleModal
        open={showLogoutModal}
        title="로그아웃"
        message="로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}

// ---------------------------------------------------------
// 2️⃣ [핵심] Suspense로 감싼 메인 페이지 컴포넌트
// ---------------------------------------------------------
export default function MyPage() {
  return (
    // ✨ useSearchParams를 쓰는 컴포넌트를 Suspense로 감싸야 빌드 에러가 해결됨
    <Suspense fallback={<div style={{ padding: "60px" }}>로딩 중...</div>}>
      <MyPageContent />
    </Suspense>
  );
}
