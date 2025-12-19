"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
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
import { MEETING_STATUS, ROUTES } from "@/lib/constants"
import type { Meeting, MeetingStatus, FormType } from "@/types"

// Mock data for development
const MOCK_MEETINGS: (Meeting & { attendeeCount: number; signedCount: number })[] = [
  {
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
    accessToken: "abc123",
    expiresAt: new Date("2024-03-15T18:00:00"),
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
    attendeeCount: 8,
    signedCount: 5,
  },
  {
    id: "2",
    title: "정보보안 정책 수립 회의",
    topic: "연간 정보보안 정책 수립",
    date: new Date("2024-03-20"),
    startTime: "10:00",
    endTime: "12:00",
    location: "별관 2층 회의실A",
    hostId: "2",
    hostDepartment: "정보보안팀",
    allowedForms: ["ATTENDEE_LIST", "SECURITY_PLEDGE"] as FormType[],
    status: "OPEN" as MeetingStatus,
    accessToken: "def456",
    expiresAt: new Date("2024-03-20T12:00:00"),
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
    attendeeCount: 12,
    signedCount: 12,
  },
  {
    id: "3",
    title: "신규 시스템 도입 검토회의",
    topic: "ERP 시스템 도입 검토",
    date: new Date("2024-02-28"),
    startTime: "15:00",
    endTime: "17:00",
    location: "본관 5층 소회의실",
    hostId: "1",
    hostDepartment: "정보화전략팀",
    allowedForms: ["ATTENDEE_LIST"] as FormType[],
    status: "COMPLETED" as MeetingStatus,
    accessToken: "ghi789",
    expiresAt: new Date("2024-02-28T17:00:00"),
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-28"),
    attendeeCount: 6,
    signedCount: 6,
  },
  {
    id: "4",
    title: "예산 집행 점검 회의",
    topic: "2024년 예산 집행 현황 점검",
    date: new Date("2024-03-25"),
    startTime: "09:00",
    endTime: "12:00",
    location: "본관 4층 중회의실",
    hostId: "2",
    hostDepartment: "예산관리팀",
    allowedForms: ["PRIVACY_CONSENT"] as FormType[],
    status: "CLOSED" as MeetingStatus,
    accessToken: "jkl012",
    expiresAt: new Date("2024-03-25T12:00:00"),
    createdAt: new Date("2024-03-18"),
    updatedAt: new Date("2024-03-25"),
    attendeeCount: 10,
    signedCount: 7,
  },
]

const ALL_STATUS_VALUE = "__all__"

export default function MeetingsPage() {
  const [meetings, setMeetings] = React.useState(MOCK_MEETINGS)
  const [statusFilter, setStatusFilter] = React.useState<string>(ALL_STATUS_VALUE)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [deletingMeeting, setDeletingMeeting] = React.useState<(typeof MOCK_MEETINGS)[0] | null>(
    null
  )

  // Filter meetings by status
  const filteredMeetings = meetings.filter((meeting) => {
    return statusFilter === ALL_STATUS_VALUE || meeting.status === statusFilter
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "numeric",
      day: "numeric",
    }).format(date)
  }

  const getStatusWithProgress = (meeting: (typeof MOCK_MEETINGS)[0]) => {
    const statusInfo = MEETING_STATUS[meeting.status]
    const { signedCount, attendeeCount } = meeting

    if (meeting.status === "OPEN") {
      return (
        <Badge variant="outline" className={statusInfo.color}>
          {signedCount}/{attendeeCount} 서명
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className={statusInfo.color}>
        {statusInfo.label} ({signedCount}/{attendeeCount})
      </Badge>
    )
  }

  const handleDelete = () => {
    if (deletingMeeting) {
      setMeetings(meetings.filter((m) => m.id !== deletingMeeting.id))
      setIsDeleteDialogOpen(false)
      setDeletingMeeting(null)
    }
  }

  const openDeleteDialog = (meeting: (typeof MOCK_MEETINGS)[0]) => {
    setDeletingMeeting(meeting)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">회의 관리</h1>
        <Button size="sm" render={<Link href={ROUTES.MEETINGS_NEW} />}>
          <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" />
          회의 등록
        </Button>
      </div>

      {/* Clickable Stats Filter */}
      <div className="flex items-center gap-1 text-[13px]">
        <button
          type="button"
          onClick={() => setStatusFilter(ALL_STATUS_VALUE)}
          className={cn(
            "rounded-md px-2.5 py-1 transition-colors hover:bg-muted",
            statusFilter === ALL_STATUS_VALUE && "bg-muted font-medium"
          )}
        >
          전체 <span className="ml-1 tabular-nums">{meetings.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("OPEN")}
          className={cn(
            "rounded-md px-2.5 py-1 transition-colors hover:bg-muted",
            statusFilter === "OPEN" && "bg-muted font-medium"
          )}
        >
          <span className="mr-1.5 inline-block size-1.5 rounded-full bg-green-500" />
          진행중 <span className="ml-1 tabular-nums">{meetings.filter((m) => m.status === "OPEN").length}</span>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("CLOSED")}
          className={cn(
            "rounded-md px-2.5 py-1 transition-colors hover:bg-muted",
            statusFilter === "CLOSED" && "bg-muted font-medium"
          )}
        >
          <span className="mr-1.5 inline-block size-1.5 rounded-full bg-gray-400" />
          종료 <span className="ml-1 tabular-nums">{meetings.filter((m) => m.status === "CLOSED").length}</span>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("COMPLETED")}
          className={cn(
            "rounded-md px-2.5 py-1 transition-colors hover:bg-muted",
            statusFilter === "COMPLETED" && "bg-muted font-medium"
          )}
        >
          <span className="mr-1.5 inline-block size-1.5 rounded-full bg-blue-500" />
          완료 <span className="ml-1 tabular-nums">{meetings.filter((m) => m.status === "COMPLETED").length}</span>
        </button>
      </div>

      {/* Meeting Cards */}
      {filteredMeetings.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
          <p className="text-[13px] text-muted-foreground">해당 상태의 회의가 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMeetings.map((meeting) => (
            <Card key={meeting.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-[15px] leading-snug">
                    <Link
                      href={`${ROUTES.MEETINGS}/${meeting.id}`}
                      className="hover:underline"
                    >
                      {meeting.title}
                    </Link>
                  </CardTitle>
                  {getStatusWithProgress(meeting)}
                </div>
                <CardDescription className="text-[13px]">
                  {formatDate(meeting.date)} {meeting.startTime}~{meeting.endTime} | {meeting.location}
                </CardDescription>
                <CardAction>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(meeting)}
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                  </Button>
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>회의 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deletingMeeting?.title}&quot; 회의를 삭제하시겠습니까? 관련된 모든 참석자
              정보와 서명 데이터가 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
