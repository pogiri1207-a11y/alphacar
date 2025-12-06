// app/components/GlobalHeader.js
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SimpleModal from "./SimpleModal";

export default function GlobalHeader() {
  const pathname = usePathname(); // 라우트 변경 감지용

  // 🔹 localStorage에서 userName 읽어오는 공통 함수
  const readUserNameFromStorage = () => {
    if (typeof window === "undefined") return null;

    const raw = window.localStorage.getItem("alphacarUser");
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      const nickname =
        parsed.nickname ||
        parsed.name ||
        parsed.id ||
        parsed.socialId ||
        parsed.social_id ||
        "ALPHACAR회원";

      return nickname;
    } catch (e) {
      console.error("alphacarUser 파싱 실패:", e);
      return null;
    }
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState(() => readUserNameFromStorage());
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  // 🔹 실제 로그아웃 실행 (모달에서 "로그아웃" 클릭 시)
  const handleLogoutConfirm = () => {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem("alphacarUser");
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("alphacar_user_id");
    window.localStorage.removeItem("user_social_id");

    setUserName(null);
    setShowLogoutModal(false);

    window.location.href = "/";
  };

  // 🔹 pathname 바뀔 때마다 메뉴 닫고, 로그인 정보 다시 읽기
  useEffect(() => {
    setIsMenuOpen(false);

    const nameFromStorage = readUserNameFromStorage();
    setUserName(nameFromStorage);
  }, [pathname]);

  const HEADER_HEIGHT = 88; // fixed 헤더 높이
  const isLoggedIn = !!userName;
  // 마이페이지에서는 무조건 로그아웃 보여주기
  const shouldShowLogout = isLoggedIn || pathname?.startsWith("/mypage");

  // 상단 GNB active 체크용
  const isTopActive = (target) =>
    pathname === target || pathname?.startsWith(target);

  return (
    <>
      {/* 고정 헤더 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 100,
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
        }}
      >
        {/* 상단: 로그인 / 고객센터 라인 */}
        <div
          style={{
            borderBottom: "1px solid #f2f2f2",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "6px 24px",
              fontSize: "13px",
              color: "#666",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            {/* 🔹 로그인 상태 + 마이페이지에서는 무조건 로그아웃 */}
            {shouldShowLogout ? (
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  margin: 0,
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#666",
                }}
              >
                로그아웃
              </button>
            ) : (
              <a href="https://192.168.0.160.nip.io:8000/mypage/login">
                로그인
              </a>
            )}

            <span style={{ color: "#ddd" }}>|</span>
            {/* 🔹 회원가입 대신 고객센터 */}
            <Link href="/consult">고객센터</Link>
          </div>
        </div>

        {/* 메인 GNB 라인 */}
        <div
          style={{
            borderBottom: "1px solid #ddd",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* 왼쪽: 로고 + (메뉴 / 로그인텍스트 전환 영역) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "28px",
              }}
            >
              {/* ALPHACAR 로고 (글씨 더 큼 + 진하게) */}
              <Link
                href="/"
                style={{ textDecoration: "none", color: "#111827" }}
              >
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: 900,
                    letterSpacing: "1px",
                  }}
                >
                  ALPHACAR
                </span>
              </Link>

              {/* 이 영역에서 메뉴/로그인텍스트 전환 */}
              <div
                style={{
                  position: "relative",
                  minWidth: "260px",
                  height: "22px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {/* 전체메뉴 열린 상태: 로그인/환영 문구 */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    color: isLoggedIn ? "#111" : "#0070f3",
                    fontWeight: 400,
                    cursor: isLoggedIn ? "default" : "pointer",
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen
                      ? "translateY(0)"
                      : "translateY(-4px)",
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                    pointerEvents: isMenuOpen ? "auto" : "none",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => {
                    if (!isLoggedIn) {
                      window.location.href =
                        "https://192.168.0.160.nip.io:8000/mypage/login";
                    }
                  }}
                >
                  {isLoggedIn ? (
                    <>
                      <span
                        style={{
                          fontWeight: 800,
                          color: "#111",
                          marginRight: "4px",
                        }}
                      >
                        {userName}
                      </span>
                      <span
                        style={{
                          fontWeight: 400,
                          color: "#777",
                        }}
                      >
                        님 안녕하세요
                      </span>
                    </>
                  ) : (
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#0070f3",
                      }}
                    >
                      로그인 해주세요
                    </span>
                  )}
                </div>

                {/* 전체메뉴 닫힌 상태: 견적 비교 / 소식 / 커뮤니티 */}
                <nav
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    fontSize: "15px",
                    color: "#222",
                    fontWeight: 700,
                    opacity: isMenuOpen ? 0 : 1,
                    transform: isMenuOpen
                      ? "translateY(4px)"
                      : "translateY(0)",
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                    pointerEvents: isMenuOpen ? "none" : "auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Link
                    href="/quote"
                    className={
                      "gnb-link" +
                      (isTopActive("/quote") ? " gnb-link-active" : "")
                    }
                  >
                    견적 비교
                  </Link>
                  <Link
                    href="/news"
                    className={
                      "gnb-link" +
                      (isTopActive("/news") ? " gnb-link-active" : "")
                    }
                  >
                    소식
                  </Link>
                  <Link
                    href="/community"
                    className={
                      "gnb-link" +
                      (isTopActive("/community") ? " gnb-link-active" : "")
                    }
                  >
                    커뮤니티
                  </Link>
                </nav>
              </div>
            </div>

            {/* 오른쪽: 전체메뉴 버튼 */}
            <button
              type="button"
              onClick={toggleMenu}
              style={{
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                fontSize: "15px",
                color: "#111111",
                fontWeight: 500,
              }}
            >
              <span>전체메뉴</span>
              <span
                style={{
                  fontSize: "22px",
                  lineHeight: 1,
                  color: "#111",
                }}
              >
                {isMenuOpen ? "✕" : "≡"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 전체메뉴 펼침 영역 */}
      {isMenuOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: "fixed",
            inset: 0,
            top: 0,
            left: 0,
            zIndex: 90,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mega-panel"
            style={{
              marginTop: HEADER_HEIGHT,
              width: "100%",
              borderBottom: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div
              style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "24px 24px 32px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                fontSize: "14px",
              }}
            >
              {/* 1행: 견적비교 / 소식 / 커뮤니티 / 이벤트 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: "32px",
                  marginTop: "4px",
                }}
              >
                <MenuColumn
                  title="견적비교"
                  titleHref="/quote"
                  items={[
                    { label: "비교견적", href: "/quote/compare" },
                    { label: "개별견적", href: "/quote/personal" },
                  ]}
                />
                <MenuColumn
                  title="소식"
                  titleHref="/news"
                  items={[
                    { label: "핫이슈", href: "/news/hot" },
                    { label: "내차와의 데이터", href: "/news/data" },
                    { label: "시승기", href: "/news/review" },
                    { label: "시승신청하기", href: "/news/test-drive" },
                  ]}
                />
                <MenuColumn
                  title="커뮤니티"
                  titleHref="/community"
                  items={[
                    { label: "구매고민", href: "/community" },
                    { label: "오너리뷰", href: "/community" },
                  ]}
                />
                <MenuColumn
                  title="이벤트"
                  titleHref="/event"
                  items={[
                    { label: "진행중 이벤트", href: "/event" },
                    { label: "종료된 이벤트", href: "/event/closed" },
                  ]}
                />
              </div>

              {/* 2행: 마이페이지 / 상담 / 혜택 / 고객센터 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: "32px",
                }}
              >
                <MenuColumn
                  title="마이페이지"
                  titleHref="/mypage"
                  items={[
                    { label: "견적함", href: "/mypage/quotes" },
                    { label: "포인트", href: "/mypage/points" },
                  ]}
                />
                <MenuColumn
                  title="상담"
                  titleHref="/consult"
                  items={[{ label: "1:1 상담신청", href: "/consult" }]}
                />
                <MenuColumn
                  title="혜택"
                  titleHref="/benefit"
                  items={[
                    { label: "캐시백", href: "/cashback" },
                    { label: "ALPHACAR가이드", href: "/benefit" },
                  ]}
                />

                <div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      marginBottom: "8px",
                    }}
                  >
                    고객센터
                  </div>
                  <div
                    style={{
                      height: "2px",
                      backgroundColor: "#bdbdbd",
                      marginBottom: "12px",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#888",
                      marginBottom: "4px",
                    }}
                  >
                    고객센터
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                    }}
                  >
                    1588-0000
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* fixed 헤더 여백 */}
      <div style={{ height: HEADER_HEIGHT }} />

      {/* 🔹 로그아웃 확인 모달 */}
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

/* 공통 메뉴 컬럼 */
function MenuColumn({ title, items, titleHref }) {
  const titleNode = titleHref ? (
    <Link
      href={titleHref}
      style={{
        textDecoration: "none",
        color: "#111",
        cursor: "pointer",
      }}
    >
      {title}
    </Link>
  ) : (
    title
  );

  return (
    <div>
      <div
        style={{
          fontSize: "16px",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        {titleNode}
      </div>
      <div
        style={{
          height: "2px",
          backgroundColor: "#bdbdbd",
          marginBottom: "12px",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            style={{
              textDecoration: "none",
              color: "#444",
              fontSize: "14px",
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

