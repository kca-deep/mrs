"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  PencilEdit02Icon,
  Copy01Icon,
  CheckmarkCircle02Icon,
  Pdf01Icon,
  QrCodeIcon,
  Location01Icon,
  Calendar03Icon,
  PrinterIcon,
  Download04Icon,
} from "@hugeicons/core-free-icons"
import { QRCodeSVG } from "qrcode.react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MEETING_STATUS, FORM_TYPES, ROUTES } from "@/lib/constants"
import type { Meeting, Attendee, MeetingStatus, FormType, AttendeeStatus } from "@/types"

// Mock data for development
const MOCK_MEETING: Meeting & { attendees: Attendee[] } = {
  id: "1",
  title: "2024년 1분기 사업계획 자문회의",
  topic: "사업계획 검토 및 자문",
  date: new Date("2024-03-15"),
  startTime: "14:00",
  endTime: "16:00",
  location: "본관 3층 대회의실",
  hostId: "1",
  hostDepartment: "기획조정실",
  allowedForms: ["PRIVACY_CONSENT", "SECURITY_PLEDGE"] as FormType[],
  status: "OPEN" as MeetingStatus,
  accessToken: "abc123def456",
  expiresAt: new Date("2024-03-15T18:00:00"),
  createdAt: new Date("2024-03-01"),
  updatedAt: new Date("2024-03-01"),
  attendees: [
    {
      id: "a1",
      meetingId: "1",
      selectedForms: ["PRIVACY_CONSENT", "SECURITY_PLEDGE"] as FormType[],
      name: "김철수",
      department: "한국대학교",
      position: "교수",
      status: "SIGNED" as AttendeeStatus,
      signedAt: new Date("2024-03-15T14:30:00"),
    },
    {
      id: "a2",
      meetingId: "1",
      selectedForms: ["PRIVACY_CONSENT", "SECURITY_PLEDGE"] as FormType[],
      name: "이영희",
      department: "(주)테크솔루션",
      position: "대표이사",
      status: "SIGNED" as AttendeeStatus,
      signedAt: new Date("2024-03-15T14:35:00"),
    },
    {
      id: "a3",
      meetingId: "1",
      selectedForms: ["SECURITY_PLEDGE"] as FormType[],
      name: "박지민",
      department: "한국방송통신전파진흥원",
      position: "팀장",
      status: "SIGNED" as AttendeeStatus,
      signedAt: new Date("2024-03-15T14:40:00"),
    },
    {
      id: "a4",
      meetingId: "1",
      selectedForms: ["PRIVACY_CONSENT"] as FormType[],
      name: "정수연",
      department: "서울연구원",
      position: "연구위원",
      status: "PENDING" as AttendeeStatus,
    },
    {
      id: "a5",
      meetingId: "1",
      selectedForms: ["PRIVACY_CONSENT", "SECURITY_PLEDGE"] as FormType[],
      name: "최민호",
      department: "ICT정책연구소",
      position: "소장",
      status: "PENDING" as AttendeeStatus,
    },
  ],
}

export default function MeetingDetailPage() {
  const params = useParams()
  const meetingId = params.id as string

  const [meeting] = React.useState(MOCK_MEETING)
  const [isCloseMeetingDialogOpen, setIsCloseMeetingDialogOpen] = React.useState(false)
  const [isQrDialogOpen, setIsQrDialogOpen] = React.useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false)
  const [isCopied, setIsCopied] = React.useState(false)

  const signedCount = meeting.attendees.filter((a) => a.status === "SIGNED").length
  const totalCount = meeting.attendees.length
  const signatureRate = totalCount > 0 ? (signedCount / totalCount) * 100 : 0

  const signUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/sign/${meeting.accessToken}`

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(date)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusBadge = (status: MeetingStatus) => {
    const statusInfo = MEETING_STATUS[status]
    return (
      <Badge className={statusInfo.color} variant="outline">
        {statusInfo.label}
      </Badge>
    )
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(signUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleCloseMeeting = () => {
    // TODO: Implement API call
    console.log("Closing meeting:", meetingId)
    setIsCloseMeetingDialogOpen(false)
  }

  const handleDownloadQr = () => {
    const svg = document.getElementById("qr-code-svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngUrl = canvas.toDataURL("image/png")

      const link = document.createElement("a")
      link.download = `QR_${meeting.title}.png`
      link.href = pngUrl
      link.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handlePrintQr = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const svg = document.getElementById("qr-code-svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR코드 - ${meeting.title}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            .title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .info {
              font-size: 14px;
              color: #666;
              margin-bottom: 24px;
            }
            .qr-container {
              padding: 16px;
              border: 2px solid #e5e5e5;
              border-radius: 12px;
            }
            .instruction {
              margin-top: 24px;
              font-size: 16px;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="title">${meeting.title}</div>
          <div class="info">${formatDate(meeting.date)} ${meeting.startTime}~${meeting.endTime} | ${meeting.location}</div>
          <div class="qr-container">${svgData}</div>
          <div class="instruction">QR코드를 스캔하여 서명해주세요</div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true)
    try {
      // TODO: Implement PDF generation API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log("PDF generated for meeting:", meetingId)
      alert("PDF가 생성되었습니다.")
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      alert("PDF 생성에 실패했습니다.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" render={<Link href={ROUTES.MEETINGS} />}>
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 size-4" />
          목록
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" render={<Link href={`${ROUTES.MEETINGS}/${meetingId}/edit`} />}>
            <HugeiconsIcon icon={PencilEdit02Icon} className="mr-2 size-4" />
            수정
          </Button>
          {meeting.status === "OPEN" && (
            <Button variant="outline" size="sm" onClick={() => setIsCloseMeetingDialogOpen(true)}>
              회의 종료
            </Button>
          )}
        </div>
      </div>

      {/* Title & Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{meeting.title}</h1>
          {getStatusBadge(meeting.status)}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsQrDialogOpen(true)}
          >
            <HugeiconsIcon icon={QrCodeIcon} className="mr-1.5 size-4" />
            QR
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
            {formatDate(meeting.date)} {meeting.startTime}~{meeting.endTime}
          </span>
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Location01Icon} className="size-3.5" />
            {meeting.location}
          </span>
          <span>{meeting.hostDepartment}</span>
          {meeting.allowedForms.map((form) => (
            <Badge key={form} variant="secondary" className="text-xs">
              {FORM_TYPES[form].label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Signature Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base">서명 현황</CardTitle>
              <div className="flex items-center gap-2">
                <Progress value={signatureRate} className="h-1.5 w-20" />
                <span className="text-[13px] tabular-nums text-muted-foreground">
                  {signedCount}/{totalCount}
                </span>
              </div>
            </div>
            <Button size="sm" onClick={handleGeneratePdf} disabled={isGeneratingPdf || signedCount === 0}>
              <HugeiconsIcon icon={Pdf01Icon} className="mr-2 size-4" />
              {isGeneratingPdf ? "생성 중..." : "PDF"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>참석자</TableHead>
                <TableHead>양식</TableHead>
                <TableHead className="text-right">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meeting.attendees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                    아직 참석자가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                meeting.attendees.map((attendee) => (
                  <TableRow key={attendee.id}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-[15px] font-medium">{attendee.name}</p>
                        <p className="text-[13px] text-muted-foreground">
                          {attendee.department} {attendee.position}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {attendee.selectedForms.map((form) => (
                          <Badge key={form} variant="secondary" className="text-xs">
                            {FORM_TYPES[form].label}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {attendee.status === "SIGNED" ? (
                        <span className="text-[13px] text-green-600">
                          {formatTime(attendee.signedAt!)}
                        </span>
                      ) : (
                        <span className="text-[13px] text-muted-foreground">대기</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Close Meeting Dialog */}
      <AlertDialog open={isCloseMeetingDialogOpen} onOpenChange={setIsCloseMeetingDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>회의 종료</AlertDialogTitle>
            <AlertDialogDescription>
              회의를 종료하시겠습니까? 종료 후에는 서명 URL이 비활성화되어 더 이상 서명을 받을 수
              없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseMeeting}>종료</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Code Dialog */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>서명 QR코드</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {/* QR Code */}
            <div className="rounded-xl border-2 bg-white p-4" id="qr-code-container">
              <QRCodeSVG id="qr-code-svg" value={signUrl} size={200} level="H" />
            </div>

            {/* URL */}
            <div className="w-full space-y-2">
              <p className="text-center text-sm text-muted-foreground">
                QR코드를 스캔하거나 아래 URL로 접속하세요
              </p>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                <code className="flex-1 truncate text-center text-[13px]">{signUrl}</code>
                <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                  <HugeiconsIcon
                    icon={isCopied ? CheckmarkCircle02Icon : Copy01Icon}
                    className="size-4"
                  />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadQr}
              >
                <HugeiconsIcon icon={Download04Icon} className="mr-1.5 size-4" />
                이미지 저장
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintQr}
              >
                <HugeiconsIcon icon={PrinterIcon} className="mr-1.5 size-4" />
                인쇄
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
