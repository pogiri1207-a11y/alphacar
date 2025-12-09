// app/components/Footer.tsx
export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "60px",
        backgroundColor: "#ffffff",
        borderTop: "1px solid #dcdcdc",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px 24px",
        }}
      >
        {/* 상단 공지사항 라인 */}
        <div
          style={{
            height: "48px",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #dcdcdc",
            fontSize: "14px",
            color: "#555",
          }}
        >
          <span>공지사항</span>
        </div>

        {/* 메인 영역 */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "24px",
            paddingTop: "24px",
          }}
        >
          {/* 왼쪽: 알파카 차 로고 이미지 */}
          <div style={{ flexShrink: 0 }}>
            <img
              src="/footer/footer_logo.png"
              alt="ALPHACAR 로고"
              style={{ width: "220px", height: "auto", display: "block" }}
            />
          </div>

          {/* 가운데: 전화번호 + 회사 정보 */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            {/* 상단: 서비스명 + 전화번호 / 상담 안내 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "40px",
              }}
            >
              {/* 왼쪽: 알파카 / 1588-0000 */}
              <div>
                <div
                  style={{
                    fontSize: "15px",
                    color: "#333",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}
                >
                  알파카
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    letterSpacing: "1px",
                  }}
                >
                  1588-0000
                </div>
              </div>

              {/* 오른쪽: 상담시간 / 메일 */}
              <div
                style={{
                  fontSize: "13px",
                  color: "#555",
                  lineHeight: "1.6",
                  whiteSpace: "pre-line",
                  marginTop: "24px",
                }}
              >
                상담시간: 24시간 챗봇상담 가능{"\n"}
                사업제휴 문의: ALPHACAR@dzplus.co.kr{"\n"}
                마케팅 문의: ALPHACAR@dzplus.co.kr
              </div>
            </div>

            {/* 이용약관 링크 라인 */}
            <div
              style={{
                marginTop: "18px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                fontSize: "13px",
                color: "#444",
              }}
            >
              <span>회사소개</span>
              <span>|</span>
              <span>이용약관</span>
              <span>|</span>
              <span>개인정보처리방침</span>
              <span>|</span>
              <span>윤리경영</span>
            </div>

            {/* 회사 정보 */}
            <div
              style={{
                marginTop: "10px",
                fontSize: "13px",
                color: "#666",
                lineHeight: "1.6",
              }}
            >
              알파카플러스(주) 대표자: 김도훈 사업자등록번호: 105-00-00000
              <br />
              주소: 종로구 인사동길 12 대일빌딩
            </div>

            {/* 카피라이트 */}
            <div
              style={{
                marginTop: "10px",
                fontSize: "12px",
                color: "#999",
              }}
            >
              Copyright © 2024 by Nungjang Co Ltd. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


