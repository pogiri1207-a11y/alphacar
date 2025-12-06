// app/layout.js
import "./globals.css";
import AiChatButton from "./AICHAT/AiChatButton";
import LeftAdBanner from "./LeftAdBanner";
import Footer from "./components/Footer";
import RightSideBar from "./RightSideBar";
import GlobalHeader from "./components/GlobalHeader";  // ✅ 이것만 유지
import LoginStatus from "./components/LoginStatus";

export const metadata = {
  title: "ALPHACAR",
  description: "ALPHACAR 차량 가격 비교 서비스",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, backgroundColor: "#ffffff" }}>
        {/* 🔹 새 GNB */}
        <GlobalHeader />

        <main
          style={{
            padding: "24px 32px",
            minHeight: "calc(100vh - 80px)",
            backgroundColor: "#ffffff",
          }}
        >
          {children}
        </main>

        <RightSideBar />
        <AiChatButton />
        <LeftAdBanner />
        <Footer />
      </body>
    </html>
  );
}

