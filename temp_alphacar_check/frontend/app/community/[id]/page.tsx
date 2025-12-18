// app/community/[id]/page.js
"use client";

import { useEffect, useState, CSSProperties } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchCommunityPosts } from "@/lib/api";
import { STATIC_NOTICES } from "../staticNotices";

const NOTICE_EXTEND_ID = "notice-extend-2025-12-01";
const NOTICE_REFUND_ID = "notice-refund-2025-12-01";

// 공통 표 스타일
const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "24px",
  fontSize: "13px",
};
const thTdStyle = {
  border: "1px solid #e5e7eb",
  padding: "10px 12px",
  verticalAlign: "top",
  lineHeight: 1.7,
};

/* =========================
   1. 공지 본문 컴포넌트들
   ========================= */

// 연장보증 서비스 약관 공지
function ExtendNoticeBody() {
  return (
    <div>
      {/* 인사말 + 안내문 */}
      <div
        style={{
          fontSize: "14px",
          lineHeight: 1.8,
          marginBottom: "24px",
          whiteSpace: "pre-line",
        }}
      >
        {`연장보증 서비스 약관 개정 안내

안녕하세요. 알파카입니다.
항상 알파카를 이용해주셔서 감사합니다.

2025년 12월 1일부로 알파카 연장보증 서비스 약관이 다음과 같이 개정되어 변경 내용을 공지하오니, 이용에 참고하시기 바랍니다.`}
      </div>

      {/* 개정 조항 제목 */}
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "8px",
        }}
      >
        개정 조항 및 개정 사유
      </h3>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "13px",
          marginBottom: "16px",
        }}
      >
        <div>
          제9조 (가입 철회 및 환불)
          <br />- 부분 환불 계산식 변경
        </div>
        <div style={{ color: "#6b7280" }}>
          * 기준일시 : 2025년 12월 1일, 00:00
        </div>
      </div>

      {/* 표: 개정 전 / 개정 후 */}
      <table style={tableStyle}>
        <thead>
          <tr style={{ backgroundColor: "#f9fafb" }}>
            <th style={{ ...thTdStyle, width: "22%" }}>구분</th>
            <th style={{ ...thTdStyle, width: "39%" }}>개정 전</th>
            <th style={{ ...thTdStyle, width: "39%" }}>개정 후</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={thTdStyle}>제9조 (가입 철회 및 환불)</td>
            <td style={thTdStyle}>
              서비스가 개시된 이후에는 기간을 불문하고 철회 및 환불이 불가합니다.
              다만, 구매확정 전이거나 서비스가 게시되기 전에는 다음 각호에 따라
              철회 및 환불이 가능합니다.
              <br />
              <br />
              ① 전액 환불
              <br />
              · 차량의 구매확정을 하지 않았을 경우에 한하여 전액 환불
              <br />
              · 단, 차량을 인도받은 이후 구매확정을 하지 않은 상태에서 사고가
              발생했을 경우에는 철회 및 환불이 불가합니다.
              <br />
              <br />
              ② 부분 환불
              <br />
              · 차량의 구매확정을 완료했으나, 서비스가 게시되지 않았을 경우에는
              보증 경과일수 만큼의 비용을 차감한 후 부분 환불합니다.
            </td>
            <td style={thTdStyle}>
              서비스가 개시된 이후에는 기간을 불문하고 철회 및 환불이 불가합니다.
              다만, 구매확정 전이거나 서비스가 게시되기 전에는 다음 각호에 따라
              철회 및 환불이 가능합니다.
              <br />
              <br />
              ① 전액 환불
              <br />
              · 차량의 구매확정을 하지 않았을 경우에 한하여 전액 환불
              <br />
              · 단, 차량을 인도받은 이후 구매확정을 하지 않은 상태에서 사고가
              발생했을 경우에는 철회 및 환불이 불가합니다.
              <br />
              <br />
              ② 부분 환불
              <br />
              · 차량의 구매확정을 완료했으나, 서비스가 게시되지 않았을 경우에는
              보증 경과일수 만큼의 비용을 차감한 후 부분 환불합니다.
              <br />
              · 부분 환불 계산식 예시 :{" "}
              <strong>구매금액 - (구매금액 / 보증기간) × 경과일수</strong>
              <br />
              · 환불은 철회 접수일 기준으로 7일 이내(영업일 기준) 처리해 드립니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// 환불 약관 공지
function RefundNoticeBody() {
  return (
    <div>
      {/* 인사말 + 안내문 */}
      <div
        style={{
          fontSize: "14px",
          lineHeight: 1.8,
          marginBottom: "24px",
          whiteSpace: "pre-line",
        }}
      >
        {`알파카 환불 약관 개정 안내

안녕하세요. 알파카입니다.
항상 알파카를 이용해주셔서 감사합니다.

2025년 12월 1일부로 알파카 환불 약관이 다음과 같이 개정되어 변경 내용을 공지하오니, 이용에 참고하시기 바랍니다.`}
      </div>

      {/* 개정 조항 제목 */}
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "8px",
        }}
      >
        개정 조항 및 개정 사유
      </h3>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "13px",
          marginBottom: "16px",
        }}
      >
        <div>
          제3조 (환불 처리 기준 및 규정)
          <br />- 성능·상태점검책임보험료 항목 삭제
        </div>
        <div style={{ color: "#6b7280" }}>
          * 기준일시 : 2025년 12월 1일, 00:00
        </div>
      </div>

      {/* 표: 개정 전 / 개정 후 */}
      <table style={tableStyle}>
        <thead>
          <tr style={{ backgroundColor: "#f9fafb" }}>
            <th style={{ ...thTdStyle, width: "22%" }}>구분</th>
            <th style={{ ...thTdStyle, width: "39%" }}>개정 전</th>
            <th style={{ ...thTdStyle, width: "39%" }}>개정 후</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={thTdStyle}>제3조 (환불 처리 기준 및 규정)</td>
            <td style={thTdStyle}>
              ① 구매자는 차량을 인수한 시점과 동일한 상태를 유지해야 합니다. 출고
              전 차량 체크리스트를 기준으로 차량의 전부 또는 부분에 이상이 있을
              경우 환불이 불가능합니다.
              <br />
              ② 구매자가 차량 전부의 환불을 요청하는 경우 회사가 구매자에게
              환불하는 대금의 범위는 다음 각 호와 같습니다.
              <br />
              1. 차량 대금
              <br />
              2. 선택형 각종 옵션 비용, 선택형 편의 옵션 비용
              <br />
              3. 차량 관리비(예: 등록 대행 수수료 등)
              <br />
              4. 알파카 연장보증 서비스 가입비(서비스 가입 차량에 한함)
              <br />
              5. 이미 납부한 각종 세금 및 공과금
              <br />
              6. 성능·상태점검책임보험료
            </td>
            <td style={thTdStyle}>
              ① 구매자는 차량을 인수한 시점과 동일한 상태를 유지해야 합니다. 출고
              전 차량 체크리스트를 기준으로 차량의 전부 또는 부분에 이상이 있을
              경우 환불이 불가능합니다.
              <br />
              ② 구매자가 차량 전부의 환불을 요청하는 경우 회사가 구매자에게
              환불하는 대금의 범위는 다음 각 호와 같습니다.
              <br />
              1. 차량 대금
              <br />
              2. 선택형 각종 옵션 비용, 선택형 편의 옵션 비용
              <br />
              3. 차량 관리비(예: 등록 대행 수수료 등)
              <br />
              4. 알파카 연장보증 서비스 가입비(서비스 가입 차량에 한함)
              <br />
              5. 이미 납부한 각종 세금 및 공과금
              <br />
              <strong>※ 성능·상태점검책임보험료 항목 삭제</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// 공지 종류에 따라 어떤 본문을 쓸지 결정
function StaticNoticeBody({ noticeId }) {
  if (noticeId === NOTICE_EXTEND_ID) return <ExtendNoticeBody />;
  if (noticeId === NOTICE_REFUND_ID) return <RefundNoticeBody />;
  return null;
}

/* =========================
   2. 상세 페이지 컴포넌트
   ========================= */

export default function CommunityDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [prevPost, setPrevPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function loadPost() {
      try {
        // 1) 백엔드 글 가져오기
        const data = await fetchCommunityPosts();
        const backendPosts = data?.posts ?? [];

        const dynamicPosts = backendPosts
          .slice()
          .sort((a, b) => b.id - a.id) // 최신 id 먼저
          .map((p) => ({
            ...p,
            isStaticNotice: false,
          }));

        // 2) 고정 공지 2개를 맨 위에 추가
        const staticPosts = STATIC_NOTICES.map((notice) => ({
          ...notice,
          isStaticNotice: true,
          type: "공지",
        }));

        const allPosts = [...staticPosts, ...dynamicPosts];

        // 3) 현재 글 찾기
        const index = allPosts.findIndex(
          (p) => String(p.id) === String(id)
        );

        if (index === -1) {
          setErrorMsg("해당 게시글을 찾을 수 없습니다.");
        } else {
          const current = allPosts[index];
          setPost(current);

          // 이전글 = 리스트에서 아래쪽(= index+1)
          setPrevPost(index + 1 < allPosts.length ? allPosts[index + 1] : null);
          // 다음글 = 리스트에서 위쪽(= index-1)
          setNextPost(index - 1 >= 0 ? allPosts[index - 1] : null);
        }
      } catch (err) {
        console.error("게시글 상세 로딩 실패:", err);
        setErrorMsg("게시글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        불러오는 중…
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div
        style={{
          maxWidth: "960px",
          margin: "40px auto",
          padding: "0 16px",
        }}
      >
        <button
          onClick={() => router.push("/community")}
          style={{
            marginBottom: "16px",
            background: "#f3f4f6",
            padding: "8px 16px",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          ← 목록으로
        </button>
        <p style={{ color: "#ef4444" }}>{errorMsg}</p>
      </div>
    );
  }

  const footerRowStyle = {
    display: "flex",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "13px",
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "40px 16px 100px",
      }}
    >
      {/* 가운데 하얀 카드 */}
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "#ffffff",
          padding: "40px 50px",
          borderRadius: "12px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
        }}
      >
        {/* 🔼 상단 목록으로 버튼 (유지) */}
        <button
          onClick={() => router.push("/community")}
          style={{
            background: "#f3f4f6",
            padding: "8px 16px",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            marginBottom: "20px",
          }}
        >
          ← 목록으로
        </button>

        {/* 제목 */}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          {post.title}
        </h1>

        {/* 등록일 · 작성자 */}
        <div
          style={{
            fontSize: "13px",
            color: "#6b7280",
            marginBottom: "24px",
          }}
        >
          등록일 {post.date || post.createdAt}
          {post.author && ` · ${post.author}`}
        </div>

        {/* 구분선 */}
        <div
          style={{
            borderBottom: "1px solid #e5e7eb",
            marginBottom: "30px",
          }}
        />

        {/* 본문: 고정 공지는 커스텀 레이아웃, 일반 글은 텍스트 */}
        {post.isStaticNotice ? (
          <StaticNoticeBody noticeId={post.id} />
        ) : (
          <div
            style={{
              fontSize: "15px",
              lineHeight: 1.7,
              whiteSpace: "pre-line",
              color: "#111827",
            }}
          >
            {post.content}
          </div>
        )}

        {/* =========================
            하단 이전글 / 다음글 + 목록 버튼
           ========================= */}
        <div
          style={{
            marginTop: "40px",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "8px",
          }}
        >
          {/* 이전글 */}
          <div style={footerRowStyle}>
            <div
              style={{
                width: "70px",
                color: "#6b7280",
              }}
            >
              이전글
            </div>
            {prevPost ? (
              <button
                type="button"
                onClick={() => router.push(`/community/${prevPost.id}`)}
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                {prevPost.title}
              </button>
            ) : (
              <span style={{ color: "#9ca3af" }}>이전 글이 없습니다.</span>
            )}
          </div>

          {/* 다음글 */}
          <div style={footerRowStyle}>
            <div
              style={{
                width: "70px",
                color: "#6b7280",
              }}
            >
              다음글
            </div>
            {nextPost ? (
              <button
                type="button"
                onClick={() => router.push(`/community/${nextPost.id}`)}
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                {nextPost.title}
              </button>
            ) : (
              <span style={{ color: "#9ca3af" }}>다음 글이 없습니다.</span>
            )}
          </div>

          {/* 하단 중앙 목록 버튼 */}
          <div
            style={{
              marginTop: "24px",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              onClick={() => router.push("/community")}
              style={{
                minWidth: "120px",
                height: "40px",
                borderRadius: "999px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              목록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
