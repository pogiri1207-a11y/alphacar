// app/drive/[id]/page.js
import Link from "next/link";
import { DRIVE_COURSES } from "../driveData";

export default function DriveDetailPage({ params }) {
  const { id } = params;

  // id는 문자열로 오기 때문에 숫자로 변환해서 비교
  const numericId = Number(id);
  const course = DRIVE_COURSES.find((c) => c.id === numericId);

  if (!course) {
    return (
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          backgroundColor: "white",
          padding: "32px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <p>해당 드라이브 코스를 찾을 수 없습니다.</p>
        <Link href="/drive" style={{ color: "#1890ff" }}>
          ← 드라이브 코스 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        backgroundColor: "white",
        padding: "32px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* 상단 코스 제목 배지 */}
      <div
        style={{
          display: "inline-block",
          padding: "6px 14px",
          borderRadius: "999px",
          backgroundColor: "#444",
          color: "white",
          fontSize: "13px",
          marginBottom: "16px",
        }}
      >
        {course.id}. {course.title}
      </div>

      {/* 제목 + 드라이브 시작 버튼 */}
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {course.subtitle}
        </h2>

        <button
          style={{
            borderRadius: "999px",
            border: "1px solid #1890ff",
            backgroundColor: "white",
            color: "#1890ff",
            fontSize: "13px",
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          드라이브 시작
        </button>
      </div>

      {/* 지역 / 거리 / 소요 시간 정보 */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          fontSize: "13px",
          color: "#555",
          marginBottom: "12px",
        }}
      >
        <span>지역: <b>{course.region}</b></span>
        <span>거리: <b>{course.distance}</b></span>
        <span>소요 시간: <b>{course.duration}</b></span>
      </div>

      {/* 설명 박스 */}
      <div
        style={{
          borderRadius: "16px",
          border: "1px solid #eee",
          padding: "20px",
          marginBottom: "24px",
          fontSize: "14px",
          lineHeight: 1.6,
        }}
      >
        {course.description.split("\n").map((line, idx) => (
          <p key={idx} style={{ margin: "0 0 4px 0" }}>
            {line}
          </p>
        ))}
      </div>

      {/* 유튜브 쇼츠 영역 */}
      <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>유튜브 쇼츠</h3>
      <p style={{ fontSize: "12px", color: "#777", marginBottom: "12px" }}>
        실제 프로젝트에서는 각 코스에 맞는 유튜브 쇼츠 URL을 저장해두고,
        아래 카드들을 클릭하면 새 탭에서 쇼츠가 열리게 할 수 있습니다.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {course.shorts.map((url, idx) => (
          <a
            key={idx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              borderRadius: "12px",
              border: "1px solid #eee",
              padding: "10px",
              textDecoration: "none",
              backgroundColor: "#fafafa",
              fontSize: "13px",
              color: "#333",
            }}
          >
            <div style={{ marginBottom: "6px", fontWeight: "bold" }}>
              Shorts #{idx + 1}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#777",
                wordBreak: "break-all",
              }}
            >
              {url}
            </div>
          </a>
        ))}
      </div>

      {/* 목록으로 돌아가기 */}
      <div style={{ marginTop: "24px" }}>
        <Link href="/drive" style={{ color: "#1890ff", fontSize: "13px" }}>
          ← 드라이브 코스 목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
