// app/community/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchCommunityPosts } from "@/lib/api";
import { STATIC_NOTICES } from "./staticNotices";

const TABS = [
  { key: "all", label: "전체" },
  { key: "buy", label: "구매 고민" },
  { key: "review", label: "오너 리뷰" },
];

const ITEMS_PER_PAGE = 10; // 한 페이지 최대 10개

export default function CommunityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ 게시글 + 고정 공지 로딩
  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await fetchCommunityPosts();
        const backendPosts = data?.posts ?? [];

        // 1) 백엔드 글: 최신순 정렬 + 카테고리 정리
        const dynamicPosts = backendPosts
          .slice()
          .sort((a, b) => b.id - a.id)
          .map((post) => {
            let categoryKey = "etc";
            if (post.category === "구매 고민") categoryKey = "buy";
            if (post.category === "오너 리뷰") categoryKey = "review";

            const isNotice = post.category === "공지" || categoryKey === "notice";

            return {
              ...post,
              categoryKey: isNotice ? "notice" : categoryKey,
              categoryText: isNotice ? "" : post.category,
              type: isNotice ? "공지" : "일반",
            };
          });

        // 2) 고정 공지 2개를 맨 위에 추가
        const staticNoticePosts = STATIC_NOTICES.map((notice) => ({
          ...notice,
          categoryKey: "notice",
          categoryText: "",
          type: "공지",
          isStaticNotice: true,
        }));

        // 3) 최종 목록: 공지 → 일반 글
        setPosts([...staticNoticePosts, ...dynamicPosts]);
      } catch (error) {
        console.error("게시글 목록 로딩 실패:", error);
      }
    }
    loadPosts();
  }, []);

  const handleWriteClick = () => {
    router.push("/community/write");
  };

  // 탭/검색 바뀌면 1페이지로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchText, posts.length]);

  // ✅ 필터링
  const filtered = posts.filter((post) => {
    if (activeTab === "buy" && post.categoryKey !== "buy") return false;
    if (activeTab === "review" && post.categoryKey !== "review") return false;

    if (searchText.trim()) {
      const keyword = searchText.trim();
      // 제목 + 내용 둘 다 검색
      const target = `${post.title ?? ""} ${post.content ?? ""}`;
      if (!target.includes(keyword)) return false;
    }
    return true;
  });

  // ✅ 페이지 계산
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pagePosts = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // 현재 페이지에서 보여줄 No. 번호 다시 매기기
  const numberedPosts = pagePosts.map((post, index) => ({
    ...post,
    no: startIndex + index + 1,
  }));

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
          {/* 상단 제목 영역 */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
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
                커뮤니티
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: "#777",
                }}
              >
                알파카의 최신 소식을 알려드려요
              </p>
            </div>

            {/* 글쓰기 버튼 */}
            <button
              type="button"
              onClick={handleWriteClick}
              style={{
                padding: "10px 20px",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "#111827",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              글쓰기
            </button>
          </header>

          {/* 탭 메뉴 */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "20px",
              fontSize: "13px",
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border:
                    activeTab === tab.key
                      ? "1px solid #111827"
                      : "1px solid #e5e7eb",
                  backgroundColor:
                    activeTab === tab.key ? "#111827" : "#ffffff",
                  color: activeTab === tab.key ? "#ffffff" : "#4b5563",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 상단: 총 건수 + 검색 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
              fontSize: "13px",
            }}
          >
            <div>
              총 <span style={{ fontWeight: 600 }}>{filtered.length}건</span>
            </div>

            {/* 검색창 */}
            <div
              style={{
                position: "relative",
                width: "260px",
                height: "32px",
              }}
            >
              <input
                type="text"
                placeholder="검색할 내용을 입력해 보세요"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  padding: "0 32px 0 10px",
                  fontSize: "12px",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "14px",
                  color: "#9ca3af",
                }}
              >
                🔍
              </span>
            </div>
          </div>

          {/* 테이블 헤더 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 140px",
              padding: "10px 12px",
              borderTop: "2px solid #111827",
              borderBottom: "1px solid #e5e7eb",
              fontSize: "13px",
              fontWeight: 600,
              backgroundColor: "#f9fafb",
            }}
          >
            <div>No.</div>
            <div>제목</div>
            <div>등록일</div>
          </div>

          {/* 게시글 목록 */}
          {numberedPosts.length > 0 ? (
            numberedPosts.map((post) => (
              <div
                key={post.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 140px",
                  padding: "12px",
                  borderBottom: "1px solid #f3f4f6",
                  fontSize: "13px",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => router.push(`/community/${post.id}`)}
              >
                <div style={{ color: "#6b7280" }}>{post.no}</div>

                <div>
                  {/* 공지 배지 / 일반 카테고리 배지 */}
                  {post.type === "공지" ? (
                    <span
                      style={{
                        display: "inline-block",
                        marginRight: "6px",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        border: "1px solid #2563eb",
                        color: "#2563eb",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      공지
                    </span>
                  ) : (
                    post.categoryText && (
                      <span
                        style={{
                          display: "inline-block",
                          marginRight: "6px",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          backgroundColor: "#f3f4ff",
                          color: "#4b5563",
                          fontSize: "11px",
                        }}
                      >
                        {post.categoryText}
                      </span>
                    )
                  )}

                  <span>{post.title}</span>
                </div>

                <div style={{ color: "#6b7280" }}>
                  {post.date || post.createdAt}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "60px 0",
                textAlign: "center",
                fontSize: "14px",
                color: "#9ca3af",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              등록된 게시글이 없습니다.
            </div>
          )}

          {/* 페이지네이션 */}
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              justifyContent: "center",
              gap: "6px",
              fontSize: "13px",
            }}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                style={{
                  minWidth: "28px",
                  height: "28px",
                  borderRadius: "4px",
                  border:
                    page === safePage
                      ? "1px solid #111827"
                      : "1px solid #e5e7eb",
                  backgroundColor:
                    page === safePage ? "#111827" : "#ffffff",
                  color: page === safePage ? "#ffffff" : "#4b5563",
                  cursor: "pointer",
                }}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
