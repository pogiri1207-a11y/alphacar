#!/bin/bash
# JWT_SECRET 확인 및 추가 스크립트

echo "=== JWT_SECRET 확인 ==="
echo ""

cd ~/alphacar/deploy

if grep -q "^JWT_SECRET=" .env 2>/dev/null; then
    echo "✅ JWT_SECRET이 .env 파일에 있습니다:"
    grep "^JWT_SECRET=" .env
else
    echo "⚠️ JWT_SECRET이 .env 파일에 없습니다."
    echo ""
    echo "docker-compose.yml에서 JWT_SECRET을 사용하는 서비스:"
    grep -B 5 "JWT_SECRET" docker-compose.yml | grep -E "^\s+[a-z-]+:" | sed 's/://' | sort -u | sed 's/^/  - /'
    echo ""
    echo "JWT_SECRET을 .env 파일에 추가해야 합니다."
    echo ""
    echo "다음 명령으로 추가하세요:"
    echo "  echo 'JWT_SECRET=your-jwt-secret-value-here' >> ~/alphacar/deploy/.env"
    echo ""
    echo "또는 Jenkins의 ALPHACAR credential 파일에 JWT_SECRET이 포함되어 있는지 확인하세요."
fi

echo ""
echo "=== 현재 .env 파일의 환경변수 목록 ==="
grep -v "^#" .env | grep -v "^$" | cut -d= -f1 | sort | head -20

