// app/LeftAdBanner.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// 👉 화면 가로폭이 1700px 미만이면 배너 숨김 (기존 유지)
const HIDE_WIDTH = 1700;

export default function LeftAdBanner() {
  const [isHidden, setIsHidden] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsHidden(window.innerWidth < HIDE_WIDTH);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isHidden || pathname === "/space-game") return null;

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        marginLeft: "-860px", // (기존 유지) 가로 위치 조절
        
        // 👉 [수정 포인트] 세로 위치 조절
        top: "50%", // 화면 세로 중앙을 기준으로 잡고
        // transform: "translateY(-50%)", // ← 이 줄을 지우거나 주석 처리합니다. (완전 중앙 정렬 해제)
        marginTop: "-70px", // ← 중앙 지점에서 80px 만큼 아래로 내립니다.
        
        zIndex: 40,
      }}
    >
      <Link
        href="/space-game"
        style={{ display: "block", textDecoration: "none" }}
      >
        <div
          style={{
            width: "210px",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            cursor: "pointer",
            fontSize: "0",
          }}
        >
          <img
            src="/ad/space-trip-banner.png"
            alt="알파카 타고 우주 여행"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
            }}
          />
        </div>
      </Link>
    </div>
  );
}
