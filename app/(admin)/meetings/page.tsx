"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Search01Icon,
  ViewIcon,
  PencilEdit02Icon,
  Delete02Icon,
  FilterIcon,
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Progress } from "@/components/ui/progress"
import { MEETING_STATUS, FORM_TYPES, ROUTES } from "@/lib/constants"
import type { Meeting, MeetingStatus, FormType } from "@/types"

// Mock data for development
const MOCK_MEETINGS: (Meeting & { attendeeCount: number; signedCount: number })[] = [
  {
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
    dateTime: new Date("2024-03-20T10:00:00"),
    location: "별관 2층 회의실A",
    hostId: "2",
    hostDepartment: "정보보안팀",
    allowedForms: ["ATTENDEE_LIST", "SECURITY_PLEDGE"] as FormType[],
    allowWalkIn: true,
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
    dateTime: new Date("2024-02-28T15:00:00"),
    location: "본관 5층 소회의실",
    hostId: "1",
    hostDepartment: "정보화전략팀",
    allowedForms: ["ATTENDEE_LIST"] as FormType[],
    allowWalkIn: true,
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
    dateTime: new Date("2024-03-25T09:00:00"),
    location: "본관 4층 중회의실",
    hostId: "2",
    hostDepartment: "예산관리팀",
    allowedForms: ["PRIVACY_CONSENT"] as FormType[],
    allowWalkIn: false,
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
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>(ALL_STATUS_VALUE)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [deletingMeeting, setDeletingMeeting] = React.useState<(typeof MOCK_MEETINGS)[0] | null>(
    null
  )

  // Filter meetings
  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === ALL_STATUS_VALUE || meeting.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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

  const getFormTypeBadges = (forms: FormType[]) => {
    return forms.map((form) => (
      <Badge key={form} variant="secondary" className="mr-1 text-xs">
        {FORM_TYPES[form].label}
      </Badge>
    ))
  }

  const getSignatureProgress = (signed: number, total: number) => {
    const percentage = total > 0 ? (signed / total) * 100 : 0
    return (
      <div className="flex items-center gap-2">
        <Progress value={percentage} className="h-2 w-20" />
        <span className="text-sm text-muted-foreground">
          {signed}/{total}
        </span>
      </div>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">회의 관리</h1>
          <p className="text-muted-foreground">회의방을 등록하고 서명 현황을 관리합니다.</p>
        </div>
        <Button render={<Link href={ROUTES.MEETINGS_NEW} />}>
          <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" />
          회의 등록
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>전체 회의</CardDescription>
            <CardTitle className="text-3xl">{meetings.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>진행중</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {meetings.filter((m) => m.status === "OPEN").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>종료</CardDescription>
            <CardTitle className="text-3xl text-gray-600">
              {meetings.filter((m) => m.status === "CLOSED").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>완료</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {meetings.filter((m) => m.status === "COMPLETED").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>회의 목록</CardTitle>
          <CardDescription>등록된 회의 {filteredMeetings.length}건</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="회의명, 주제, 장소로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={FilterIcon} className="size-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(value) => value && setStatusFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STATUS_VALUE}>전체 상태</SelectItem>
                  {Object.values(MEETING_STATUS).map((status) => (
                    <SelectItem key={status.code} value={status.code}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>회의명</TableHead>
                  <TableHead>일시</TableHead>
                  <TableHead>장소</TableHead>
                  <TableHead>양식</TableHead>
                  <TableHead>서명현황</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="w-[120px]">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMeetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{meeting.title}</p>
                          <p className="text-sm text-muted-foreground">{meeting.topic}</p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(meeting.dateTime)}
                      </TableCell>
                      <TableCell>{meeting.location}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getFormTypeBadges(meeting.allowedForms)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getSignatureProgress(meeting.signedCount, meeting.attendeeCount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(meeting.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            render={<Link href={`${ROUTES.MEETINGS}/${meeting.id}`} />}
                          >
                            <HugeiconsIcon icon={ViewIcon} className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            render={<Link href={`${ROUTES.MEETINGS}/${meeting.id}/edit`} />}
                          >
                            <HugeiconsIcon icon={PencilEdit02Icon} className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(meeting)}
                          >
                            <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
