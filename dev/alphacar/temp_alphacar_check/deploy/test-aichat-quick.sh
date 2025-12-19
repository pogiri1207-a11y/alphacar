#!/bin/bash

# 빠른 테스트 스크립트 (코드 변경사항 확인용)

echo "🧪 AIChat 빠른 테스트"
echo ""

# 1. 헬스체크
echo "1️⃣ 헬스체크 테스트..."
curl -s http://localhost:4000/aichat | python3 -m json.tool 2>/dev/null || echo "❌ 서버 연결 실패"
echo ""

# 2. 텍스트 채팅 테스트 (사용자 이름 포함 확인)
echo "2️⃣ 텍스트 채팅 테스트 (사용자 이름 포함 확인)..."
RESPONSE=$(curl -s -X POST http://localhost:4000/chat/ask \
  -H "Content-Type: application/json" \
  -H "x-social-id: test-social-id-123" \
  -d '{"message": "안녕"}')

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# 사용자 이름 포함 여부 확인
if echo "$RESPONSE" | grep -q "님,"; then
    echo "✅ 사용자 이름이 응답에 포함되어 있습니다!"
else
    echo "⚠️  사용자 이름이 응답에 포함되지 않았습니다."
    echo "   (이미지 버전이 오래되었을 수 있습니다. 새로 빌드가 필요합니다.)"
fi

echo ""
echo "📝 참고: 변경사항을 반영하려면 Docker 이미지를 새로 빌드해야 합니다."
echo "   Jenkins 파이프라인을 통해 빌드하거나, 로컬에서 빌드하세요."

