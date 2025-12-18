import { jsPDF } from "jspdf"
import type { Meeting, Attendee, FormType } from "@/types"
import {
  PDF_CONFIG,
  ATTENDEE_LIST_TEMPLATE,
  PRIVACY_CONSENT_TEMPLATE,
  SECURITY_PLEDGE_TEMPLATE,
  formatPdfDate,
  formatPdfDateTime,
} from "./templates"

export interface GeneratePdfOptions {
  meeting: Meeting
  attendees: Attendee[]
  formType: FormType
}

export interface GeneratePdfResult {
  blob: Blob
  filename: string
}

/**
 * Generate PDF based on form type
 */
export async function generatePdf(options: GeneratePdfOptions): Promise<GeneratePdfResult> {
  const { meeting, attendees, formType } = options

  switch (formType) {
    case "ATTENDEE_LIST":
      return generateAttendeeListPdf(meeting, attendees)
    case "PRIVACY_CONSENT":
      return generatePrivacyConsentPdf(meeting, attendees)
    case "SECURITY_PLEDGE":
      return generateSecurityPledgePdf(meeting, attendees)
    default:
      throw new Error(`Unknown form type: ${formType}`)
  }
}

/**
 * Generate Attendee List PDF
 */
function generateAttendeeListPdf(
  meeting: Meeting,
  attendees: Attendee[]
): GeneratePdfResult {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const { MARGIN, FONT_SIZE, LINE_HEIGHT, TABLE } = PDF_CONFIG
  const pageWidth = PDF_CONFIG.PAGE_WIDTH - MARGIN.LEFT - MARGIN.RIGHT
  let y = MARGIN.TOP

  // Title
  doc.setFontSize(FONT_SIZE.TITLE)
  doc.text(ATTENDEE_LIST_TEMPLATE.TITLE, PDF_CONFIG.PAGE_WIDTH / 2, y, { align: "center" })
  y += LINE_HEIGHT * 2

  // Meeting Info
  doc.setFontSize(FONT_SIZE.BODY)
  doc.text(`회의명: ${meeting.title}`, MARGIN.LEFT, y)
  y += LINE_HEIGHT
  doc.text(`일시: ${formatPdfDateTime(meeting.dateTime)}`, MARGIN.LEFT, y)
  y += LINE_HEIGHT
  doc.text(`장소: ${meeting.location}`, MARGIN.LEFT, y)
  y += LINE_HEIGHT
  doc.text(`주관부서: ${meeting.hostDepartment}`, MARGIN.LEFT, y)
  y += LINE_HEIGHT * 2

  // Table Header
  const columns = ATTENDEE_LIST_TEMPLATE.COLUMNS
  const widths = ATTENDEE_LIST_TEMPLATE.COLUMN_WIDTHS
  let x = MARGIN.LEFT

  doc.setFillColor(240, 240, 240)
  doc.rect(MARGIN.LEFT, y, pageWidth, TABLE.HEADER_HEIGHT, "F")
  doc.setFontSize(FONT_SIZE.SMALL)

  columns.forEach((col, i) => {
    doc.text(col, x + widths[i] / 2, y + TABLE.HEADER_HEIGHT / 2 + 2, { align: "center" })
    x += widths[i]
  })

  y += TABLE.HEADER_HEIGHT

  // Table Rows
  const filteredAttendees = attendees.filter((a) => a.selectedForms.includes("ATTENDEE_LIST"))

  filteredAttendees.forEach((attendee, index) => {
    x = MARGIN.LEFT

    // Draw row border
    doc.rect(MARGIN.LEFT, y, pageWidth, TABLE.ROW_HEIGHT)

    // Row data
    const rowData = [
      String(index + 1),
      attendee.department,
      attendee.position,
      attendee.name,
      "", // Signature placeholder
    ]

    rowData.forEach((data, i) => {
      doc.text(data, x + widths[i] / 2, y + TABLE.ROW_HEIGHT / 2 + 2, { align: "center" })
      x += widths[i]
    })

    // Add signature if available
    if (attendee.signatureData) {
      try {
        const sigX = MARGIN.LEFT + widths.slice(0, 4).reduce((a, b) => a + b, 0)
        doc.addImage(attendee.signatureData, "PNG", sigX + 2, y + 1, widths[4] - 4, TABLE.ROW_HEIGHT - 2)
      } catch (error) {
        console.error("Failed to add signature image:", error)
      }
    }

    y += TABLE.ROW_HEIGHT
  })

  // Footer
  y = PDF_CONFIG.PAGE_HEIGHT - MARGIN.BOTTOM - LINE_HEIGHT
  doc.setFontSize(FONT_SIZE.SMALL)
  doc.text(formatPdfDate(new Date()), PDF_CONFIG.PAGE_WIDTH / 2, y, { align: "center" })

  const blob = doc.output("blob")
  const filename = `참석자명단_${meeting.title}_${formatPdfDate(new Date())}.pdf`

  return { blob, filename }
}

/**
 * Generate Privacy Consent PDF
 */
function generatePrivacyConsentPdf(
  meeting: Meeting,
  attendees: Attendee[]
): GeneratePdfResult {
  const doc = new jsPDF({
    orientation: "landscape", // Landscape for wide table
    unit: "mm",
    format: "a4",
  })

  const { MARGIN, FONT_SIZE, LINE_HEIGHT } = PDF_CONFIG
  const pageWidth = PDF_CONFIG.PAGE_HEIGHT - MARGIN.LEFT - MARGIN.RIGHT // Swapped for landscape
  let y = MARGIN.TOP

  // Title
  doc.setFontSize(FONT_SIZE.TITLE)
  doc.text(PRIVACY_CONSENT_TEMPLATE.TITLE, PDF_CONFIG.PAGE_HEIGHT / 2, y, { align: "center" })
  y += LINE_HEIGHT * 2

  // Meeting Info
  doc.setFontSize(FONT_SIZE.BODY)
  doc.text(`회의명: ${meeting.title}`, MARGIN.LEFT, y)
  y += LINE_HEIGHT
  doc.text(`일시/장소: ${formatPdfDateTime(meeting.dateTime)} / ${meeting.location}`, MARGIN.LEFT, y)
  y += LINE_HEIGHT
  doc.text(`주관부서: ${meeting.hostDepartment}`, MARGIN.LEFT, y)
  y += LINE_HEIGHT * 2

  // Consent Sections
  Object.values(PRIVACY_CONSENT_TEMPLATE.SECTIONS).forEach((section) => {
    doc.setFontSize(FONT_SIZE.HEADING)
    doc.text(section.TITLE, MARGIN.LEFT, y)
    y += LINE_HEIGHT

    doc.setFontSize(FONT_SIZE.SMALL)
    const lines = section.CONTENT.split("\n")
    lines.forEach((line) => {
      doc.text(line, MARGIN.LEFT + 5, y)
      y += LINE_HEIGHT * 0.8
    })
    y += LINE_HEIGHT * 0.5
  })

  y += LINE_HEIGHT

  // Note: Full table implementation would require pagination
  // This is a simplified version

  doc.setFontSize(FONT_SIZE.SMALL)
  doc.text("* 상세 개인정보는 별도 관리됩니다.", MARGIN.LEFT, y)

  // Footer with date
  y = PDF_CONFIG.PAGE_WIDTH - MARGIN.BOTTOM - LINE_HEIGHT
  doc.setFontSize(FONT_SIZE.BODY)
  doc.text(formatPdfDate(new Date()), PDF_CONFIG.PAGE_HEIGHT / 2, y, { align: "center" })

  const blob = doc.output("blob")
  const filename = `개인정보동의서_${meeting.title}_${formatPdfDate(new Date())}.pdf`

  return { blob, filename }
}

/**
 * Generate Security Pledge PDF
 */
function generateSecurityPledgePdf(
  meeting: Meeting,
  attendees: Attendee[]
): GeneratePdfResult {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const { MARGIN, FONT_SIZE, LINE_HEIGHT } = PDF_CONFIG
  const pageWidth = PDF_CONFIG.PAGE_WIDTH - MARGIN.LEFT - MARGIN.RIGHT

  // Filter attendees who selected security pledge
  const pledgeAttendees = attendees.filter((a) => a.selectedForms.includes("SECURITY_PLEDGE"))

  pledgeAttendees.forEach((attendee, index) => {
    if (index > 0) {
      doc.addPage()
    }

    let y = MARGIN.TOP + 20

    // Form Number
    doc.setFontSize(FONT_SIZE.SMALL)
    doc.text(SECURITY_PLEDGE_TEMPLATE.FORM_NUMBER, PDF_CONFIG.PAGE_WIDTH - MARGIN.RIGHT, MARGIN.TOP, {
      align: "right",
    })

    // Title
    doc.setFontSize(FONT_SIZE.TITLE + 4)
    doc.text(SECURITY_PLEDGE_TEMPLATE.TITLE, PDF_CONFIG.PAGE_WIDTH / 2, y, { align: "center" })
    y += LINE_HEIGHT * 4

    // Content
    doc.setFontSize(FONT_SIZE.BODY + 1)
    const content = SECURITY_PLEDGE_TEMPLATE.CONTENT_TEMPLATE(meeting.title, meeting.topic)
    const contentLines = doc.splitTextToSize(content.trim(), pageWidth)
    doc.text(contentLines, MARGIN.LEFT, y)
    y += contentLines.length * LINE_HEIGHT + LINE_HEIGHT * 4

    // Date
    doc.text(formatPdfDate(new Date()), PDF_CONFIG.PAGE_WIDTH / 2, y, { align: "center" })
    y += LINE_HEIGHT * 4

    // Attendee Info with signature
    const fieldStartX = PDF_CONFIG.PAGE_WIDTH / 2 - 30

    doc.text(`소 속 : ${attendee.department}`, fieldStartX, y)
    y += LINE_HEIGHT * 1.5
    doc.text(`직 위 : ${attendee.position}`, fieldStartX, y)
    y += LINE_HEIGHT * 1.5
    doc.text(`성 명 : ${attendee.name}`, fieldStartX, y)

    // Add signature if available
    if (attendee.signatureData) {
      try {
        doc.addImage(
          attendee.signatureData,
          "PNG",
          fieldStartX + 50,
          y - 15,
          40,
          20
        )
      } catch (error) {
        console.error("Failed to add signature image:", error)
      }
    }

    y += LINE_HEIGHT * 4

    // Footer
    doc.setFontSize(FONT_SIZE.BODY)
    doc.text(SECURITY_PLEDGE_TEMPLATE.FOOTER, PDF_CONFIG.PAGE_WIDTH / 2, y, { align: "center" })
  })

  const blob = doc.output("blob")
  const filename = `서약서_${meeting.title}_${formatPdfDate(new Date())}.pdf`

  return { blob, filename }
}

/**
 * Download PDF file
 */
export function downloadPdf(result: GeneratePdfResult): void {
  const url = URL.createObjectURL(result.blob)
  const link = document.createElement("a")
  link.href = url
  link.download = result.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
