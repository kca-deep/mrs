// 라우트 경로
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  MEETINGS: '/meetings',
  MEETINGS_NEW: '/meetings/new',
  USERS: '/users',
  SETTINGS: '/settings',
  SETTINGS_MENUS: '/settings/menus',
  SETTINGS_PERMISSIONS: '/settings/permissions',
  SIGN: '/sign',
} as const

// API 엔드포인트
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    SESSION: '/api/auth/session',
  },
  USERS: '/api/users',
  MEETINGS: '/api/meetings',
  ATTENDEES: '/api/attendees',
  SIGN: '/api/sign',
  MENUS: '/api/menus',
  PERMISSIONS: '/api/permissions',
  AI: {
    VALIDATE_SIGNATURE: '/api/ai/validate-signature',
  },
} as const

// 서명 양식 유형
export const FORM_TYPES = {
  PRIVACY_CONSENT: {
    code: 'PRIVACY_CONSENT',
    label: '개인정보 동의서',
    description: '자문비 지급 대상 (주민번호, 계좌정보 수집)',
  },
  ATTENDEE_LIST: {
    code: 'ATTENDEE_LIST',
    label: '참석자 명단',
    description: '일반 참석자 (소속, 직위, 성명)',
  },
  SECURITY_PLEDGE: {
    code: 'SECURITY_PLEDGE',
    label: '서약서',
    description: '비밀유지 서약 대상',
  },
} as const

// 사용자 역할
export const USER_ROLES = {
  ADMIN: {
    code: 'ADMIN',
    label: '관리자',
  },
  MANAGER: {
    code: 'MANAGER',
    label: '담당자',
  },
} as const

// 회의 상태
export const MEETING_STATUS = {
  OPEN: {
    code: 'OPEN',
    label: '진행중',
    color: 'bg-green-100 text-green-800',
  },
  CLOSED: {
    code: 'CLOSED',
    label: '종료',
    color: 'bg-gray-100 text-gray-800',
  },
  COMPLETED: {
    code: 'COMPLETED',
    label: '완료',
    color: 'bg-blue-100 text-blue-800',
  },
} as const

// 참석자 상태
export const ATTENDEE_STATUS = {
  PENDING: {
    code: 'PENDING',
    label: '대기',
    color: 'bg-yellow-100 text-yellow-800',
  },
  SIGNED: {
    code: 'SIGNED',
    label: '서명완료',
    color: 'bg-green-100 text-green-800',
  },
} as const

// 사이드바 메뉴 아이템
export const SIDEBAR_MENU_ITEMS = [
  {
    title: '회의 관리',
    path: ROUTES.MEETINGS,
    icon: 'Calendar03Icon',
  },
  {
    title: '사용자 관리',
    path: ROUTES.USERS,
    icon: 'UserMultipleIcon',
  },
  {
    title: '설정',
    path: ROUTES.SETTINGS,
    icon: 'Settings02Icon',
    children: [
      {
        title: '메뉴 관리',
        path: ROUTES.SETTINGS_MENUS,
      },
      {
        title: '권한 관리',
        path: ROUTES.SETTINGS_PERMISSIONS,
      },
    ],
  },
] as const

// 페이지네이션 기본값
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const

// 서명 검증 임계값
export const SIGNATURE_VALIDATION = {
  MIN_SCORE: 60,
  MAX_RETRY: 3,
} as const
