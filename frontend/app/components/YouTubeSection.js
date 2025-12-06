// app/components/YouTubeSection.js
"use client";

import { useState } from "react";

export default function YouTubeSection() {
  const videos = [
    { id: "4kDcpiwbCzs", title: "자동차 추천 영상 1", channel: "알파카" },
    { id: "KLHeBwP0G3U", title: "자동차 추천 영상 2", channel: "알파카" },
    { id: "rK6309nVBpI", title: "자동차 추천 영상 3", channel: "알파카" },
    { id: "g8_ug3SyDrc", title: "자동차 추천 영상 4", channel: "알파카" },
  ];

  // ▶ 클릭하면 크게 띄울 영상 상태
  const [activeVideo, setActiveVideo] = useState(null);

  const handleOpen = (video) => {
    setActiveVideo(video);
  };

  const handleClose = () => {
    setActiveVideo(null);
  };

  return (
    <>
      {/* 🔹 아래쪽 유튜브 영역 */}
      <section
        style={{
          padding: "60px 0 80px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px",
          }}
        >
          {/* 제목 */}
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              textAlign: "center",
              marginBottom: "40px",
            }}
          >
            알파카 오늘의 추천 영상을 확인해 보세요
          </h2>

          {/* 카드 4개 가로 배치 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "24px",
            }}
          >
            {videos.map((video) => (
              <button
                key={video.id}
                type="button"
                onClick={() => handleOpen(video)}
                style={{
                  textAlign: "left",
                  textDecoration: "none",
                  color: "#111",
                  border: "none",
                  background: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                {/* 썸네일 + 플레이 아이콘 */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    borderRadius: "12px",
                    overflow: "hidden",
                    marginBottom: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                    position: "relative",
                    backgroundColor: "#000",
                  }}
                >
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  {/* 재생 아이콘 오버레이 */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0.1))",
                    }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 0,
                          height: 0,
                          borderTop: "9px solid transparent",
                          borderBottom: "9px solid transparent",
                          borderLeft: "14px solid #fff",
                          marginLeft: "3px",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 제목 */}
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    lineHeight: "1.5",
                    marginBottom: "6px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {video.title}
                </div>

                {/* 채널명 */}
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  {video.channel}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 🔹 클릭 시 크게 나오는 임베드 팝업 */}
      {activeVideo && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()} // 안쪽 클릭하면 닫히지 않도록
            style={{
              position: "relative",
              width: "90%",
              maxWidth: "900px", // 👉 여기서 영상 크게
              aspectRatio: "16 / 9",
              backgroundColor: "#000",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            }}
          >
            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 10,
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "#fff",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            {/* 큰 임베드 플레이어 */}
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
              title={activeVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                display: "block",
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

