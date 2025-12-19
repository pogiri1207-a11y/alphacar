# Grafana 대시보드 문제 해결 가이드

## 현재 상황
대시보드에 "No data"가 표시되고 있습니다.

## 문제 진단 단계

### 1. Loki 로그 수집 확인

Grafana Explore에서 다음 쿼리들을 시도해보세요:

#### 쿼리 1: 기본 컨테이너 이름
```
{container_name=~"deploy-quote-backend-.*"}
```

#### 쿼리 2: Docker Compose 서비스 이름
```
{com.docker.compose.service="quote-backend"}
```

#### 쿼리 3: Job 레이블
```
{job="quote-backend"}
```

#### 쿼리 4: Service 레이블
```
{service="quote-backend"}
```

#### 쿼리 5: 모든 로그 확인
```
{}
```

### 2. Loki 레이블 확인

Grafana Explore → Loki → "Show labels" 버튼 클릭하여 사용 가능한 레이블 확인

### 3. Prometheus 메트릭 확인

Grafana Explore에서 다음 쿼리들을 시도해보세요:

#### 쿼리 1: 서비스 상태
```
up{job="quote-backend"}
```

#### 쿼리 2: CPU 사용률 (cAdvisor)
```
rate(container_cpu_usage_seconds_total{name=~"deploy-quote-backend-.*"}[5m])
```

#### 쿼리 3: 메모리 사용률 (cAdvisor)
```
container_memory_usage_bytes{name=~"deploy-quote-backend-.*"}
```

#### 쿼리 4: 사용 가능한 메트릭 목록
```
{__name__=~".+"}
```

### 4. Promtail 설정 확인

Promtail이 Docker 컨테이너 로그를 수집하도록 설정되어 있는지 확인:

```yaml
# promtail-config.yml 예시
scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container_name'
        replacement: '$1'
```

### 5. Docker 로그 드라이버 확인

Docker Compose에서 로그 드라이버가 설정되어 있는지 확인:

```yaml
services:
  quote-backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 대시보드 수정 방법

### 방법 1: Grafana UI에서 직접 수정

1. 대시보드에서 "Edit" 클릭
2. 각 패널의 "Edit" 클릭
3. 쿼리 편집기에서 실제 레이블로 수정
4. "Apply" 클릭

### 방법 2: Explore에서 쿼리 테스트 후 복사

1. Grafana Explore에서 작동하는 쿼리 찾기
2. 해당 쿼리를 대시보드 패널에 복사

## 일반적인 레이블 패턴

### Loki 레이블 (Promtail 설정에 따라 다름)
- `container_name`: 컨테이너 이름
- `com.docker.compose.service`: Docker Compose 서비스 이름
- `com.docker.compose.project`: Docker Compose 프로젝트 이름
- `job`: Promtail job 이름
- `service`: 서비스 이름

### Prometheus 레이블 (cAdvisor)
- `name`: 컨테이너 이름
- `id`: 컨테이너 ID
- `image`: 이미지 이름

## 빠른 해결 방법

1. **Grafana Explore에서 작동하는 쿼리 찾기**
   - Explore → Loki 선택
   - 다양한 레이블로 쿼리 시도
   - 작동하는 쿼리를 찾으면 대시보드에 적용

2. **레이블 자동 감지**
   - Explore에서 "Show labels" 클릭
   - 사용 가능한 레이블 목록 확인
   - 해당 레이블로 대시보드 쿼리 수정

3. **간단한 쿼리로 시작**
   - 복잡한 필터 없이 `{}`로 모든 로그 확인
   - 점진적으로 필터 추가

## 다음 단계

1. Grafana Explore에서 실제 레이블 구조 확인
2. 작동하는 쿼리 찾기
3. 대시보드 쿼리를 실제 레이블에 맞게 수정
4. 또는 Promtail 설정 확인 및 수정

