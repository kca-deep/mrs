# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MRS (Meeting Registry System) - 회의 서명관리 시스템. QR코드를 통한 모바일 서명 수집과 PDF 회의록 생성 기능을 제공하는 Next.js 애플리케이션.

## Commands

```bash
npm run dev      # 개발 서버 실행 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
```

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui (base-mira style)
- **Icons**: Hugeicons (@hugeicons/react)
- **Utilities**: clsx, tailwind-merge (`cn()` in lib/utils.ts)

## Architecture

### Route Structure (Planned)
```
/app
  /(admin)              # 관리자 영역 (인증 필요)
    /dashboard          # 대시보드
    /meetings           # 회의 관리
    /users              # 사용자 관리
    /settings           # 메뉴/권한 설정
  /(public)             # 공개 영역 (서명)
    /sign/[token]       # QR 스캔 → 약관동의 → 서명
  /api                  # API Routes
  /login
```

### Component Organization
```
/components
  /ui         # shadcn/ui 컴포넌트 (Button, Card, Input 등)
  /layout     # 레이아웃 컴포넌트
  /meeting    # 회의 관련 컴포넌트
  /signature  # 서명 관련 컴포넌트
  /common     # 공통 컴포넌트
```

### Path Aliases
- `@/components` → `/components`
- `@/lib` → `/lib`
- `@/hooks` → `/hooks`

## Key Patterns

### shadcn/ui 컴포넌트 추가
```bash
npx shadcn@latest add [component-name]
```

### 클래스 병합
```typescript
import { cn } from "@/lib/utils"
cn("base-class", conditional && "conditional-class", className)
```

## Coding Guidelines

### 필수 규칙
- **하드코딩 금지**: 모든 설정값, 문자열, URL 등은 상수 또는 환경변수로 분리
- **이모지 사용 금지**: 코드, 주석, UI 텍스트에 이모지 사용하지 않음

### 코드 품질
- 재사용 가능한 컴포넌트/함수로 분리하여 DRY 원칙 준수
- 단일 책임 원칙: 한 컴포넌트/함수는 하나의 역할만 수행
- Props와 타입은 명확하게 정의하고 `types/` 폴더에서 중앙 관리
- 비즈니스 로직은 커스텀 훅으로 분리 (`hooks/`)

### 반응형 디자인 (Mobile-First)
- 모바일 우선 접근: 기본 스타일은 모바일, `md:`, `lg:` 등으로 확장
- 터치 친화적 UI: 최소 탭 영역 44px, 적절한 간격
- 뷰포트 단위 활용: 모바일에서 `dvh` 사용 권장
- 서명 페이지는 모바일 최적화 필수

### 상수 관리 예시
```typescript
// lib/constants.ts
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MEETINGS: '/meetings',
} as const

export const API_ENDPOINTS = {
  MEETINGS: '/api/meetings',
  USERS: '/api/users',
} as const

export const MEETING_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  COMPLETED: 'COMPLETED',
} as const
```

## Implementation Reference

상세 구현 계획은 `docs/implementation-plan.md` 참조.
