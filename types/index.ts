// 사용자 역할
export type UserRole = 'ADMIN' | 'MANAGER'

// 사용자
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

// 회의 상태
export type MeetingStatus = 'OPEN' | 'CLOSED' | 'COMPLETED'

// 서명 양식 유형
export type FormType = 'PRIVACY_CONSENT' | 'ATTENDEE_LIST' | 'SECURITY_PLEDGE'

// 회의
export interface Meeting {
  id: string
  title: string
  topic: string
  date: Date
  startTime: string // HH:mm 형식
  endTime: string   // HH:mm 형식
  location: string
  hostId: string
  hostDepartment: string
  allowedForms: FormType[]
  status: MeetingStatus
  accessToken: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  // 관계 데이터 (조회 시 포함)
  preRegisteredAttendees?: PreRegisteredAttendee[]
}

// 참석자 상태
export type AttendeeStatus = 'PENDING' | 'SIGNED'

// 사전등록 참석자
export interface PreRegisteredAttendee {
  id: string
  meetingId: string
  name: string
  phoneNumber: string
  assignedForms: FormType[]
  status: AttendeeStatus
}

// 참석자
export interface Attendee {
  id: string
  meetingId: string
  selectedForms: FormType[]
  name: string
  department: string
  position: string
  signatureData?: string
  signedAt?: Date
  status: AttendeeStatus
  // 개인정보 동의서 전용 필드
  residentNumber?: string
  address?: string
  phoneNumber?: string
  bankName?: string
  accountHolder?: string
  accountNumber?: string
  privacyConsentAt?: Date
  identifierConsentAt?: Date
  thirdPartyConsentAt?: Date
  // 서약서 전용 필드
  securityPledgeAt?: Date
  // 참석자 명단 전용 필드
  attendeeListConsentAt?: Date
}

// 서명 문서
export interface SignatureDocument {
  id: string
  meetingId: string
  pdfPath: string
  generatedAt: Date
  generatedBy: string
}

// 메뉴
export interface Menu {
  id: string
  name: string
  path: string
  parentId?: string
  order: number
  icon?: string
}

// 권한
export interface Permission {
  id: string
  userId: string
  menuId: string
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 페이지네이션
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 세션 사용자
export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
}
