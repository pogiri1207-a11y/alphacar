// frontend/app/AICHAT/MascotLoader.js

"use client";

import React from 'react'; 

const styles = {
  videoWrapper: {
    width: '100%',
    // 🚨 [원래 크기] maxWidth: 200px
    maxWidth: '725px', 
    // 🚨 [원래 크기] height: 150px
    height: '770px', 
    display: 'flex', 
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  videoStyle: {
    width: '100%',
    height: '100%',
    objectFit: 'contain', // 영상 비율 유지
  },
};

export default function MascotLoader() {
  // 파일 이름과 형식은 MP4로 유지합니다.
  const videoUrl = "/videos/mascot-running-transparent.mp4"; 

  return (
    <div style={styles.videoWrapper}> 
      <video
        src={videoUrl}
        style={styles.videoStyle}
        autoPlay       // 자동 재생 (필수)
        loop         // 무한 반복 (필수)
        muted        // 음소거 (자동 재생을 위한 필수 조건)
        playsInline  // 모바일에서 인라인 재생 (전체화면 방지)
        type="video/mp4" // MP4 형식 지정
      >
        <p style={{color:'red', textAlign: 'center', fontSize: '12px'}}>
            영상 파일을 불러올 수 없습니다. 경로를 확인하세요.
        </p>
      </video>
    </div>
  );
}
