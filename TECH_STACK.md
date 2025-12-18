# ALPHACAR 개발서버 기술 스택

## 📋 서버 구성

### 개발 서버 (192.168.0.160)
- **역할**: 애플리케이션 서버 (Frontend + Backend)
- **서비스**: 웹 애플리케이션, API 서버

### DB 서버 (192.168.0.201)
- **역할**: 데이터베이스 서버
- **서비스**: MongoDB, Kafka

---

## 🎨 프론트엔드 (Frontend)

### 위치
- **서버**: 192.168.0.160
- **컨테이너**: `alphacar-frontend`
- **포트**: 3000 (내부), 8000 (외부)

### 기술 스택

#### 핵심 프레임워크
- **Next.js**: `16.0.7`
  - React 프레임워크
  - SSR/SSG 지원
  
- **React**: `19.2.0`
  - UI 라이브러리
  
- **React DOM**: `19.2.0`

#### 스타일링
- **TailwindCSS**: `^4`
  - 유틸리티 CSS 프레임워크
  - PostCSS 통합

#### HTTP 클라이언트
- **Axios**: `^1.13.2`
  - API 통신

#### 기타
- **js-cookie**: `^3.0.5`
  - 쿠키 관리

#### 모니터링
- **OpenTelemetry**: `^0.67.2`
  - 분산 추적
  - 오토 인스트루멘테이션

---

## 🔧 백엔드 (Backend)

### 위치
- **서버**: 192.168.0.160
- **컨테이너**: 
  - `main-backend` (포트: 3002)
  - `quote-backend` (포트: 3003)
  - `search-backend` (포트: 3004)
  - `community-backend` (포트: 3005)
  - `mypage-backend` (포트: 3006)
  - `drive-backend` (포트: 3007)
  - `aichat-backend` (포트: 3008)

### 기술 스택

#### 핵심 프레임워크
- **NestJS**: `^11.0.1`
  - Node.js 백엔드 프레임워크
  - TypeScript 기반
  - 모듈러 아키텍처

- **Express**: `^11.0.1` (NestJS 플랫폼)
  - HTTP 서버

#### 데이터베이스

##### MongoDB
- **Mongoose**: `^8.20.1`
  - MongoDB ODM (Object Document Mapper)
- **연결**: 
  - **서버**: 192.168.0.201:27017
  - **데이터베이스**: `triple_db`
  - **Replica Set**: `rs0` (3노드)
  - **사용자**: `triple_user` / `triple_password`
- **사용 서비스**: 
  - main-backend
  - quote-backend
  - search-backend
  - drive-backend
  - aichat-backend

##### MariaDB
- **TypeORM**: `^11.0.0`
  - ORM (Object Relational Mapping)
- **연결**:
  - **서버**: 211.46.52.151:15432
  - **데이터베이스**: `team1`
  - **사용자**: `team1`
- **사용 서비스**:
  - mypage-backend
  - community-backend

#### 캐시
- **Redis**: `ioredis ^5.8.2`
  - 인메모리 데이터 저장소
  - 캐싱 및 세션 관리
- **연결**: 
  - **서버**: 192.168.0.175 (모니터링/Redis 서버)
  - **포트**: 6379 (기본)

#### 인증
- **JWT** (JSON Web Token)
  - 토큰 기반 인증

#### 유틸리티
- **class-validator**: `^0.14.3`
  - DTO 검증
- **class-transformer**: `^0.5.1`
  - 객체 변환
- **rxjs**: `^7.8.1`
  - 리액티브 프로그래밍

#### 모니터링
- **OpenTelemetry**: `^0.49.2`
  - 분산 추적
  - Alloy Agent로 수집 (포트: 4317)

---

## 📊 인프라 & 미들웨어

### Gateway & Proxy
- **Traefik**: `3.6`
  - **역할**: API Gateway, 로드밸런서
  - **포트**: 9090 (HTTP), 8080 (Dashboard)
  - **기능**: 라우팅, Rate Limiting

- **Nginx**: `1.29.4`
  - **역할**: Reverse Proxy, SSL 종료
  - **포트**: 80 (HTTP), 443 (HTTPS), 8000
  - **기능**: 정적 파일 서빙, 프론트엔드 프록시

### 모니터링
- **Grafana Alloy**: `latest`
  - **역할**: Observability Agent
  - **포트**: 4317, 4318 (OTLP), 12345 (HTTP)
  - **기능**: 메트릭/로그/트레이스 수집

---

## 🗄️ 데이터베이스 서버 (192.168.0.201)

### MongoDB
- **버전**: MongoDB 8
- **구성**: Replica Set (`rs0`)
  - Primary: 192.168.0.201:27017
  - Secondary 1: 192.168.0.201:27018
  - Secondary 2: 192.168.0.201:27019
- **데이터베이스**: 
  - `triple_db` (메인)
  - `estimate_db`
  - 기타 (vehicle_spec_db, vehicle_reviews_db 등)
- **인증**: 사용자 인증 (triple_user, proj 등)

### Kafka
- **버전**: Apache Kafka 3.7.1
- **모드**: KRaft 모드 (클러스터)
- **브로커**: 3개
  - kafka-1: 192.168.0.201:9092
  - kafka-2: 192.168.0.201:9093
  - kafka-3: 192.168.0.201:9094
- **토픽**: `vehicle-data` 등
- **UI**: Kafka UI (포트: 8080)

**📌 참고**: Kafka는 백엔드에서 사용하지만, **DB 서버(192.168.0.201)에서 실행**되고 있습니다.
- **백엔드 역할**: Kafka Producer/Consumer (데이터 수집 및 처리)
- **실행 위치**: DB 서버에서 독립적으로 실행

---

## 📌 서비스별 데이터베이스 사용 현황

| 서비스 | MongoDB | MariaDB | Redis | Kafka |
|--------|---------|---------|-------|-------|
| main-backend | ✅ | ❌ | ✅ | ✅ |
| quote-backend | ✅ | ❌ | ❌ | ❌ |
| search-backend | ✅ | ❌ | ❌ | ❌ |
| drive-backend | ✅ | ❌ | ❌ | ❌ |
| aichat-backend | ✅ | ❌ | ❌ | ❌ |
| mypage-backend | ✅ | ✅ | ❌ | ❌ |
| community-backend | ❌ | ✅ | ❌ | ❌ |

---

## 🌐 네트워크 구조

### 개발 서버 (192.168.0.160)
```
Internet
  ↓
Nginx (포트 8000)
  ↓
Traefik (포트 9090)
  ↓
[Frontend + Backend Services]
  ├── Frontend (Next.js)
  ├── main-backend (NestJS)
  ├── quote-backend (NestJS)
  ├── search-backend (NestJS)
  ├── drive-backend (NestJS)
  ├── aichat-backend (NestJS)
  ├── mypage-backend (NestJS)
  └── community-backend (NestJS)
```

### DB 서버 (192.168.0.201)
```
[MongoDB Replica Set]
  ├── mongodb-primary (27017)
  ├── mongodb-secondary-1 (27018)
  └── mongodb-secondary-2 (27019)

[Kafka Cluster (KRaft)]
  ├── kafka-1 (9092)
  ├── kafka-2 (9093)
  └── kafka-3 (9094)
```

---

## 📝 요약

### 프론트엔드
- **Next.js 16** + **React 19** + **TailwindCSS 4**
- **서버**: 192.168.0.160

### 백엔드
- **NestJS 11** (TypeScript)
- **데이터베이스**: MongoDB (Mongoose) + MariaDB (TypeORM)
- **캐시**: Redis
- **메시징**: Kafka (DB 서버에서 실행)
- **서버**: 192.168.0.160

### 인프라
- **Gateway**: Traefik
- **Proxy**: Nginx
- **모니터링**: Grafana Alloy + OpenTelemetry

### 데이터베이스 서버
- **MongoDB**: 192.168.0.201 (Replica Set)
- **Kafka**: 192.168.0.201 (KRaft Cluster)

---

## 🔄 Kafka 통신 상세 설명

### 1. 브로커 간 통신 (KRaft 모드)

Kafka는 KRaft 모드로 실행되며, 3가지 리스너를 사용합니다:

#### Controller 리스너 (포트: 19092, 19093, 19094)
- **역할**: KRaft 컨트롤러 간 메타데이터 동기화
- **프로토콜**: KRaft 프로토콜 (Raft 합의 알고리즘 기반)
- **통신 내용**:
  - 클러스터 메타데이터 (토픽, 파티션 정보)
  - 리더 선출 및 리밸런싱
  - 브로커 상태 관리
  - 트랜잭션 코디네이터 정보
- **특징**: 
  - Quorum 기반 (과반수 합의)
  - 고가용성 보장

#### Internal 리스너 (포트: 29092, 29093, 29094)
- **역할**: 브로커 간 내부 통신
- **프로토콜**: Kafka Wire Protocol
- **통신 내용**:
  - **파티션 복제**: 리더에서 팔로워로 메시지 복제
  - **리더-팔로워 동기화**: ISR (In-Sync Replicas) 유지
  - **오프셋 관리**: 커밋된 오프셋 동기화
  - **Consumer Group 정보**: 그룹 코디네이터와의 통신
- **특징**:
  - 내부 네트워크에서만 접근 가능
  - 고속 데이터 전송

### 2. Producer/Consumer와 브로커 통신

#### External 리스너 (포트: 9092, 9093, 9094)
- **역할**: 외부 클라이언트 (Producer/Consumer) 접속
- **프로토콜**: Kafka Wire Protocol (TCP/IP)
- **접속 대상**: 개발 서버(192.168.0.160)의 백엔드 서비스

#### Producer 통신 흐름
```
1. Producer 시작
   ↓
2. Bootstrap 서버(9092/9093/9094)에 연결
   ↓
3. 브로커로부터 메타데이터 조회
   - 토픽 정보
   - 파티션 리더 정보
   - 파티션 수
   ↓
4. 리더 브로커에 직접 연결
   ↓
5. 메시지 전송 (배치 단위)
   - 배치 크기 최적화
   - 압축 지원 (gzip, snappy 등)
   ↓
6. 브로커가 ACK 응답
   - acks=0: 응답 없음 (가장 빠름)
   - acks=1: 리더만 확인 (중간)
   - acks=all: 모든 복제본 확인 (가장 안전)
```

#### Consumer 통신 흐름
```
1. Consumer 시작 (Consumer Group 지정)
   ↓
2. Bootstrap 서버(9092/9093/9094)에 연결
   ↓
3. 브로커로부터 메타데이터 조회
   - 토픽 정보
   - 파티션 정보
   ↓
4. Group Coordinator 브로커 찾기
   ↓
5. Consumer Group에 가입
   ↓
6. 파티션 할당 받기 (Rebalance)
   - Round-robin, Range, Sticky 등
   ↓
7. 리더 브로커에 연결하여 메시지 Pull
   - fetch.min.bytes: 최소 가져올 바이트
   - fetch.max.wait.ms: 최대 대기 시간
   ↓
8. 메시지 처리 후 오프셋 커밋
   - 자동 커밋 (enable.auto.commit=true)
   - 수동 커밋 (commitSync/commitAsync)
```

### 3. 실제 통신 예시 (현재 환경)

```
[개발 서버: 192.168.0.160]
    |
    | (포트 9092/9093/9094)
    v
[Kafka Broker 1: 192.168.0.201:9092]
    |
    |--[Controller]--(포트 19092)--> [다른 Controller들]
    |                                    (메타데이터 동기화)
    |--[Internal]--(포트 29092)--> [다른 Broker들]
    |                                (파티션 복제)
    |
[Kafka Broker 2: 192.168.0.201:9093]
    |
    |--[Controller]--(포트 19093)--> [다른 Controller들]
    |--[Internal]--(포트 29093)--> [다른 Broker들]

[Kafka Broker 3: 192.168.0.201:9094]
    |
    |--[Controller]--(포트 19094)--> [다른 Controller들]
    |--[Internal]--(포트 29094)--> [다른 Broker들]
```

### 4. 주요 통신 포인트

#### 메타데이터 요청
- **주기**: 5분마다 자동 갱신 (또는 토픽 변경 시)
- **내용**: 토픽, 파티션, 리더 정보
- **최적화**: 캐싱으로 브로커 부하 감소

#### 파티션 복제
- **방식**: 리더 → 팔로워 단방향 복제
- **동기화**: ISR (In-Sync Replicas) 유지
- **복제 팩터**: 3 (현재 설정)

#### Consumer Group 관리
- **Group Coordinator**: 하나의 브로커가 담당
- **Rebalance**: Consumer 추가/제거 시 파티션 재분배
- **Heartbeat**: Consumer 활성 상태 확인

---

**작성일**: 2025-12-12
**서버**: 
- 개발 서버: 192.168.0.160
- DB 서버: 192.168.0.201
- 모니터링/Redis 서버: 192.168.0.175

