// app/components/LoginStatus.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const router = useRouter();

  // 처음 마운트될 때 localStorage 보고 로그인 여부 판단
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 👉 이미 저장돼 있을 법한 키들 몇 개 같이 체크
    const flag = localStorage.getItem("alphacar_isLoggedIn");
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("alphacar_access_token");

    if (flag === "true" || token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 로그인 상태면 → 로그아웃 처리
    if (isLoggedIn) {
      e.preventDefault();

      // 로그인 정보 삭제 (있을 법한 키들 전부 제거)
      localStorage.removeItem("alphacar_isLoggedIn");
      localStorage.removeItem("alphacar_user_name");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("alphacar_access_token");
      localStorage.removeItem("alphacar_refresh_token");
      localStorage.removeItem("userName");

      alert("로그아웃 되었습니다.");
      setIsLoggedIn(false);
      router.push("/");
      router.refresh?.();
      return;
    }

    // 로그인 상태가 아니면 → 로그인 페이지로 이동
    router.push("/mypage/login");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        border: "none",
        background: "none",
        padding: 0,
        cursor: "pointer",
        fontSize: "13px",
      }}
    >
      {isLoggedIn ? "로그아웃" : "로그인"}
    </button>
  );
}


