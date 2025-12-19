"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Add01Icon,
  Delete02Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FORM_TYPES, ROUTES, LAYOUT } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { FormType, PreRegisteredAttendee, MeetingStatus, AttendeeStatus } from "@/types"

interface MeetingFormData {
  title: string
  topic: string
  date: Date | undefined
  startTime: string
  endTime: string
  location: string
  hostDepartment: string
  allowedForms: FormType[]
}

interface AttendeeFormData {
  name: string
  phoneNumber: string
  assignedForms: FormType[]
}

const TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) =>
  ["00", "30"].map((minute) => ({
    value: `${String(hour).padStart(2, "0")}:${minute}`,
    label: `${String(hour).padStart(2, "0")}:${minute}`,
  }))
).flat()

const INITIAL_ATTENDEE: AttendeeFormData = {
  name: "",
  phoneNumber: "",
  assignedForms: [],
}

// Mock data for development
const MOCK_MEETING = {
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
      status: "PENDING" as AttendeeStatus,
    },
    {
      id: "pre2",
      meetingId: "1",
      name: "이영희",
      phoneNumber: "01087654321",
      assignedForms: ["PRIVACY_CONSENT"] as FormType[],
      status: "PENDING" as AttendeeStatus,
    },
  ],
}

export default function EditMeetingPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = params.id as string

  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formData, setFormData] = React.useState<MeetingFormData>({
    title: "",
    topic: "",
    date: undefined,
    startTime: "14:00",
    endTime: "16:00",
    location: "",
    hostDepartment: "",
    allowedForms: [],
  })

  // Pre-registered attendees state
  const [preRegisteredAttendees, setPreRegisteredAttendees] = React.useState<
    PreRegisteredAttendee[]
  >([])
  const [isAttendeeDialogOpen, setIsAttendeeDialogOpen] = React.useState(false)
  const [editingAttendee, setEditingAttendee] = React.useState<PreRegisteredAttendee | null>(null)
  const [attendeeFormData, setAttendeeFormData] = React.useState<AttendeeFormData>(INITIAL_ATTENDEE)

  // Load meeting data
  React.useEffect(() => {
    const loadMeeting = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        const meeting = MOCK_MEETING

        setFormData({
          title: meeting.title,
          topic: meeting.topic,
          date: new Date(meeting.date),
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          location: meeting.location,
          hostDepartment: meeting.hostDepartment,
          allowedForms: meeting.allowedForms,
        })

        setPreRegisteredAttendees(meeting.preRegisteredAttendees)
      } catch (error) {
        console.error("Failed to load meeting:", error)
        alert("회의 정보를 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    loadMeeting()
  }, [meetingId])

  const formatDate = (date: Date | undefined) => {
    if (!date) return "날짜 선택"
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const handleFormTypeToggle = (formType: FormType) => {
    setFormData((prev) => ({
      ...prev,
      allowedForms: prev.allowedForms.includes(formType)
        ? prev.allowedForms.filter((f) => f !== formType)
        : [...prev.allowedForms, formType],
    }))
  }

  // Attendee management functions
  const openAttendeeDialog = (attendee?: PreRegisteredAttendee) => {
    if (attendee) {
      setEditingAttendee(attendee)
      setAttendeeFormData({
        name: attendee.name,
        phoneNumber: attendee.phoneNumber,
        assignedForms: attendee.assignedForms,
      })
    } else {
      setEditingAttendee(null)
      setAttendeeFormData(INITIAL_ATTENDEE)
    }
    setIsAttendeeDialogOpen(true)
  }

  const closeAttendeeDialog = () => {
    setIsAttendeeDialogOpen(false)
    setEditingAttendee(null)
    setAttendeeFormData(INITIAL_ATTENDEE)
  }

  const handleAttendeeFormToggle = (formType: FormType) => {
    setAttendeeFormData((prev) => ({
      ...prev,
      assignedForms: prev.assignedForms.includes(formType)
        ? prev.assignedForms.filter((f) => f !== formType)
        : [...prev.assignedForms, formType],
    }))
  }

  const handleSaveAttendee = () => {
    if (!attendeeFormData.name.trim() || !attendeeFormData.phoneNumber.trim()) {
      alert("이름과 전화번호를 입력해주세요.")
      return
    }

    if (attendeeFormData.assignedForms.length === 0) {
      alert("최소 하나의 양식을 선택해주세요.")
      return
    }

    if (editingAttendee) {
      // Update existing attendee
      setPreRegisteredAttendees((prev) =>
        prev.map((a) =>
          a.id === editingAttendee.id
            ? { ...a, ...attendeeFormData }
            : a
        )
      )
    } else {
      // Add new attendee
      const newAttendee: PreRegisteredAttendee = {
        id: `temp-${Date.now()}`,
        meetingId: meetingId,
        name: attendeeFormData.name,
        phoneNumber: attendeeFormData.phoneNumber,
        assignedForms: attendeeFormData.assignedForms,
        status: "PENDING",
      }
      setPreRegisteredAttendees((prev) => [...prev, newAttendee])
    }

    closeAttendeeDialog()
  }

  const handleDeleteAttendee = (attendeeId: string) => {
    setPreRegisteredAttendees((prev) => prev.filter((a) => a.id !== attendeeId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.date) {
      alert("날짜를 선택해주세요.")
      return
    }

    if (formData.allowedForms.length === 0) {
      alert("최소 하나의 서명 양식을 선택해주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Implement API call
      console.log("Updating meeting:", {
        id: meetingId,
        ...formData,
        preRegisteredAttendees,
      })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      router.push(`${ROUTES.MEETINGS}/${meetingId}`)
    } catch (error) {
      console.error("Failed to update meeting:", error)
      alert("회의 수정에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`${LAYOUT.PAGE_CONTAINER} space-y-6`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-6 w-24" />
          <div className="w-16" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-4 pt-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="mt-4 h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className={`${LAYOUT.PAGE_CONTAINER} space-y-6`}>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" render={<Link href={`${ROUTES.MEETINGS}/${meetingId}`} />}>
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 size-4" />
          상세
        </Button>
        <h1 className="text-lg font-semibold">회의 수정</h1>
        <div className="w-16" />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Basic Info */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="title">회의명</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="2024년 1분기 사업계획 자문회의"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">회의 주제</Label>
                <Textarea
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="사업계획 검토 및 자문"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>날짜</Label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                      />
                    }
                  >
                    {formatDate(formData.date)}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData({ ...formData, date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime">시작 시간</Label>
                  <Select
                    value={formData.startTime}
                    onValueChange={(value) => value && setFormData({ ...formData, startTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">종료 시간</Label>
                  <Select
                    value={formData.endTime}
                    onValueChange={(value) => value && setFormData({ ...formData, endTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">장소</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="본관 3층 대회의실"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hostDepartment">주관부서</Label>
                  <Input
                    id="hostDepartment"
                    value={formData.hostDepartment}
                    onChange={(e) => setFormData({ ...formData, hostDepartment: e.target.value })}
                    placeholder="기획조정실"
                    required
                  />
                </div>
              </div>

              {/* Form Type Selection */}
              <div className="space-y-3">
                <Label>서명 양식</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(FORM_TYPES).map((formType) => (
                    <Badge
                      key={formType.code}
                      variant={formData.allowedForms.includes(formType.code as FormType) ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5"
                      onClick={() => handleFormTypeToggle(formType.code as FormType)}
                    >
                      {formType.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Pre-registered Attendees */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Label>사전 등록 참석자</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openAttendeeDialog()}
                  disabled={formData.allowedForms.length === 0}
                >
                  <HugeiconsIcon icon={Add01Icon} className="mr-1.5 size-3.5" />
                  추가
                </Button>
              </div>

              <div className="mt-4">
                {preRegisteredAttendees.length > 0 ? (
                  <div className="space-y-2">
                    {preRegisteredAttendees.map((attendee) => (
                      <div
                        key={attendee.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{attendee.name}</span>
                            <span className="text-sm text-muted-foreground">{attendee.phoneNumber}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {attendee.assignedForms.map((form) => (
                              <Badge key={form} variant="secondary" className="text-xs">
                                {FORM_TYPES[form].label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openAttendeeDialog(attendee)}
                          >
                            <HugeiconsIcon icon={PencilEdit02Icon} className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAttendee(attendee.id)}
                          >
                            <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">
                      {formData.allowedForms.length === 0
                        ? "서명 양식을 먼저 선택하세요."
                        : "등록된 참석자가 없습니다."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" render={<Link href={`${ROUTES.MEETINGS}/${meetingId}`} />}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>

      {/* Attendee Dialog */}
      <Dialog open={isAttendeeDialogOpen} onOpenChange={setIsAttendeeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAttendee ? "참석자 수정" : "참석자 추가"}</DialogTitle>
            <DialogDescription>
              참석자 정보를 입력하고 서명할 양식을 지정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="attendeeName">이름 *</Label>
              <Input
                id="attendeeName"
                value={attendeeFormData.name}
                onChange={(e) =>
                  setAttendeeFormData({ ...attendeeFormData, name: e.target.value })
                }
                placeholder="홍길동"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendeePhone">전화번호 *</Label>
              <Input
                id="attendeePhone"
                value={attendeeFormData.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  setAttendeeFormData({ ...attendeeFormData, phoneNumber: value })
                }}
                placeholder="01012345678"
                inputMode="tel"
              />
              <p className="text-xs text-muted-foreground">
                QR 스캔 후 본인 확인에 사용됩니다.
              </p>
            </div>
            <div className="space-y-2">
              <Label>서명 양식 *</Label>
              <div className="space-y-2">
                {formData.allowedForms.map((formType) => (
                  <div
                    key={formType}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border p-3 transition-colors",
                      attendeeFormData.assignedForms.includes(formType)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <Checkbox
                      id={`attendee-${formType}`}
                      checked={attendeeFormData.assignedForms.includes(formType)}
                      onCheckedChange={() => handleAttendeeFormToggle(formType)}
                    />
                    <Label
                      htmlFor={`attendee-${formType}`}
                      className="flex-1 cursor-pointer"
                    >
                      {FORM_TYPES[formType].label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeAttendeeDialog}>
              취소
            </Button>
            <Button type="button" onClick={handleSaveAttendee}>
              {editingAttendee ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
