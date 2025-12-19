# 회의 서명관리 시스템 (MRS) 구현 계획

## 1. 프로젝트 개요

### 1.1 시스템 목적
회의 참석자들의 서명을 디지털로 수집하고 관리하는 시스템으로, QR코드를 통한 모바일 서명과 PDF 문서 생성 기능을 제공합니다.

### 1.2 주요 기능
- **회의방 관리**: 회의명, 주제, 일시, 장소 등록/관리
- **회의 유형 지원**: 전문가 자문 / 일반 회의 구분
- **QR코드 생성**: 회의방별 고유 QR코드 생성
- **모바일 서명**: QR 스캔 → 약관동의 → 서명
- **회의록 PDF 생성**: 서명 완료 후 문서 생성/다운로드
- **임시 URL 관리**: 회의 종료 시 서명 URL 비활성화
- **기본 기능**: 사용자/메뉴/권한 관리

### 1.3 서명 양식 유형 (참석자별 선택)

회의 생성 시 담당자가 **사용할 양식을 선택**하고, 참석자는 QR 스캔 후 **본인에게 해당하는 양식을 선택**하여 서명

#### 3가지 양식

| 양식 | 코드 | 대상 | 수집정보 | 보관기간 |
|------|------|------|----------|----------|
| **개인정보 동의서** | PRIVACY_CONSENT | 자문비 지급 대상 | 주민번호, 주소, 계좌정보 | PDF 후 삭제 |
| **참석자 명단** | ATTENDEE_LIST | 일반 참석자 | 소속, 직위, 성명 | PDF 후 삭제 |
| **서약서** | SECURITY_PLEDGE | 비밀유지 필요 대상 | 소속, 직위, 성명 | PDF 후 삭제 |

#### 회의 생성 시 양식 설정
- 담당자가 회의에서 사용할 양식 선택 (복수 선택 가능)
- 예: 개인정보 동의서 + 서약서, 참석자 명단 + 서약서, 참석자 명단만 등

#### 참석자 서명 시 양식 선택
- QR 스캔 후 담당자가 설정한 양식 중 본인에게 해당하는 양식 선택
- 선택한 양식에 따라 동의/입력 화면 분기

#### 양식 조합 예시
| 상황 | 선택 양식 |
|------|----------|
| 외부전문가 (자문비 지급) | 개인정보 동의서 + 서약서 |
| 외부전문가 (자문비 없음) | 참석자 명단 + 서약서 |
| 내부 담당자/관계자 | 참석자 명단 |
| 비밀유지 필요 내부인원 | 참석자 명단 + 서약서 |

---

## 2. 기술 스택

### 2.1 프론트엔드
| 기술 | 용도 |
|------|------|
| Next.js 16 | 프레임워크 (App Router, Turbopack) |
| React 19 | UI 라이브러리 |
| TypeScript | 타입 안정성 |
| Tailwind CSS 4 | 스타일링 |
| shadcn/ui (base-mira) | UI 컴포넌트 |
| @hugeicons/react | 아이콘 |
| qrcode.react | QR코드 생성 |
| react-hook-form + zod | 폼 검증 (예정) |

### 2.2 백엔드
| 기술 | 용도 |
|------|------|
| Next.js API Routes | API 서버 |
| Prisma | ORM |
| SQLite/PostgreSQL | 데이터베이스 |
| NextAuth.js | 인증 |
| jsPDF + html2canvas | PDF 생성 |
| uuid | 토큰 생성 |
| bcrypt | 비밀번호 해싱 |

---

## 3. 데이터 모델

### 3.1 ERD 개요

```
User (사용자)
├── id: String (PK)
├── email: String (Unique)
├── password: String
├── name: String
├── role: Enum (ADMIN, MANAGER)
├── createdAt: DateTime
└── updatedAt: DateTime

Meeting (회의방)
├── id: String (PK)
├── title: String (회의명)
├── topic: String (회의주제)
├── dateTime: DateTime (일시)
├── location: String (장소)
├── hostId: String (FK → User)
├── hostDepartment: String (주관부서)
├── allowedForms: String[] (사용 가능 양식 목록)
│   └── ["PRIVACY_CONSENT", "ATTENDEE_LIST", "SECURITY_PLEDGE"]
├── allowWalkIn: Boolean (현장등록 허용 여부, 기본값: true)
├── status: Enum (OPEN, CLOSED, COMPLETED)
├── accessToken: String (임시 URL용 토큰)
├── expiresAt: DateTime (URL 만료시간)
├── createdAt: DateTime
└── updatedAt: DateTime

PreRegisteredAttendee (사전등록 참석자)
├── id: String (PK)
├── meetingId: String (FK → Meeting)
├── name: String (성명)
├── phoneNumber: String (전화번호)
├── assignedForms: String[] (지정 양식 목록)
│   └── ["PRIVACY_CONSENT", "SECURITY_PLEDGE"] 등
├── status: Enum (PENDING, SIGNED)
├── createdAt: DateTime
└── updatedAt: DateTime

Attendee (참석자)
├── id: String (PK)
├── meetingId: String (FK → Meeting)
├── selectedForms: String[] (선택한 양식 목록)
│   └── ["PRIVACY_CONSENT", "SECURITY_PLEDGE"] 또는 ["ATTENDEE_LIST"]
│
├── [공통 필드]
├── name: String (성명)
├── department: String (소속)
├── position: String (직위)
├── signatureData: Text (서명 이미지 Base64)
├── signedAt: DateTime
├── status: Enum (PENDING, SIGNED)
│
├── [개인정보 동의서 선택 시 (PRIVACY_CONSENT)]
├── residentNumber: String? (주민등록번호 - AES-256 암호화)
├── address: String? (주소)
├── phoneNumber: String? (휴대전화번호)
├── bankName: String? (은행명)
├── accountHolder: String? (예금주)
├── accountNumber: String? (계좌번호 - AES-256 암호화)
├── privacyConsentAt: DateTime? (개인정보 수집/이용 동의 시간)
├── identifierConsentAt: DateTime? (고유식별정보 수집 동의 시간)
├── thirdPartyConsentAt: DateTime? (제3자 제공 동의 시간)
│
├── [서약서 선택 시 (SECURITY_PLEDGE)]
├── securityPledgeAt: DateTime? (서약 동의 시간)
│
└── [참석자 명단 선택 시 (ATTENDEE_LIST)]
    └── attendeeListConsentAt: DateTime? (간단 약관 동의 시간)

SignatureDocument (서명 문서)
├── id: String (PK)
├── meetingId: String (FK → Meeting)
├── pdfPath: String
├── generatedAt: DateTime
└── generatedBy: String (FK → User)

Menu (메뉴)
├── id: String (PK)
├── name: String
├── path: String
├── parentId: String (Self FK)
├── order: Int
└── icon: String

Permission (권한)
├── id: String (PK)
├── userId: String (FK → User)
├── menuId: String (FK → Menu)
├── canRead: Boolean
├── canWrite: Boolean
└── canDelete: Boolean
```

---

## 4. 화면 설계

### 4.1 관리자/담당자 페이지 (인증 필요)

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 로그인 | `/login` | 담당자 로그인 |
| 회의 목록 | `/meetings` | 회의방 목록/검색/필터 (메인 페이지) |
| 회의 등록 | `/meetings/new` | 회의방 생성 폼 (2컬럼 레이아웃) |
| 회의 상세 | `/meetings/[id]` | QR코드, 참석자 현황, PDF 생성 |
| 회의 수정 | `/meetings/[id]/edit` | 회의방 수정 폼 (2컬럼 레이아웃) |
| 사용자 관리 | `/users` | 사용자 CRUD |
| 메뉴 관리 | `/settings/menus` | 메뉴 구조 관리 |
| 권한 관리 | `/settings/permissions` | 사용자별 권한 설정 |

> **참고**: 루트 경로(`/`)는 `/meetings`로 리다이렉트됩니다. 대시보드는 별도로 구현하지 않고 회의 목록이 메인 화면 역할을 합니다.

### 4.2 참석자 페이지 (임시 URL, 인증 불필요)

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 회의 정보 | `/sign/[token]` | 회의 정보 확인 |
| 본인 확인 | `/sign/[token]/verify` | 전화번호로 본인 확인 (사전등록자 매칭) |
| 양식 선택 | `/sign/[token]/select-form` | 서명 양식 선택 (현장등록자만) |
| 약관 동의 | `/sign/[token]/agree` | 개인정보 처리 동의 |
| 정보 입력 | `/sign/[token]/info` | 이름, 부서, 직책 입력 |
| 서명 | `/sign/[token]/signature` | 서명 캔버스 |
| 완료 | `/sign/[token]/complete` | 서명 완료 안내 |
| 오류 | `/sign/[token]/expired` | 만료/오류 안내 |

### 4.3 화면 플로우

```
[관리자 플로우]
로그인 → 회의 목록 → 회의 등록 → QR코드 생성 → 참석자 현황 모니터링 → PDF 생성 → 다운로드

[회의 등록 상세]
1. 기본 정보 입력 (회의명, 주제, 일시, 장소, 주관부서)
2. 서명 양식 선택 (사용 가능한 양식 지정)
3. 참석자 사전 등록 (선택)
   - 이름, 전화번호, 지정 양식 설정
   - 현장 등록 허용 여부 (allowWalkIn) 설정

[참석자 플로우 - 하이브리드 방식]

┌─ QR스캔 → 회의정보 확인 → 본인확인(전화번호)
│
├─ [사전등록자] 전화번호 매칭 성공
│   → 지정된 양식으로 자동 진행 (5단계)
│   → 약관동의 → 정보입력 → 서명 → 완료
│
├─ [현장등록자] 전화번호 매칭 실패 + allowWalkIn=true
│   → 양식 직접 선택 (6단계)
│   → 양식선택 → 약관동의 → 정보입력 → 서명 → 완료
│
└─ [미등록자] 전화번호 매칭 실패 + allowWalkIn=false
    → 오류 메시지 ("사전 등록된 참석자만 서명 가능")

[양식별 동의 화면]
- 개인정보 동의서: 개인정보 동의 + 고유식별정보 동의 + 제3자 제공 동의
- 참석자 명단: 서명 정보 수집 동의
- 서약서: 비밀유지 서약 동의 (회의명/주제 동적 표시)

[양식 조합 시 동의 화면]
- 복수 양식 선택 시 해당 동의 항목이 모두 표시됨
- 예: 개인정보 동의서 + 서약서 → 4개 동의 항목 (개인정보 3개 + 서약서 1개)
```

---

## 5. 구현 Phase

### Phase 1: 기반 구축 및 기본 기능 (화면 우선)

#### 1-1. 프로젝트 설정
- [x] shadcn/ui 설치 및 설정
- [x] Tailwind CSS 테마 커스터마이징
- [x] 폴더 구조 설정
- [x] 공통 타입 정의 (`/types/index.ts`)

#### 1-2. 레이아웃 및 공통 컴포넌트
- [x] 관리자 레이아웃 (상단 네비게이션)
- [x] 모바일 레이아웃 (참석자용)
- [x] 공통 UI 컴포넌트 구성
- [x] 페이지 컨테이너 스타일 상수화 (`LAYOUT.PAGE_CONTAINER`)

#### 1-3. 사용자 관리 화면
- [x] 로그인 페이지 UI
- [x] 사용자 목록 페이지 UI
- [x] 사용자 등록/수정 모달 UI

#### 1-4. 메뉴/권한 관리 화면
- [x] 메뉴 관리 페이지 UI
- [x] 권한 설정 페이지 UI

---

### Phase 2: 핵심 기능 화면 구현

#### 2-1. 회의방 관리 화면
- [x] 회의방 목록 페이지 (카드 그리드, 상태 필터)
- [x] 회의방 등록 폼 (2컬럼 레이아웃)
  - [x] 좌측: 기본 정보 (회의명, 주제, 일시, 장소, 주관부서, 서명 양식)
  - [x] 우측: 사전 등록 참석자 관리
  - [x] 서명 양식 선택 (Badge 토글, 복수 선택)
  - [x] 참석자 추가/수정/삭제 (Dialog)
- [x] 회의방 수정 폼 (`/meetings/[id]/edit`)
  - [x] 등록 폼과 동일한 2컬럼 레이아웃
  - [x] 기존 데이터 로드 및 로딩 스켈레톤
- [x] 회의방 상세 페이지
  - [x] QR코드 표시 (Dialog, 다운로드/인쇄)
  - [x] 참석자 현황 테이블
  - [x] 서명 완료율 Progress Bar
  - [x] PDF 생성 버튼
  - [x] 회의 수정/종료 버튼

#### 2-2. 참석자 서명 화면 (모바일 최적화)

**공통 화면:**
- [x] 회의 정보 표시 페이지 (`/sign/[token]`)
- [x] 본인 확인 페이지 (`/sign/[token]/verify`)
  - [x] 전화번호 입력
  - [x] 사전등록자 매칭 로직
  - [x] 현장등록 허용 여부에 따른 분기 처리
- [x] 양식 선택 페이지 (`/sign/[token]/select-form`)
  - [x] 현장등록자만 표시 (사전등록자는 스킵)
  - [x] 담당자가 설정한 양식 중 선택
- [x] 약관 동의 페이지 (`/sign/[token]/agree`)
  - [x] 선택된 양식에 따른 동의 항목 동적 구성
  - [x] 서약서 회의명/주제 동적 표시
- [x] 정보 입력 페이지 (`/sign/[token]/info`)
  - [x] 사전등록자 이름/전화번호 자동 입력
- [x] 서명 캔버스 컴포넌트 (`/sign/[token]/signature`)
- [x] 완료 페이지 (`/sign/[token]/complete`)
- [x] 만료/오류 페이지 (`/sign/[token]/expired`)

**단계 표시 (Step Indicator):**
- 사전등록자: 5단계 (본인확인 → 약관동의 → 정보입력 → 서명 → 완료)
- 현장등록자: 6단계 (본인확인 → 양식선택 → 약관동의 → 정보입력 → 서명 → 완료)

**양식별 동의/입력 화면:**

**(1) 개인정보 동의서 (PRIVACY_CONSENT):**
- [x] 개인정보 수집/이용 동의 페이지
  ```
  [수집 목적] 참석자 자문비 지급
  [수집 항목] 소속, 직위, 성명, 주소, 휴대전화번호, 은행명, 예금주, 계좌번호
  [보유 기간] PDF 생성 후 즉시 삭제
  ```
- [x] 고유식별정보(주민번호) 수집 동의 페이지
  ```
  [처리 목적] 소득세법에 따른 소득세 신고 및 지급명세서 제출
  [수집 항목] 주민등록번호
  [보유 기간] PDF 생성 후 즉시 삭제
  ```
- [x] 제3자 제공 동의 페이지
  ```
  [제공받는자] 국세청(홈택스), 감사기관
  [제공 목적] 소득세 신고, 정부부처 감사
  [제공 항목] 성명, 주민등록번호, 주소 등
  ```
- [x] 개인정보 입력 폼 (소속, 직위, 성명, 주민번호, 주소, 전화번호, 은행, 예금주, 계좌번호)

**(2) 참석자 명단 (ATTENDEE_LIST):**
- [x] 간단 약관 동의 페이지
  ```
  [약관 내용]
  본 서명 정보는 회의록 서명 문서 생성 후
  개인정보(서명값)가 즉시 삭제됩니다.
  수집된 정보는 회의 참석자 확인 용도로만 사용됩니다.
  ```
- [x] 기본 정보 입력 폼 (소속, 직위, 성명)

**(3) 서약서 (SECURITY_PLEDGE):**
- [x] 서약서 동의 페이지 ([별지 제5호서식])
  ```
  본인은 한국방송통신전파진흥원에서 발주 예정인 「{회의명}」 사업의
  {회의주제}와 관련하여 취득한 제반 내용을 발주기관의 허락 없이
  어떠한 경우에도 공개하거나 유포하지 않을 것을 서약합니다.
  ```
- [x] 기본 정보 입력 폼 (소속, 직위, 성명) - 다른 양식과 함께 선택된 경우 해당 양식에서 입력

#### 2-3. 서명 문서 (PDF 템플릿)

**양식별 PDF 생성 - 참석자가 선택한 양식에 따라 해당 PDF 생성**

**(1) 참석자 명단 (ATTENDEE_LIST):**
- [x] 회의 제목, 일자/장소 헤더
- [x] 참석자 테이블 (구분, 소속, 직위, 성명, 서명)
- [x] 최대 40명 지원 (페이지 자동 분할)

**(2) 개인정보 동의서 (PRIVACY_CONSENT):**
- [x] 참석 개요 (제목, 일시/장소, 주관부서)
- [x] 개인정보 수집/이용 동의 내용
- [x] 고유식별정보 수집/이용 동의 내용
- [x] 제3자 제공 동의 내용
- [x] 개인정보 내용 테이블 (소속, 성명, 직위, 주민번호, 주소, 전화번호, 은행, 계좌)
- [x] 서명란

**(3) 서약서 (SECURITY_PLEDGE) - [별지 제5호서식]:**
- [x] 서약서 양식
  ```
  서 약 서

  본인은 한국방송통신전파진흥원에서 발주 예정인 「{회의명}」
  사업의 {회의주제}와 관련하여 취득한 제반 내용을 발주기관의
  허락 없이 어떠한 경우에도 공개하거나 유포하지 않을 것을
  서약합니다.

  {날짜}

  소 속 :
  직 위 :
  성 명 :                    (서명)

  한국방송통신전파진흥원장 귀하
  ```
- [x] 동적 필드: 회의명, 회의주제, 날짜
- [x] 서명란

**PDF 생성 규칙:**
- 참석자별로 선택한 양식에 해당하는 PDF만 생성
- 복수 양식 선택 시 각 양식별로 별도 PDF 생성 또는 병합

---

### Phase 3: 백엔드 구현

#### 3-1. 데이터베이스 설정
- [ ] Prisma 스키마 정의
- [ ] 마이그레이션 실행
- [ ] 시드 데이터 작성 (기본 관리자 계정, 메뉴)

#### 3-2. 인증 API
- [ ] NextAuth.js 설정
- [ ] Credentials Provider 구현
- [ ] 세션 관리
- [ ] 권한 검증 미들웨어

#### 3-3. 사용자/권한 API
```
POST   /api/users          사용자 생성
GET    /api/users          사용자 목록
GET    /api/users/:id      사용자 상세
PUT    /api/users/:id      사용자 수정
DELETE /api/users/:id      사용자 삭제

GET    /api/menus          메뉴 목록
PUT    /api/menus          메뉴 수정

GET    /api/permissions    권한 목록
PUT    /api/permissions    권한 수정
```

#### 3-4. 회의방 API
```
POST   /api/meetings              회의 생성 (토큰 발급)
GET    /api/meetings              회의 목록
GET    /api/meetings/:id          회의 상세
PUT    /api/meetings/:id          회의 수정
DELETE /api/meetings/:id          회의 삭제
POST   /api/meetings/:id/close    회의 종료 (URL 비활성화)
GET    /api/meetings/:id/attendees  참석자 현황
```

#### 3-5. 서명 API
```
GET    /api/sign/:token           회의 정보 조회 (토큰 유효성 검증)
POST   /api/sign/:token           서명 제출
```

#### 3-6. PDF 생성 API
```
POST   /api/meetings/:id/generate-pdf   PDF 생성
GET    /api/meetings/:id/download-pdf   PDF 다운로드
```

**PDF 생성 프로세스:**
1. 회의 정보 조회
2. 참석자 서명 데이터 취합
3. PDF 템플릿에 데이터 매핑
4. PDF 파일 생성 및 저장
5. **서명 데이터(signatureData) 삭제**
6. 다운로드 URL 반환

---

### Phase 4: 통합 및 마무리

#### 4-1. 프론트엔드-백엔드 연동
- [ ] API 클라이언트 설정 (fetch wrapper)
- [ ] 각 화면에 API 연동
- [ ] 로딩/에러 상태 처리
- [ ] 실시간 새로고침 (서명 현황)

#### 4-2. QR코드 기능 완성
- [ ] QR코드에 임시 URL 인코딩
- [ ] QR코드 이미지 다운로드
- [ ] QR코드 인쇄 기능

#### 4-3. PDF 생성 완성
- [ ] PDF 템플릿 완성
- [ ] 서명 이미지 삽입
- [ ] 다운로드 기능
- [ ] 생성 후 서명 데이터 삭제 확인

#### 4-4. 보안 및 최적화
- [ ] 권한 검증 강화
- [ ] 입력값 검증 (XSS 방지)
- [ ] 에러 핸들링 통일
- [ ] 모바일 반응형 테스트

#### 4-5. 테스트 및 배포
- [ ] E2E 시나리오 테스트
- [ ] 크로스 브라우저 테스트
- [ ] 배포 설정

---

### Phase 5: AI 서명 품질 검증

#### 5-1. 개요
서명 제출 시 AI Vision API를 활용하여 서명의 유효성을 실시간 검증하고, 품질 미달 시 재서명을 요청하는 기능

#### 5-2. 검증 항목
- 유효한 서명 패턴 여부 (낙서/단순 선/점 감지)
- 빈 캔버스 감지
- 서명 영역 활용도 (너무 작거나 화면 벗어남)
- 서명 복잡도 (너무 단순한 획 감지)

#### 5-3. 구현 사항
- [ ] AI 서비스 모듈 구현 (`lib/ai/signature-validator.ts`)
- [ ] Vision API 연동 (Claude Vision 또는 GPT-4 Vision)
- [ ] 서명 검증 API 구현
- [ ] 서명 캔버스 컴포넌트에 검증 로직 연동
- [ ] 검증 실패 시 재서명 안내 UI
- [ ] 검증 결과 로깅

#### 5-4. API 설계
```
POST /api/ai/validate-signature
Request:
{
  "signatureImage": "base64 encoded image"
}

Response:
{
  "isValid": boolean,
  "score": number (0-100),
  "issues": string[],
  "message": string
}
```

#### 5-5. 검증 플로우
```
서명 완료 → 검증 API 호출 → AI 분석
                              ├─ 통과 (score >= 60) → 서명 저장 → 완료 페이지
                              └─ 미달 (score < 60) → 재서명 안내 표시
```

#### 5-6. 데이터 모델 확장
```
Attendee (확장)
├── signatureQualityScore: Float (AI 검증 점수)
└── validatedAt: DateTime (검증 시간)
```

#### 5-7. 환경 변수
```
AI_PROVIDER=claude|openai
AI_API_KEY=xxx
AI_SIGNATURE_THRESHOLD=60
```

---

## 6. 프로젝트 구조

```
/app
  /page.tsx                   # 루트 (→ /meetings 리다이렉트)
  /layout.tsx                 # 루트 레이아웃
  /globals.css

  /(auth)                     # 인증 영역 (레이아웃 없음)
    /login/page.tsx           # 로그인

  /(admin)                    # 관리자 영역 (상단 네비게이션 레이아웃)
    /layout.tsx               # 관리자 레이아웃 (TopNav)
    /meetings/
      /page.tsx               # 회의 목록 (카드 그리드)
      /new/page.tsx           # 회의 등록 (2컬럼)
      /[id]/
        /page.tsx             # 회의 상세 (QR, 참석자 현황)
        /edit/page.tsx        # 회의 수정 (2컬럼)
    /users/page.tsx           # 사용자 관리
    /settings/
      /menus/page.tsx         # 메뉴 관리
      /permissions/page.tsx   # 권한 관리

  /(public)                   # 공개 영역 (모바일 서명)
    /layout.tsx               # 모바일 레이아웃
    /sign/[token]/
      /page.tsx               # 회의 정보 확인
      /verify/page.tsx        # 본인 확인 (전화번호)
      /select-form/page.tsx   # 양식 선택 (현장등록자만)
      /agree/page.tsx         # 약관 동의
      /info/page.tsx          # 정보 입력
      /signature/page.tsx     # 서명
      /complete/page.tsx      # 완료
      /expired/page.tsx       # 만료

  /api                        # API Routes (Phase 3에서 구현 예정)
    /auth/[...nextauth]       # NextAuth 핸들러
    /users/                   # 사용자 API
    /meetings/                # 회의 API
    /sign/[token]/            # 서명 API
    /menus/                   # 메뉴 API
    /permissions/             # 권한 API

/components
  /ui/                        # shadcn/ui 컴포넌트 (Button, Card, Input 등)
  /layout/
    /top-nav.tsx              # 상단 네비게이션
    /mobile-header.tsx        # 모바일 헤더
  /signature/
    /signature-canvas.tsx     # 서명 캔버스

/lib
  /constants.ts               # 상수 정의 (ROUTES, FORM_TYPES, LAYOUT 등)
  /utils.ts                   # 유틸리티 함수 (cn)
  /prisma.ts                  # Prisma 클라이언트 (예정)
  /auth.ts                    # NextAuth 설정 (예정)
  /encryption.ts              # AES-256 암호화/복호화 (예정)

/types
  /index.ts                   # 전역 타입 정의 (User, Meeting, Attendee 등)

/docs
  /implementation-plan.md     # 이 문서
```

---

## 7. 주요 보안 고려사항

### 7.1 인증/인가
- 관리자 페이지는 반드시 인증 필요
- 회의방 접근은 담당자(hostId) 또는 관리자만 가능
- API 요청 시 세션 검증

### 7.2 민감정보 암호화 (전문가 자문)
- **암호화 대상**: 주민등록번호, 계좌번호
- **암호화 방식**: AES-256-GCM
- **키 관리**: 환경변수로 분리 (ENCRYPTION_KEY)
- **복호화 시점**: PDF 생성 시에만 복호화
- **전송 보안**: HTTPS 필수

```typescript
// lib/encryption.ts 예시
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')

export function encrypt(text: string): string { ... }
export function decrypt(encrypted: string): string { ... }
```

### 7.3 임시 URL 보안
- UUID v4 기반 예측 불가능한 토큰
- 만료 시간 설정 (회의 종료 시 즉시 비활성화)
- 토큰별 요청 횟수 제한 고려

### 7.4 데이터 보관 정책

**원칙: 모든 개인정보/민감정보는 PDF 생성 후 즉시 삭제**

| 데이터 유형 | 보관 | 삭제 시점 |
|------------|------|----------|
| 서명 이미지 (signatureData) | 임시 | PDF 생성 후 즉시 삭제 |
| 주민등록번호 (residentNumber) | 임시 | PDF 생성 후 즉시 삭제 |
| 계좌번호 (accountNumber) | 임시 | PDF 생성 후 즉시 삭제 |
| 주소/전화번호 | 임시 | PDF 생성 후 즉시 삭제 |
| 기본정보 (소속, 직위, 성명) | 영구 | 삭제 안함 (회의 기록용) |
| 동의 시간 기록 | 영구 | 삭제 안함 (증빙용) |
| 생성된 PDF 파일 | 영구 | 담당자 직접 관리 |

**PDF 생성 시 데이터 처리 순서:**
1. 참석자 데이터 조회 (민감정보 복호화)
2. PDF 파일 생성 및 저장
3. 민감정보 필드 즉시 삭제 (signatureData, residentNumber, accountNumber 등)
4. 삭제 완료 로그 기록

### 7.5 법적 근거 (외부전문가)
- **개인정보 수집**: 개인정보보호법 제15조제1항제4호, 소득세법 제145조/164조
- **주민번호 수집**: 개인정보보호법 제24조의2제1항제1호, 소득세법 시행령 제193조/213조
- **제3자 제공**: 개인정보보호법 제17조제1항제2호, 국회법 제128조, 감사원법 제27조/50조

---

## 8. 구현 우선순위

```
[높음]
1. 회의방 CRUD + QR코드 생성
2. 모바일 서명 (약관동의 → 서명)
3. PDF 생성 및 다운로드
4. 로그인/인증

[중간]
5. 사용자 관리
6. 대시보드

[낮음]
7. 메뉴/권한 관리
8. 세부 최적화
```

---

## 9. 예상 라이브러리 설치

```bash
# UI
npx shadcn@latest init
npx shadcn@latest add button card input label table dialog form

# 기능
npm install react-signature-canvas @types/react-signature-canvas
npm install qrcode.react
npm install jspdf html2canvas
npm install uuid @types/uuid

# 인증 & 데이터
npm install next-auth @prisma/client prisma bcryptjs @types/bcryptjs

# 폼 & 검증
npm install react-hook-form @hookform/resolvers zod

# 유틸
npm install date-fns

# AI (Phase 5)
npm install @anthropic-ai/sdk   # Claude Vision API
# 또는
npm install openai              # OpenAI GPT-4 Vision
```

---

## 10. 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| 1.0 | 2025-12-18 | 최초 작성 |
| 1.1 | 2025-12-18 | Phase 5 AI 서명 품질 검증 추가 |
| 1.2 | 2025-12-18 | 회의 유형 구분 추가 (외부전문가/일반회의), 보안서약서 추가 |
| 1.3 | 2025-12-18 | 참석자별 양식 선택 방식으로 변경 (3가지 양식), 모든 민감정보 PDF 후 삭제 정책 |
| 1.4 | 2025-12-18 | 하이브리드 참석자 등록 방식 추가 (사전등록 + 현장등록), 본인확인 페이지 추가 |
| 1.5 | 2025-12-20 | 현행화: 기술스택 버전 업데이트 (Next.js 16, React 19, Tailwind 4), 프로젝트 구조 반영, 회의 수정 페이지 추가, 상단 네비게이션 레이아웃 반영, 2컬럼 폼 레이아웃 반영 |
