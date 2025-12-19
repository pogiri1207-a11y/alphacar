// app/community/write/page.js
"use client";

import { useState, useEffect } from "react"; // 👈 [수정] useEffect 추가
import { useRouter } from "next/navigation";
import { createCommunityPost, fetchMypageInfo } from "@/lib/api";

export default function CommunityWritePage() {
  const router = useRouter();

  const [category, setCategory] = useState("구매 고민");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState(""); // 작성자 상태 추가
  const [userId, setUserId] = useState(null); // 👈 [추가] userId 상태 추가

  // ✅ 수정된 useEffect: localStorage 대신 API 호출
  useEffect(() => {
    async function getUserInfo() {
      try {
        // 백엔드에 "나 누구야?" 하고 물어봄 (DB에서 조회)
        const data = await fetchMypageInfo();

        if (data && data.isLoggedIn && data.user) {
          // DB에 저장된 닉네임(또는 이름)을 가져와서 설정
          // users 테이블 컬럼명에 따라 data.user.nickname 또는 data.user.name 사용
          setAuthor(data.user.nickname || data.user.name || "익명");
	  setUserId(data.user.id); // 👈 [추가] 유저 ID 저장
        } else {
          alert("로그인이 필요한 서비스입니다.");
          router.push("/mypage/login");
        }
      } catch (error) {
        console.error("사용자 정보 로딩 실패:", error);
        alert("로그인 정보를 불러올 수 없습니다.");
        //router.push("/mypage/login");
      }
    }

    getUserInfo();
  }, [router]);

  // 👇 백엔드 연동을 위한 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("제목을 입력해 주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해 주세요.");
      return;
    }
    // 🚨 [추가] 유저 ID가 없으면 등록 불가
    if (!userId) {
        alert("사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
        return;
    }

    try {
      // 백엔드 API 호출 (DB 저장 요청)
      await createCommunityPost({
        category, // "구매 고민" or "오너 리뷰"
        title,
        content,
        author: author,
	userId: userId,
      });

      // 성공 시 처리
      alert("글이 등록되었습니다.");
      router.push("/community");
    } catch (error) {
      console.error("글 등록 실패:", error);
      alert("글 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleCancel = () => {
    if (confirm("작성 중인 내용이 사라집니다. 돌아가시겠습니까?")) {
      router.push("/community");
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 16px 80px",
      }}
    >
      <main>
        <div
          style={{
            borderRadius: "18px",
            backgroundColor: "#fff",
            boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
            padding: "28px 32px 32px",
          }}
        >
          {/* 상단 제목 + 버튼들 */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                글쓰기
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: "#777",
                }}
              >
                커뮤니티에 질문이나 후기를 남겨주세요.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#fff",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              목록으로
            </button>
          </header>

          {/* 글쓰기 폼 */}
          <form onSubmit={handleSubmit}>
            {/* 카테고리 */}
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "200px",
                  height: "36px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  padding: "0 10px",
                }}
              >
                <option>구매 고민</option>
                <option>오너 리뷰</option>
              </select>
            </div>

            {/* 제목 */}
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력해 주세요"
                style={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  padding: "0 10px",
                }}
              />
            </div>

            {/* 내용 */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력해 주세요"
                rows={10}
                style={{
                  width: "100%",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  padding: "10px",
                  resize: "vertical",
                }}
              />
            </div>

            {/* 버튼 영역 */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  minWidth: "80px",
                  height: "40px",
                  borderRadius: "999px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#fff",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                type="submit"
                style={{
                  minWidth: "80px",
                  height: "40px",
                  borderRadius: "999px",
                  border: "none",
                  backgroundColor: "#111827",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                등록
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
