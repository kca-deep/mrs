"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon, Location01Icon, UserIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MobileLayout, MobileFooter } from "@/components/layout/mobile-layout"
import { FORM_TYPES } from "@/lib/constants"
import type { Meeting, FormType, MeetingStatus } from "@/types"

// Mock data for development
const MOCK_MEETING: Meeting = {
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
}

export default function SignMeetingInfoPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [meeting] = React.useState<Meeting | null>(MOCK_MEETING)
  const [isLoading] = React.useState(false)

  // TODO: Implement actual API call to validate token and get meeting info

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(date)
  }

  const handleStart = () => {
    // Store meeting info in session storage for later use
    if (meeting) {
      sessionStorage.setItem(
        "meetingInfo",
        JSON.stringify({
          title: meeting.title,
          topic: meeting.topic,
          location: meeting.location,
          date: meeting.date,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          hostDepartment: meeting.hostDepartment,
          allowedForms: meeting.allowedForms,
        })
      )
    }
    router.push(`/sign/${token}/verify`)
  }

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">회의 정보를 불러오는 중...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (!meeting) {
    router.push(`/sign/${token}/expired`)
    return null
  }

  return (
    <>
      <MobileLayout title="회의 서명" subtitle="회의 정보를 확인해주세요">
        <div className="space-y-6">
          {/* Meeting Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{meeting.title}</CardTitle>
              <CardDescription>{meeting.topic}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  className="mt-0.5 size-5 text-muted-foreground"
                />
                <div>
                  <p className="text-sm font-medium">일시</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(meeting.date)} {meeting.startTime}~{meeting.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HugeiconsIcon
                  icon={Location01Icon}
                  className="mt-0.5 size-5 text-muted-foreground"
                />
                <div>
                  <p className="text-sm font-medium">장소</p>
                  <p className="text-sm text-muted-foreground">{meeting.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HugeiconsIcon icon={UserIcon} className="mt-0.5 size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">주관부서</p>
                  <p className="text-sm text-muted-foreground">{meeting.hostDepartment}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Forms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">서명 양식</CardTitle>
              <CardDescription>본 회의에서 사용 가능한 서명 양식입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {meeting.allowedForms.map((form) => (
                  <Badge key={form} variant="secondary" className="text-sm">
                    {FORM_TYPES[form].label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notice */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              다음 단계에서 전화번호로 본인 확인 후, 서명 양식 선택 및 정보 입력을 진행합니다.
            </p>
          </div>
        </div>
      </MobileLayout>

      <MobileFooter>
        <Button className="w-full" size="lg" onClick={handleStart}>
          서명 시작하기
        </Button>
      </MobileFooter>
    </>
  )
}
