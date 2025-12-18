// PDF Template Constants

export const PDF_CONFIG = {
  PAGE_WIDTH: 210, // A4 width in mm
  PAGE_HEIGHT: 297, // A4 height in mm
  MARGIN: {
    TOP: 20,
    RIGHT: 15,
    BOTTOM: 20,
    LEFT: 15,
  },
  FONT_SIZE: {
    TITLE: 16,
    SUBTITLE: 14,
    HEADING: 12,
    BODY: 10,
    SMALL: 8,
  },
  LINE_HEIGHT: 6,
  TABLE: {
    HEADER_HEIGHT: 10,
    ROW_HEIGHT: 12,
    SIGNATURE_HEIGHT: 20,
  },
} as const

// Attendee List Template Text
export const ATTENDEE_LIST_TEMPLATE = {
  TITLE: "회의 참석자 명단",
  COLUMNS: ["구분", "소속", "직위", "성명", "서명"],
  COLUMN_WIDTHS: [15, 50, 30, 30, 35], // total: 160
} as const

// Privacy Consent Template Text
export const PRIVACY_CONSENT_TEMPLATE = {
  TITLE: "개인정보 수집 및 이용 동의서",
  SECTIONS: {
    PRIVACY: {
      TITLE: "1. 개인정보 수집 및 이용 동의",
      CONTENT: `[수집 목적] 참석자 자문비 지급
[수집 항목] 소속, 직위, 성명, 주소, 휴대전화번호, 은행명, 예금주, 계좌번호
[보유 기간] PDF 생성 후 즉시 삭제`,
    },
    IDENTIFIER: {
      TITLE: "2. 고유식별정보(주민등록번호) 수집 동의",
      CONTENT: `[처리 목적] 소득세법에 따른 소득세 신고 및 지급명세서 제출
[수집 항목] 주민등록번호
[보유 기간] PDF 생성 후 즉시 삭제
[법적 근거] 개인정보보호법 제24조의2제1항제1호, 소득세법 시행령 제193조/213조`,
    },
    THIRD_PARTY: {
      TITLE: "3. 제3자 제공 동의",
      CONTENT: `[제공받는자] 국세청(홈택스), 감사기관
[제공 목적] 소득세 신고, 정부부처 감사
[제공 항목] 성명, 주민등록번호, 주소 등
[법적 근거] 개인정보보호법 제17조제1항제2호, 국회법 제128조, 감사원법 제27조/50조`,
    },
  },
  TABLE_COLUMNS: ["소속", "성명", "직위", "주민등록번호", "주소", "전화번호", "은행", "계좌번호", "서명"],
  TABLE_COLUMN_WIDTHS: [25, 20, 20, 30, 35, 25, 20, 30, 20], // total: 225 -> adjusted for A4
} as const

// Security Pledge Template Text
export const SECURITY_PLEDGE_TEMPLATE = {
  TITLE: "서 약 서",
  FORM_NUMBER: "[별지 제5호서식]",
  CONTENT_TEMPLATE: (meetingTitle: string, meetingTopic: string) => `
본인은 한국방송통신전파진흥원에서 발주 예정인 「${meetingTitle}」 사업의 ${meetingTopic}와 관련하여 취득한 제반 내용을 발주기관의 허락 없이 어떠한 경우에도 공개하거나 유포하지 않을 것을 서약합니다.
`,
  FOOTER: "한국방송통신전파진흥원장 귀하",
  FIELDS: ["소 속 :", "직 위 :", "성 명 :"],
} as const

// Date formatter for PDF
export const formatPdfDate = (date: Date): string => {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export const formatPdfDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
