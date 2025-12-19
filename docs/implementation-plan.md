# 회의 서명관리 시스템 (MRS) 구현 계획

## 1. 프로젝트 개요

### 1.1 시스템 목적
회의 참석자들의 서명을 디지털로 수집하고 관리하는 시스템으로, 회의 유형에 따라 최적화된 서명 프로세스를 제공합니다.

### 1.2 회의 유형 (2-Mode 시스템)

```
┌─────────────────────────────────────────────────────────────────┐
│                      MRS 회의 서명 시스템                         │
├─────────────────────────────┬───────────────────────────────────┤
│       세미나 모드            │          자문회의 모드              │
├─────────────────────────────┼───────────────────────────────────┤
│  공용 QR 코드               │  이메일 개인 링크                   │
│  현장 즉시 서명             │  사전 초대 후 서명                  │
│  이름 + 소속 + 서명만        │  참석자 유형별 양식 차등             │
│  약관동의 없음              │  참고자료 첨부 발송                  │
│  2단계 (입력->서명)          │  4단계 (확인->동의->입력->서명)      │
│  출석 명부 PDF              │  양식별 서명문서 PDF                │
└─────────────────────────────┴───────────────────────────────────┘
```

#### 세미나 모드 (SEMINAR)
- **용도**: 설명회, 세미나, 워크숍 등 단순 출석 확인
- **특징**:
  - 공용 QR 코드로 현장 즉시 서명
  - 이름, 소속, 서명만 수집
  - 약관동의, 서약서 등 불필요
  - 사전등록 불필요
- **산출물**: 참석자 명부 PDF

#### 자문회의 모드 (ADVISORY)
- **용도**: 자문회의, 심의회의 등 문서 서명 필요
- **특징**:
  - 이메일로 개인 링크 발송
  - 참석자 유형별 양식 차등 적용
  - 참고자료 첨부 발송 가능
  - 사전등록 필수 (이름, 소속, 이메일)
- **산출물**: 양식별 서명문서 PDF (개인정보 동의서, 서약서 등)

### 1.3 참석자 유형 (자문회의 모드)

| 참석자 유형 | 코드 | 자문비 | 기본 양식 | 입력 정보 |
|------------|------|--------|----------|----------|
| **외부 자문위원** | EXTERNAL_ADVISOR | O 지급 | 개인정보 동의서 + 서약서 | 주민번호, 주소, 계좌 등 |
| **내부 위원** | INTERNAL_MEMBER | X 없음 | 서약서만 | 이름, 소속, 직위 |
| **참관인** | OBSERVER | X 없음 | 서약서만 (또는 명부만) | 이름, 소속 |

### 1.4 서명 양식 유형 (기본 템플릿)

시스템에서 제공하는 기본 템플릿입니다. 관리자는 이를 복제하여 커스텀 템플릿을 생성할 수 있습니다.

| 양식 | 코드 | 대상 | 수집정보 | 보관기간 |
|------|------|------|----------|----------|
| **개인정보 동의서** | PRIVACY_CONSENT | 자문비 지급 대상 | 주민번호, 주소, 계좌정보 | PDF 후 삭제 |
| **참석자 명단** | ATTENDEE_LIST | 일반 참석자 | 소속, 직위, 성명 | PDF 후 삭제 |
| **비밀유지 서약서** | SECURITY_PLEDGE | 비밀유지 필요 대상 | 소속, 직위, 성명 | PDF 후 삭제 |

> **템플릿 관리**: 기본 템플릿은 수정/삭제 불가하며, 복제하여 커스텀 템플릿으로 활용합니다.
> 커스텀 템플릿은 필드, 동의항목, 텍스트 등을 자유롭게 수정할 수 있습니다.

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
| react-hook-form + zod | 폼 검증 |

### 2.2 백엔드
| 기술 | 용도 |
|------|------|
| Next.js API Routes | API 서버 |
| Prisma | ORM |
| SQLite/PostgreSQL | 데이터베이스 |
| NextAuth.js | 인증 |
| Resend | 이메일 발송 |
| jsPDF + html2canvas | PDF 생성 |
| nanoid | 토큰 생성 |
| bcrypt | 비밀번호 해싱 |

### 2.3 파일 저장소
- **방식**: 로컬 파일시스템
- **경로**: `/data/uploads/meetings/{meetingId}/`
- **용도**: 참고자료 첨부파일, 서명 이미지

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

Meeting (회의)
├── id: String (PK)
├── type: Enum (SEMINAR, ADVISORY)  // 회의 유형
├── title: String (회의명)
├── topic: String? (회의주제 - 자문회의만)
├── date: DateTime (일시)
├── startTime: String
├── endTime: String
├── location: String (장소)
├── hostId: String (FK -> User)
├── hostDepartment: String (주관부서)
├── allowedTemplates: String[]? (사용 가능 양식 템플릿 ID - 자문회의만)
├── accessToken: String (세미나용 공용 QR 토큰)
├── status: Enum (OPEN, CLOSED, COMPLETED)
├── expiresAt: DateTime (URL 만료시간)
├── createdAt: DateTime
└── updatedAt: DateTime

MeetingAttachment (회의 첨부파일 - 자문회의만)
├── id: String (PK)
├── meetingId: String (FK -> Meeting)
├── fileName: String (원본 파일명)
├── fileSize: Int (바이트)
├── mimeType: String
├── storagePath: String (로컬 저장 경로)
├── uploadedAt: DateTime
└── uploadedBy: String (FK -> User)

SeminarAttendee (세미나 참석자 - 간소화)
├── id: String (PK)
├── meetingId: String (FK -> Meeting)
├── name: String (성명)
├── department: String (소속)
├── signatureData: Text (서명 이미지 Base64)
├── signedAt: DateTime
└── createdAt: DateTime

AdvisoryAttendee (자문회의 참석자)
├── id: String (PK)
├── meetingId: String (FK -> Meeting)
├── type: Enum (EXTERNAL_ADVISOR, INTERNAL_MEMBER, OBSERVER)
├── name: String (성명)
├── department: String (소속)
├── position: String (직위)
├── email: String (이메일)
├── personalToken: String (개인 링크용 토큰)
├── assignedTemplates: String[] (지정된 양식 템플릿 ID)
├── emailSentAt: DateTime? (초대 이메일 발송 시간)
├── emailStatus: Enum (PENDING, SENT, FAILED, OPENED)
│
├── [서명 정보]
├── signatureData: Text? (서명 이미지)
├── signedAt: DateTime?
├── status: Enum (PENDING, SIGNED)
│
├── [개인정보 동의서 - 외부 자문위원만]
├── residentNumber: String? (주민번호 - AES-256 암호화)
├── address: String? (주소)
├── phoneNumber: String? (전화번호)
├── bankName: String? (은행명)
├── accountHolder: String? (예금주)
├── accountNumber: String? (계좌번호 - AES-256 암호화)
├── privacyConsentAt: DateTime?
├── identifierConsentAt: DateTime?
├── thirdPartyConsentAt: DateTime?
│
├── [서약서]
├── securityPledgeAt: DateTime?
│
├── createdAt: DateTime
└── updatedAt: DateTime

SignatureTemplate (서명 양식 템플릿)
├── id: String (PK)
├── code: String (Unique, 시스템 코드)
│   // 기본 템플릿: 'PRIVACY_CONSENT', 'SECURITY_PLEDGE', 'ATTENDEE_LIST'
│   // 커스텀 템플릿: nanoid로 자동 생성 (예: 'TPL_Vk3xHj9mQ2')
├── name: String (양식명)
├── description: String? (설명)
├── category: Enum (CONSENT, PLEDGE, LIST)  // 동의서, 서약서, 명단
├── isDefault: Boolean (기본 템플릿 여부, 기본템플릿은 삭제/수정 불가)
├── isActive: Boolean (활성화 여부)
├── baseTemplateId: String? (FK -> SignatureTemplate, 커스터마이징 시 원본)
│
├── [양식 설정 - JSON]
├── requiredFields: Json (필수 입력 필드 목록)
├── optionalFields: Json (선택 입력 필드 목록)
├── consentItems: Json (동의 항목들)
├── headerText: String? (양식 상단 텍스트)
├── footerText: String? (양식 하단 텍스트)
│
├── [PDF 템플릿]
├── pdfTemplateHtml: Text? (PDF 생성용 HTML 템플릿)
│
├── createdAt: DateTime
├── updatedAt: DateTime
└── createdBy: String (FK -> User)

SignatureDocument (서명 문서)
├── id: String (PK)
├── meetingId: String (FK -> Meeting)
├── templateId: String (FK -> SignatureTemplate)
├── pdfPath: String
├── generatedAt: DateTime
└── generatedBy: String (FK -> User)

Menu (메뉴)
├── id: String (PK)
├── name: String
├── path: String
├── parentId: String? (Self FK)
├── order: Int
└── icon: String

Permission (권한)
├── id: String (PK)
├── userId: String (FK -> User)
├── menuId: String (FK -> Menu)
├── canRead: Boolean
├── canWrite: Boolean
└── canDelete: Boolean
```

---

## 4. 화면 설계

### 4.1 관리자 페이지 (인증 필요)

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 로그인 | `/login` | 담당자 로그인 |
| 회의 목록 | `/meetings` | 회의 목록/검색/필터 (메인 페이지) |
| 회의 등록 | `/meetings/new` | 회의 유형 선택 -> 유형별 폼 |
| 회의 상세 | `/meetings/[id]` | QR/참석자 현황/PDF 생성 |
| 회의 수정 | `/meetings/[id]/edit` | 회의 정보 수정 |
| 사용자 관리 | `/users` | 사용자 CRUD |
| 서명양식 관리 | `/settings/templates` | 서명양식 목록/관리 |
| 서명양식 생성 | `/settings/templates/new` | 새 양식 생성 (기본 템플릿 복제) |
| 서명양식 편집 | `/settings/templates/[id]` | 양식 상세/편집 |
| 메뉴 관리 | `/settings/menus` | 메뉴 구조 관리 |
| 권한 관리 | `/settings/permissions` | 사용자별 권한 설정 |

### 4.2 세미나 모드 - 참석자 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 서명 | `/sign/s/[token]` | QR 스캔 -> 이름/소속 입력 -> 서명 -> 완료 (단일 페이지) |

**플로우 (2단계)**
```
QR 스캔 -> [이름/소속 입력 + 서명] -> 완료
```

### 4.3 자문회의 모드 - 참석자 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 회의 정보 | `/sign/a/[personalToken]` | 회의/본인 정보 확인 |
| 약관 동의 | `/sign/a/[personalToken]/agree` | 양식별 약관 동의 |
| 정보 입력 | `/sign/a/[personalToken]/info` | 추가 정보 입력 (양식에 따라) |
| 서명 | `/sign/a/[personalToken]/signature` | 서명 캔버스 |
| 완료 | `/sign/a/[personalToken]/complete` | 서명 완료 안내 |
| 오류 | `/sign/a/[personalToken]/expired` | 만료/오류 안내 |

**플로우 (4단계)**
```
이메일 링크 클릭 -> 회의/본인 확인 -> 약관 동의 -> 정보 입력 -> 서명 -> 완료
```

**서명 처리 방식**: 단일 서명으로 지정된 모든 양식(개인정보 동의서, 서약서 등)에 적용됩니다.
각 양식별 동의 시점은 개별 기록됩니다 (privacyConsentAt, securityPledgeAt 등).

### 4.4 화면 플로우

```
[관리자 플로우 - 세미나]
회의 등록 (유형: 세미나) -> QR 생성 -> 회의장 게시 -> 참석 현황 확인 -> 명부 PDF 출력

[관리자 플로우 - 자문회의]
회의 등록 (유형: 자문회의)
  -> 양식 선택
  -> 참고자료 첨부 (선택)
  -> 참석자 등록 (이름, 소속, 이메일, 유형, 양식)
  -> [초대 발송] 클릭
  -> 서명 현황 모니터링
  -> 미서명자 리마인더
  -> 양식별 PDF 생성

[참석자 플로우 - 세미나]
QR 스캔 -> 이름/소속 입력 -> 서명 -> 완료 (약관동의 없음)

[참석자 플로우 - 자문회의 외부자문위원]
이메일 링크 -> 회의확인 -> 개인정보동의 + 서약동의 -> 상세정보입력 -> 서명 -> 완료

[참석자 플로우 - 자문회의 내부위원]
이메일 링크 -> 회의확인 -> 서약동의 -> 기본정보확인 -> 서명 -> 완료
```

### 4.5 서명양식 관리 화면

#### 양식 목록 (`/settings/templates`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  서명양식 관리                                         [+ 새 양식 만들기]  │
├──────────────────────────────────────────────────────────────────────────┤
│  [전체] [동의서] [서약서] [명단]           검색 [________________] [검색]  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─ 기본 템플릿 ───────────────────────────────────────────────────────┐ │
│  │                                                                      │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │ │
│  │  │ 개인정보 동의서  │  │ 비밀유지 서약서 │  │ 참석자 명단     │        │ │
│  │  │ [동의서]        │  │ [서약서]        │  │ [명단]          │        │ │
│  │  │                │  │                │  │                │        │ │
│  │  │ 자문비 지급을 위한│  │ 회의 내용       │  │ 회의 참석 확인용 │        │ │
│  │  │ 개인정보 수집    │  │ 비밀유지 서약    │  │                │        │ │
│  │  │                │  │                │  │                │        │ │
│  │  │ [복제] [미리보기]│  │ [복제] [미리보기]│  │ [복제] [미리보기]│        │ │
│  │  └────────────────┘  └────────────────┘  └────────────────┘        │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─ 커스텀 템플릿 ──────────────────────────────────────────────────────┐ │
│  │                                                                      │ │
│  │  ┌────────────────┐  ┌────────────────┐                              │ │
│  │  │ 2024 자문회의   │  │ 보안 서약서     │                              │ │
│  │  │ 동의서         │  │ (강화버전)      │                              │ │
│  │  │ [동의서] 활성   │  │ [서약서] 활성   │                              │ │
│  │  │                │  │                │                              │ │
│  │  │ 개인정보 동의서  │  │ 비밀유지 서약서  │                              │ │
│  │  │ 기반 커스터마이징│  │ 기반 커스터마이징│                              │ │
│  │  │                │  │                │                              │ │
│  │  │ [편집][복제][삭제]│ │ [편집][복제][삭제]│                              │ │
│  │  └────────────────┘  └────────────────┘                              │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

#### 양식 편집 (`/settings/templates/[id]`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  < 뒤로                           양식 편집              [취소] [저장]   │
├────────────────────────────────────┬─────────────────────────────────────┤
│  기본 정보                          │  미리보기                           │
│  ────────────────                  │                                     │
│  양식명 [2024 자문회의 동의서____]   │  ┌─────────────────────────────┐   │
│                                    │  │                             │   │
│  설명 [개인정보 동의서 기반_____]    │  │    개인정보 수집 동의서       │   │
│       [커스터마이징 버전_________]   │  │                             │   │
│                                    │  │  한국방송통신전파진흥원장 귀하  │   │
│  분류  (o) 동의서 ( ) 서약서 ( ) 명단│  │                             │   │
│                                    │  │  본인은 아래와 같이 개인정보   │   │
│  상태  [v] 활성화                   │  │  수집에 동의합니다.           │   │
│                                    │  │                             │   │
├────────────────────────────────────│  │  [수집항목]                  │   │
│  입력 필드 설정                      │  │  - 성명, 소속, 직위          │   │
│  ────────────────                  │  │  - 주민등록번호              │   │
│                                    │  │  - 주소                     │   │
│  필수 필드:                         │  │  - 계좌정보                  │   │
│  [v] 성명     [v] 소속   [v] 직위   │  │                             │   │
│  [v] 주민번호  [v] 주소             │  │  [동의항목]                  │   │
│  [v] 계좌정보                       │  │  [v] 개인정보 수집 동의       │   │
│                                    │  │  [v] 고유식별정보 처리 동의   │   │
│  선택 필드:                         │  │  [v] 제3자 제공 동의         │   │
│  [ ] 전화번호                       │  │                             │   │
│                                    │  │  서명: ________________      │   │
├────────────────────────────────────│  │                             │   │
│  동의 항목                          │  │  2024년 __월 __일           │   │
│  ────────────────                  │  │                             │   │
│  [v] 개인정보 수집/이용 동의         │  └─────────────────────────────┘   │
│  [v] 고유식별정보 처리 동의          │                                     │
│  [v] 제3자 제공 동의                │                                     │
│  [ ] + 동의 항목 추가               │                                     │
├────────────────────────────────────┤                                     │
│  양식 텍스트                        │                                     │
│  ────────────────                  │                                     │
│  상단 텍스트:                       │                                     │
│  [한국방송통신전파진흥원장 귀하___]   │                                     │
│                                    │                                     │
│  하단 텍스트:                       │                                     │
│  [위 내용을 확인하고 동의합니다___]   │                                     │
└────────────────────────────────────┴─────────────────────────────────────┘
```

#### 회의 생성 시 양식 선택 UI

```
┌─────────────────────────────────────────────────────────────────┐
│  서명 양식 선택                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [v] 개인정보 동의서                              [기본]         │
│      자문비 지급을 위한 개인정보 수집 동의                         │
│                                                                 │
│  [ ] 2024 자문회의 동의서                         [커스텀]       │
│      개인정보 동의서 기반 커스터마이징 버전                        │
│                                                                 │
│  [v] 비밀유지 서약서                              [기본]         │
│      회의 내용 비밀유지 서약                                     │
│                                                                 │
│  [ ] 보안 서약서 (강화버전)                       [커스텀]       │
│      비밀유지 서약서 기반 커스터마이징 버전                        │
│                                                                 │
│  [v] 참석자 명단                                  [기본]         │
│      회의 참석 확인용                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 회의 등록 UI

### 5.1 회의 유형 선택 (1단계)

```
┌──────────────────────────────────────────────────────────┐
│  회의 유형을 선택하세요                                    │
├────────────────────────┬─────────────────────────────────┤
│  ┌──────────────────┐  │  ┌──────────────────────────┐  │
│  │  설명회/세미나    │  │  │  자문회의                │  │
│  │                  │  │  │                          │  │
│  │  단순 출석 확인   │  │  │  문서 서명 필요           │  │
│  │  QR 현장 서명    │  │  │  이메일 초대 발송         │  │
│  │  이름/소속만     │  │  │  양식별 차등 서명         │  │
│  │                  │  │  │                          │  │
│  │    [ 선택 ]      │  │  │      [ 선택 ]            │  │
│  └──────────────────┘  │  └──────────────────────────┘  │
└────────────────────────┴─────────────────────────────────┘
```

### 5.2 세미나 모드 폼

```
┌─────────────────────────────────────────────────────────┐
│  세미나/설명회 등록                                       │
├─────────────────────────────────────────────────────────┤
│  회의명 [________________________________]              │
│  일시   [____년 __월 __일]  [__:__] ~ [__:__]          │
│  장소   [________________________________]              │
│  주관부서 [________________________________]            │
├─────────────────────────────────────────────────────────┤
│              [ 취소 ]  [ 등록 ]                         │
└─────────────────────────────────────────────────────────┘
```

### 5.3 자문회의 모드 폼 (2컬럼)

```
┌─────────────────────────────────┬───────────────────────────────┐
│  기본 정보                       │  참석자 등록          [+ 추가] │
├─────────────────────────────────┼───────────────────────────────┤
│  회의명 [__________________]    │                               │
│  주제   [__________________]    │  홍길동 | 서울대 | 외부자문위원  │
│  일시   [__년 __월 __일]        │    hong@snu.ac.kr             │
│         [__:__] ~ [__:__]       │    개인정보동의서 + 서약서      │
│  장소   [__________________]    │                     [수정][삭제]│
│  주관부서 [__________________]  │  ─────────────────────────────│
│                                 │  김철수 | 기획팀 | 내부위원     │
│  서명 양식:                      │    kim@kca.kr                 │
│  [v] 개인정보 동의서             │    서약서                      │
│  [v] 비밀유지 서약서             │                     [수정][삭제]│
│  [ ] 참석자 명단                 │                               │
├─────────────────────────────────┼───────────────────────────────┤
│  참고자료 첨부 (선택)            │                               │
│  ┌─────────────────────────┐   │                               │
│  │  파일을 드래그하거나 클릭  │   │                               │
│  └─────────────────────────┘   │                               │
│  사업계획.pdf  2.3MB    [삭제]  │                               │
│  회의안건.hwp  0.8MB    [삭제]  │                               │
│  총 3.1MB / 10MB               │                               │
├─────────────────────────────────┴───────────────────────────────┤
│                    [ 취소 ]  [ 등록 ]                           │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4 참석자 추가 다이얼로그

```
┌─────────────────────────────────────────┐
│  참석자 추가                             │
├─────────────────────────────────────────┤
│  이름   [홍길동______________]          │
│  소속   [서울대학교__________]          │
│  직위   [교수________________]          │
│  이메일 [hong@snu.ac.kr_____]          │
│                                         │
│  참석자 유형:                            │
│  (o) 외부 자문위원 (자문비 지급)         │
│  ( ) 내부 위원                          │
│  ( ) 참관인                             │
│                                         │
│  서명 양식: (자동 선택됨, 수정 가능)      │
│  [v] 개인정보 동의서                     │
│  [v] 비밀유지 서약서                     │
├─────────────────────────────────────────┤
│           [ 취소 ]  [ 추가 ]            │
└─────────────────────────────────────────┘
```

---

## 6. 이메일 템플릿

### 6.1 자문회의 초대 이메일

```
제목: [KCA] 2024년 1분기 자문회의 서명 요청

────────────────────────────────────────────

안녕하세요, 홍길동님.

아래 회의에 참석해 주셔서 감사합니다.
서명 전 첨부된 참고자료를 확인해 주시기 바랍니다.

회의 정보
   회의명: 2024년 1분기 사업계획 자문회의
   일시: 2024년 3월 15일(금) 14:00~16:00
   장소: 본관 3층 대회의실
   주관: 기획조정실

첨부자료 (3개)
   - 2024_1분기_사업계획.pdf
   - 회의안건.hwp
   - 참석자_안내문.pdf

서명 양식
   - 개인정보 동의서
   - 비밀유지 서약서

             [ 서명하기 ]

이 링크는 본인 전용입니다.
서명 마감: 2024년 3월 15일 18:00

────────────────────────────────────────────
한국방송통신전파진흥원(KCA)
```

---

## 7. 파일 저장소 구조

```
프로젝트 루트/
└── data/
    └── uploads/
        └── meetings/
            └── {meetingId}/
                ├── attachments/           # 참고자료 첨부파일
                │   ├── 사업계획.pdf
                │   └── 회의안건.hwp
                └── signatures/            # 서명 이미지 (임시)
                    └── {attendeeId}.png
```

**환경변수 설정:**
```env
UPLOAD_DIR=./data/uploads
MAX_FILE_SIZE=5242880        # 5MB (파일당)
MAX_TOTAL_SIZE=10485760      # 10MB (총합)
```

**허용 파일 형식:**
- PDF, HWP, DOC, DOCX, PPT, PPTX, XLS, XLSX

---

## 8. API 설계

### 8.1 회의 API
```
POST   /api/meetings                    회의 생성
GET    /api/meetings                    회의 목록
GET    /api/meetings/:id                회의 상세
PUT    /api/meetings/:id                회의 수정
DELETE /api/meetings/:id                회의 삭제
POST   /api/meetings/:id/close          회의 종료

# 자문회의 전용 - 첨부파일
POST   /api/meetings/:id/attachments    첨부파일 업로드
DELETE /api/meetings/:id/attachments/:fileId  첨부파일 삭제

# 자문회의 전용 - 참석자 관리
GET    /api/meetings/:id/attendees      참석자 목록
POST   /api/meetings/:id/attendees      참석자 추가
PUT    /api/meetings/:id/attendees/:attendeeId    참석자 수정
DELETE /api/meetings/:id/attendees/:attendeeId    참석자 삭제

# 자문회의 전용 - 초대 발송
POST   /api/meetings/:id/send-invites   초대 이메일 일괄 발송
POST   /api/meetings/:id/attendees/:attendeeId/resend  개별 재발송

# 세미나 전용 - 참석자 현황
GET    /api/meetings/:id/seminar-attendees  세미나 참석자 목록 (관리자 조회용)
```

### 8.2 서명 API
```
# 세미나 모드
GET    /api/sign/s/:token               회의 정보 조회
POST   /api/sign/s/:token               서명 제출 (이름, 소속, 서명)

# 자문회의 모드
GET    /api/sign/a/:personalToken       회의/참석자 정보 조회
POST   /api/sign/a/:personalToken       서명 제출
```

### 8.3 PDF API
```
POST   /api/meetings/:id/generate-pdf   PDF 생성
GET    /api/meetings/:id/download-pdf   PDF 다운로드
```

### 8.4 서명양식 템플릿 API
```
GET    /api/templates                 양식 목록 (activeOnly 쿼리 파라미터)
POST   /api/templates                 양식 생성 (커스텀 템플릿)
GET    /api/templates/:id             양식 상세
PUT    /api/templates/:id             양식 수정 (커스텀 템플릿만)
DELETE /api/templates/:id             양식 삭제 (커스텀 템플릿만)
POST   /api/templates/:id/duplicate   양식 복제 (기본 -> 커스텀)
GET    /api/templates/:id/preview     양식 미리보기 (HTML)
```

### 8.5 사용자/권한 API
```
POST   /api/users          사용자 생성
GET    /api/users          사용자 목록
PUT    /api/users/:id      사용자 수정
DELETE /api/users/:id      사용자 삭제

GET    /api/menus          메뉴 목록
PUT    /api/menus          메뉴 수정

GET    /api/permissions    권한 목록
PUT    /api/permissions    권한 수정
```

---

## 9. 구현 Phase

### Phase 1: 기반 구축 (완료)
- [x] 프로젝트 설정 (Next.js 16, shadcn/ui, Tailwind 4)
- [x] 폴더 구조 및 공통 타입 정의
- [x] 관리자 레이아웃 (상단 네비게이션)
- [x] 모바일 레이아웃
- [x] 로그인/사용자/메뉴/권한 관리 UI

### Phase 1.5: 서명양식 관리 기능
- [ ] SignatureTemplate 타입 정의
- [ ] 서명양식 목록 페이지 (`/settings/templates`)
- [ ] 기본 템플릿 3종 시드 데이터 (개인정보 동의서, 비밀유지 서약서, 참석자 명단)
- [ ] 양식 복제 기능 (기본 -> 커스텀)
- [ ] 양식 편집 페이지 (`/settings/templates/[id]`)
  - [ ] 기본 정보 (양식명, 설명, 분류, 활성화 상태)
  - [ ] 입력 필드 설정 (필수/선택 필드 체크박스)
  - [ ] 동의 항목 설정
  - [ ] 양식 텍스트 설정 (상단/하단 텍스트)
- [ ] 양식 미리보기 기능
- [ ] 회의 생성 시 양식 선택 UI 연동

### Phase 2: 세미나 모드 구현
- [ ] 회의 유형 선택 UI
- [ ] 세미나 회의 등록 폼
- [ ] 세미나 서명 페이지 (QR -> 이름/소속/서명 -> 완료)
- [ ] 참석자 명부 PDF 생성

### Phase 3: 자문회의 모드 - 기본
- [ ] 자문회의 등록 폼 (2컬럼)
- [ ] 참석자 유형 선택 + 양식 자동 지정
- [ ] 이메일 서비스 연동 (Resend)
- [ ] 개인 토큰 시스템
- [ ] 초대 발송/재발송 기능

### Phase 4: 자문회의 모드 - 첨부파일
- [ ] 파일 업로드 UI (드래그앤드롭)
- [ ] 파일 업로드/삭제 API
- [ ] 로컬 파일시스템 저장
- [ ] 이메일 첨부 발송

### Phase 5: 자문회의 모드 - 서명 플로우
- [ ] 개인 링크 서명 페이지
- [ ] 참석자 유형별 양식 분기
- [ ] 외부 자문위원: 개인정보동의서 + 서약서
- [ ] 내부 위원: 서약서만
- [ ] 양식별 PDF 생성

### Phase 6: 백엔드 통합
- [ ] Prisma 스키마 정의
- [ ] NextAuth.js 설정
- [ ] API 구현
- [ ] 프론트엔드-백엔드 연동

### Phase 7: 고도화
- [ ] 서명 현황 대시보드
- [ ] 리마인더 발송
- [ ] AI 서명 품질 검증 (선택)

---

## 10. 상수 정의 (lib/constants.ts)

```typescript
// 회의 유형
export const MEETING_TYPES = {
  SEMINAR: {
    code: 'SEMINAR',
    label: '설명회/세미나',
    description: '단순 출석 확인 (QR 서명)',
  },
  ADVISORY: {
    code: 'ADVISORY',
    label: '자문회의',
    description: '문서 서명 필요 (이메일 초대)',
  },
} as const

// 참석자 유형
// defaultTemplateCodes: 기본 템플릿의 code 필드와 매칭하여 템플릿 ID 조회
export const ATTENDEE_TYPES = {
  EXTERNAL_ADVISOR: {
    code: 'EXTERNAL_ADVISOR',
    label: '외부 자문위원',
    description: '자문비 지급 대상',
    defaultTemplateCodes: ['PRIVACY_CONSENT', 'SECURITY_PLEDGE'],
  },
  INTERNAL_MEMBER: {
    code: 'INTERNAL_MEMBER',
    label: '내부 위원',
    description: '자문비 없음',
    defaultTemplateCodes: ['SECURITY_PLEDGE'],
  },
  OBSERVER: {
    code: 'OBSERVER',
    label: '참관인',
    description: '자문비 없음',
    defaultTemplateCodes: ['SECURITY_PLEDGE'],
  },
} as const

// 양식 카테고리
export const TEMPLATE_CATEGORIES = {
  CONSENT: {
    code: 'CONSENT',
    label: '동의서',
    color: 'bg-blue-100 text-blue-800',
  },
  PLEDGE: {
    code: 'PLEDGE',
    label: '서약서',
    color: 'bg-purple-100 text-purple-800',
  },
  LIST: {
    code: 'LIST',
    label: '명단',
    color: 'bg-green-100 text-green-800',
  },
} as const

// 기본 입력 필드 정의
export const TEMPLATE_FIELDS = {
  NAME: { code: 'name', label: '성명', type: 'text', group: 'basic' },
  DEPARTMENT: { code: 'department', label: '소속', type: 'text', group: 'basic' },
  POSITION: { code: 'position', label: '직위', type: 'text', group: 'basic' },
  RESIDENT_NUMBER: { code: 'residentNumber', label: '주민등록번호', type: 'resident', group: 'personal' },
  ADDRESS: { code: 'address', label: '주소', type: 'text', group: 'personal' },
  PHONE_NUMBER: { code: 'phoneNumber', label: '전화번호', type: 'tel', group: 'personal' },
  BANK_NAME: { code: 'bankName', label: '은행명', type: 'text', group: 'account' },
  ACCOUNT_HOLDER: { code: 'accountHolder', label: '예금주', type: 'text', group: 'account' },
  ACCOUNT_NUMBER: { code: 'accountNumber', label: '계좌번호', type: 'text', group: 'account' },
} as const

// 기본 동의 항목 정의
export const CONSENT_ITEMS = {
  PRIVACY_CONSENT: { code: 'privacyConsent', label: '개인정보 수집/이용 동의', required: true },
  IDENTIFIER_CONSENT: { code: 'identifierConsent', label: '고유식별정보 처리 동의', required: true },
  THIRD_PARTY_CONSENT: { code: 'thirdPartyConsent', label: '제3자 제공 동의', required: false },
  SECURITY_PLEDGE: { code: 'securityPledge', label: '비밀유지 서약', required: true },
} as const

// 기본 서명 양식 템플릿 (시드 데이터)
export const DEFAULT_TEMPLATES = {
  PRIVACY_CONSENT: {
    code: 'PRIVACY_CONSENT',
    name: '개인정보 동의서',
    description: '자문비 지급을 위한 개인정보 수집 동의',
    category: 'CONSENT',
    isDefault: true,
    requiredFields: ['name', 'department', 'position', 'residentNumber', 'address', 'bankName', 'accountHolder', 'accountNumber'],
    optionalFields: ['phoneNumber'],
    consentItems: ['privacyConsent', 'identifierConsent', 'thirdPartyConsent'],
    headerText: '한국방송통신전파진흥원장 귀하',
    footerText: '위 내용을 확인하고 동의합니다.',
  },
  ATTENDEE_LIST: {
    code: 'ATTENDEE_LIST',
    name: '참석자 명단',
    description: '회의 참석 확인용',
    category: 'LIST',
    isDefault: true,
    requiredFields: ['name', 'department', 'position'],
    optionalFields: [],
    consentItems: [],
    headerText: '',
    footerText: '',
  },
  SECURITY_PLEDGE: {
    code: 'SECURITY_PLEDGE',
    name: '비밀유지 서약서',
    description: '회의 내용 비밀유지 서약',
    category: 'PLEDGE',
    isDefault: true,
    requiredFields: ['name', 'department', 'position'],
    optionalFields: [],
    consentItems: ['securityPledge'],
    headerText: '한국방송통신전파진흥원장 귀하',
    footerText: '위 내용에 대해 비밀을 유지할 것을 서약합니다.',
  },
} as const

// 파일 업로드 설정
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,      // 5MB
  MAX_TOTAL_SIZE: 10 * 1024 * 1024,    // 10MB
  MAX_FILE_COUNT: 5,
  ALLOWED_TYPES: [
    'application/pdf',
    'application/haansofthwp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  ALLOWED_EXTENSIONS: ['pdf', 'hwp', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
} as const
```

---

## 11. 보안 고려사항

### 11.1 인증/인가
- 관리자 페이지는 반드시 인증 필요
- API 요청 시 세션 검증
- 개인 토큰은 해당 참석자만 접근 가능

### 11.2 민감정보 암호화
- **암호화 대상**: 주민등록번호, 계좌번호
- **암호화 방식**: AES-256-GCM
- **복호화 시점**: PDF 생성 시에만

### 11.3 개인 토큰 보안
- nanoid 21자 이상 (예측 불가능)
- 만료 시간 설정
- 1회 서명 완료 시 비활성화
- HTTPS 필수

### 11.4 파일 업로드 보안
- 파일 타입 검증 (확장자 + MIME)
- 용량 제한 (파일당 5MB, 총 10MB)
- 저장 경로 외부 접근 차단

### 11.5 데이터 보관 정책

| 데이터 유형 | 보관 | 삭제 시점 |
|------------|------|----------|
| 서명 이미지 | 임시 | PDF 생성 후 즉시 삭제 |
| 주민등록번호/계좌번호 | 임시 | PDF 생성 후 즉시 삭제 |
| 기본정보 (소속, 직위, 성명) | 영구 | 삭제 안함 |
| 동의 시간 기록 | 영구 | 삭제 안함 |
| 생성된 PDF | 영구 | 담당자 직접 관리 |

---

## 12. 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| 1.0 | 2025-12-18 | 최초 작성 |
| 1.1 | 2025-12-18 | Phase 5 AI 서명 품질 검증 추가 |
| 1.2 | 2025-12-18 | 회의 유형 구분, 보안서약서 추가 |
| 1.3 | 2025-12-18 | 참석자별 양식 선택 방식 변경, 민감정보 삭제 정책 |
| 1.4 | 2025-12-18 | 하이브리드 참석자 등록 방식 추가 |
| 1.5 | 2025-12-20 | 기술스택 버전 업데이트, 프로젝트 구조 반영 |
| 2.0 | 2025-12-20 | 2-Mode 시스템 전면 개편 (세미나/자문회의), 참석자 유형별 양식 차등, 이메일 개인링크 방식, 첨부파일 기능 추가 |
| 2.1 | 2025-12-20 | 서명양식 관리 기능 추가 (기본/커스텀 템플릿, 양식 편집, 필드/동의항목 설정) |
| **2.2** | **2025-12-20** | **문서 일관성 개선: 참석자 API 추가, defaultTemplateCodes 명명 변경, 템플릿 code 생성규칙 명시, 서명 처리 방식 명시** |
