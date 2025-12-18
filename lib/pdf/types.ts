import type { Meeting, Attendee, FormType } from "@/types"

export interface PdfGeneratorOptions {
  meeting: Meeting
  attendees: Attendee[]
  formType: FormType
}

export interface PdfTemplateData {
  // Meeting info
  meetingTitle: string
  meetingTopic: string
  meetingDateTime: string
  meetingLocation: string
  hostDepartment: string

  // Attendee info
  attendees: AttendeeData[]
}

export interface AttendeeData {
  index: number
  name: string
  department: string
  position: string
  signatureDataUrl?: string
  signedAt?: string

  // Privacy consent only
  residentNumber?: string
  address?: string
  phoneNumber?: string
  bankName?: string
  accountHolder?: string
  accountNumber?: string
}
