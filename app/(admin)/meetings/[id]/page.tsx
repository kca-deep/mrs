"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  PencilEdit02Icon,
  Download01Icon,
  Copy01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Pdf01Icon,
  QrCodeIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
import { MEETING_STATUS, FORM_TYPES, ATTENDEE_STATUS, ROUTES } from "@/lib/constants"
import type { Meeting, Attendee, MeetingStatus, FormType, AttendeeStatus } from "@/types"

// Mock data for development
const MOCK_MEETING: Meeting & { attendees: Attendee[] } = {
  id: "1",
  title: "2024년 1분기 사업계획 자문회의",
  topic: "사업계획 검토 및 자문",
  dateTime: new Date("2024-03-15T14:00:00"),
  location: "본관 3층 대회의실",
  hostId: "1",
  hostDepartment: "기획조정실",
  allowedForms: ["PRIVACY_CONSENT", "SECURITY_PLEDGE"] as FormType[],
  allowWalkIn: true,
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
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false)
  const [isCopied, setIsCopied] = React.useState(false)

  const signedCount = meeting.attendees.filter((a) => a.status === "SIGNED").length
  const totalCount = meeting.attendees.length
  const signatureRate = totalCount > 0 ? (signedCount / totalCount) * 100 : 0

  const signUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/sign/${meeting.accessToken}`

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
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

  const getAttendeeStatusBadge = (status: AttendeeStatus) => {
    const statusInfo = ATTENDEE_STATUS[status]
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" render={<Link href={ROUTES.MEETINGS} />}>
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 size-4" />
          목록으로
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{meeting.title}</h1>
            {getStatusBadge(meeting.status)}
          </div>
          <p className="mt-1 text-muted-foreground">{meeting.topic}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href={`${ROUTES.MEETINGS}/${meetingId}/edit`} />}>
            <HugeiconsIcon icon={PencilEdit02Icon} className="mr-2 size-4" />
            수정
          </Button>
          {meeting.status === "OPEN" && (
            <Button variant="outline" onClick={() => setIsCloseMeetingDialogOpen(true)}>
              회의 종료
            </Button>
          )}
        </div>
      </div>

      {/* Meeting Info & QR Code */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Meeting Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>회의 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">일시</dt>
                <dd className="mt-1">{formatDateTime(meeting.dateTime)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">장소</dt>
                <dd className="mt-1">{meeting.location}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">주관부서</dt>
                <dd className="mt-1">{meeting.hostDepartment}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">사용 양식</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {meeting.allowedForms.map((form) => (
                    <Badge key={form} variant="secondary">
                      {FORM_TYPES[form].label}
                    </Badge>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">URL 만료시간</dt>
                <dd className="mt-1">{formatDateTime(meeting.expiresAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">등록일</dt>
                <dd className="mt-1">{formatDateTime(meeting.createdAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={QrCodeIcon} className="size-5" />
              서명 QR코드
            </CardTitle>
            <CardDescription>참석자가 스캔하여 서명할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {/* QR Code Placeholder */}
            <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
              <div className="text-center text-sm text-muted-foreground">
                <HugeiconsIcon icon={QrCodeIcon} className="mx-auto mb-2 size-12" />
                <p>QR코드</p>
                <p className="text-xs">(qrcode.react 연동 예정)</p>
              </div>
            </div>

            {/* Sign URL */}
            <div className="w-full space-y-2">
              <p className="text-center text-xs text-muted-foreground">서명 URL</p>
              <div className="flex gap-2">
                <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs">
                  {signUrl}
                </code>
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  <HugeiconsIcon
                    icon={isCopied ? CheckmarkCircle02Icon : Copy01Icon}
                    className="size-4"
                  />
                </Button>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <HugeiconsIcon icon={Download01Icon} className="mr-2 size-4" />
              QR코드 다운로드
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Signature Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>서명 현황</CardTitle>
              <CardDescription>
                {signedCount}명 완료 / 총 {totalCount}명
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Progress value={signatureRate} className="h-2 w-32" />
                <span className="text-sm font-medium">{Math.round(signatureRate)}%</span>
              </div>
              <Button onClick={handleGeneratePdf} disabled={isGeneratingPdf || signedCount === 0}>
                <HugeiconsIcon icon={Pdf01Icon} className="mr-2 size-4" />
                {isGeneratingPdf ? "생성 중..." : "PDF 생성"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No.</TableHead>
                <TableHead>성명</TableHead>
                <TableHead>소속</TableHead>
                <TableHead>직위</TableHead>
                <TableHead>선택 양식</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>서명 시간</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meeting.attendees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    아직 참석자가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                meeting.attendees.map((attendee, index) => (
                  <TableRow key={attendee.id}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium">{attendee.name}</TableCell>
                    <TableCell>{attendee.department}</TableCell>
                    <TableCell>{attendee.position}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {attendee.selectedForms.map((form) => (
                          <Badge key={form} variant="outline" className="text-xs">
                            {FORM_TYPES[form].label}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getAttendeeStatusBadge(attendee.status)}</TableCell>
                    <TableCell>
                      {attendee.signedAt ? (
                        <div className="flex items-center gap-1 text-sm">
                          <HugeiconsIcon icon={Clock01Icon} className="size-3" />
                          {formatTime(attendee.signedAt)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
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
    </div>
  )
}
