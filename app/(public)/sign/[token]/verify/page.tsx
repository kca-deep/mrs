"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MobileLayout, MobileFooter } from "@/components/layout/mobile-layout"
import type { Meeting, PreRegisteredAttendee, FormType, MeetingStatus } from "@/types"

// Mock data for development
const MOCK_MEETING: Meeting & { preRegisteredAttendees: PreRegisteredAttendee[] } = {
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
  preRegisteredAttendees: [
    {
      id: "pre1",
      meetingId: "1",
      name: "김철수",
      phoneNumber: "01012345678",
      assignedForms: ["PRIVACY_CONSENT", "SECURITY_PLEDGE"] as FormType[],
      status: "PENDING",
    },
    {
      id: "pre2",
      meetingId: "1",
      name: "이영희",
      phoneNumber: "01087654321",
      assignedForms: ["PRIVACY_CONSENT"] as FormType[],
      status: "PENDING",
    },
  ],
}

export default function VerifyPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [error, setError] = React.useState("")
  const [isVerifying, setIsVerifying] = React.useState(false)

  // TODO: Fetch meeting data from API
  const meeting = MOCK_MEETING

  const handleVerify = async () => {
    if (!phoneNumber.trim()) {
      setError("전화번호를 입력해주세요.")
      return
    }

    if (phoneNumber.length < 10) {
      setError("올바른 전화번호를 입력해주세요.")
      return
    }

    setIsVerifying(true)
    setError("")

    try {
      // TODO: Implement actual API call to verify phone number
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Check if phone number matches a pre-registered attendee
      const preRegistered = meeting.preRegisteredAttendees?.find(
        (a) => a.phoneNumber === phoneNumber
      )

      if (preRegistered) {
        // Pre-registered attendee found - store their info and assigned forms
        sessionStorage.setItem("preRegisteredAttendee", JSON.stringify(preRegistered))
        sessionStorage.setItem("selectedForms", JSON.stringify(preRegistered.assignedForms))
        sessionStorage.setItem("isPreRegistered", "true")
        router.push(`/sign/${token}/agree`)
      } else {
        // Not pre-registered - go to form selection (walk-in always allowed)
        sessionStorage.setItem("isPreRegistered", "false")
        sessionStorage.setItem("attendeePhone", phoneNumber)
        router.push(`/sign/${token}/select-form`)
      }
    } catch {
      setError("확인 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setPhoneNumber(value)
    if (error) setError("")
  }

  return (
    <>
      <MobileLayout
        title="본인 확인"
        subtitle="서명을 위해 전화번호를 확인합니다"
        step={{ current: 2, total: 5, label: "본인 확인" }}
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">전화번호 입력</CardTitle>
              <CardDescription>
                사전 등록된 전화번호로 본인 확인을 진행합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">휴대전화번호</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="01012345678"
                  inputMode="tel"
                  maxLength={11}
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Notice */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs text-muted-foreground">
              사전 등록되지 않은 경우에도 서명이 가능합니다.
            </p>
          </div>
        </div>
      </MobileLayout>

      <MobileFooter>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/sign/${token}`)}
          >
            이전
          </Button>
          <Button
            className="flex-1"
            onClick={handleVerify}
            disabled={isVerifying || !phoneNumber.trim()}
          >
            {isVerifying ? "확인 중..." : "확인"}
          </Button>
        </div>
      </MobileFooter>
    </>
  )
}
